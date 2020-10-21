/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* istanbul ignore file */
// TODO: Remove once Solid Client ACP API is complete

import {
  asUrl,
  getSolidDataset,
  getSourceUrl,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { joinPath } from "../../stringHelpers";
import {
  addControlPolicyUrl,
  addPolicyUrl,
  createAccessControl,
  createPolicy,
  getAccessControlAll,
  getAllowModesOnPolicy,
  getReferencedPolicyUrlAll,
  getPolicy,
  getPolicyAll,
  getPolicyUrlAll,
  getRequiredRuleOnPolicyAll,
  getResourceInfoWithAcp,
  setAccessControl,
  setAllowModesOnPolicy,
  setPolicy,
  setRequiredRuleOnPolicy,
  saveAccessControlResource,
  getAgentForRuleAll,
  createRule,
  getRule,
  setAgentInRule,
  getSolidDatasetWithAcp,
} from "./mockedClientApi";
import { fetchProfile } from "../../solidClientHelpers/profile";
import {
  ACL,
  createAccessMap,
  displayPermissions,
} from "../../solidClientHelpers/permissions";
import {
  chain,
  createResponder,
  sharedStart,
} from "../../solidClientHelpers/utils";
import { getOrCreateDataset } from "../../solidClientHelpers/resource";

const POLICIES_CONTAINER = "policies/";

export function getPoliciesContainerUrl(podRootUri) {
  return joinPath(podRootUri, POLICIES_CONTAINER);
}

export function createAcpMap(read = false, write = false, append = false) {
  return {
    [ACL.READ.key]: read,
    [ACL.WRITE.key]: write,
    [ACL.APPEND.key]: append,
  };
}

export function addAcpModes(existingAcpModes, newAcpModes) {
  return existingAcpModes
    ? createAcpMap(
        existingAcpModes.read || newAcpModes.read,
        existingAcpModes.write || newAcpModes.write,
        existingAcpModes.append || newAcpModes.append
      )
    : newAcpModes;
}

export function convertAcpToAcl(acp) {
  return createAccessMap(
    acp.apply.read,
    acp.apply.write,
    acp.apply.append,
    acp.access.read && acp.access.write
  );
}

export function getOrCreatePermission(permissions, webId) {
  const permission = permissions[webId] ?? {
    webId,
  };
  permission.acp = permissions.acp ?? {
    apply: createAcpMap(),
    access: createAcpMap(),
  };
  return permission;
}

export function getPolicyUrl(resource, policiesContainer) {
  const resourceUrl = getSourceUrl(resource);
  const policiesUrl = getSourceUrl(policiesContainer);
  const matchingStart = sharedStart(resourceUrl, policiesUrl);
  const path = resourceUrl.substr(matchingStart.length);
  return `${getPoliciesContainerUrl(matchingStart) + path}.ttl`;
}

export function getOrCreatePolicy(policyDataset, url) {
  const existingPolicy = getPolicy(policyDataset, url);
  if (existingPolicy) {
    return { policy: existingPolicy, dataset: policyDataset };
  }
  const newPolicy = createPolicy(url);
  const updatedPolicyDataset = setPolicy(policyDataset, newPolicy);
  return { policy: newPolicy, dataset: updatedPolicyDataset };
}

export function getRulesOrCreate(ruleUrls, policy, policyDataset) {
  // assumption: Rules resides in the same resource as the policies
  const rules = ruleUrls
    .map((url) => getRule(policyDataset, url))
    .filter((rule) => !!rule);
  if (rules.length === 0) {
    const ruleUrl = `${asUrl(policy)}Rule`; // e.g. <pod>/policies/.ttl#readPolicyRule
    return [createRule(ruleUrl)];
  }
  return rules;
}

export function getRuleWithAgent(rules, agentWebId) {
  // assumption 1: the rules for the policies we work with will not have agents across multiple rules
  // assumption 2: there will always be at least one rule (we enforce this with getRulesOrCreate)
  const rule = rules.find((r) =>
    getAgentForRuleAll(r).find((webId) => webId === agentWebId)
  );
  // if we don't find the agent in a rule, we'll just pick the first one
  return rule || rules[0];
}

export async function setAgents(policy, policyDataset, webId, accessToMode) {
  const ruleUrls = getRequiredRuleOnPolicyAll(policy);
  const rules = getRulesOrCreate(ruleUrls, policy, policyDataset);
  const rule = getRuleWithAgent(rules, webId);
  const existingAgents = getAgentForRuleAll(rule);
  const agentIndex = existingAgents.indexOf(webId);
  let modifiedAgents;
  if (accessToMode && agentIndex === -1) {
    modifiedAgents = existingAgents.concat(webId);
  }
  if (!accessToMode && agentIndex !== -1) {
    modifiedAgents = existingAgents
      .slice(0, agentIndex)
      .concat(existingAgents.slice(agentIndex + 1));
  }
  const modifiedRule = setAgentInRule(rule, modifiedAgents);
  return setRequiredRuleOnPolicy(policy, modifiedRule);
}

export default class AcpAccessControlStrategy {
  #datasetWithAcr;

  #policyUrl;

  #fetch;

  constructor(datasetWithAcr, policiesContainer, fetch) {
    this.#datasetWithAcr = datasetWithAcr;
    this.#policyUrl = getPolicyUrl(datasetWithAcr, policiesContainer);
    this.#fetch = fetch;
  }

  async getPolicyModesAndAgents(policyUrls) {
    const policyResources = await Promise.all(
      policyUrls.map((url) => getSolidDataset(url, { fetch: this.#fetch }))
    );
    const policies = policyResources
      .map((policyDataset) => ({
        policy: getPolicyAll(policyDataset),
        dataset: policyDataset,
      }))
      .flat();
    return Promise.all(
      policies.map(({ policy, dataset }) => {
        const modes = getAllowModesOnPolicy(policy);
        const ruleUrls = getRequiredRuleOnPolicyAll(policy);
        // assumption: rule resides in the same resource as policies
        const rules = ruleUrls.map((url) => getRule(dataset, url));
        const agents = rules.map((rule) => getAgentForRuleAll(rule)).flat();
        return {
          modes,
          agents,
        };
      })
    );
  }

  async getPermissions() {
    const permissions = {};
    // assigning Read, Write, and Append
    const accessControls = getAccessControlAll(this.#datasetWithAcr);
    const policyUrls = accessControls
      .map((ac) => getPolicyUrlAll(ac).filter((url) => url === this.#policyUrl))
      .flat();
    (await this.getPolicyModesAndAgents(policyUrls)).forEach(
      ({ modes, agents }) =>
        agents.forEach((webId) => {
          const permission = getOrCreatePermission(permissions, webId);
          permission.acp.apply = addAcpModes(permission.acp.apply, modes);
          permissions[webId] = permission;
        })
    );
    // assigning Control
    const controlPolicyUrls = getReferencedPolicyUrlAll(
      this.#datasetWithAcr
    ).filter((url) => url === this.#policyUrl);
    (await this.getPolicyModesAndAgents(controlPolicyUrls)).forEach(
      ({ modes, agents }) =>
        agents.forEach((webId) => {
          const permission = getOrCreatePermission(permissions, webId);
          permission.acp.access = addAcpModes(permission.acp.access, modes);
          permissions[webId] = permission;
        })
    );
    // normalize permissions
    return Promise.all(
      Object.values(permissions).map(async ({ acp, webId }) => {
        const acl = convertAcpToAcl(acp);
        return {
          acl,
          alias: displayPermissions(acl),
          profile: await fetchProfile(webId, this.#fetch),
          webId,
        };
      })
    );
  }

  async saveApplyPolicyWithAgentForOriginalResource(
    policyDataset,
    webId,
    access,
    mode,
    acpMap
  ) {
    const policyUrl = `${this.#policyUrl}#${mode}Policy`;
    const { dataset: modifiedPolicyDataset } = chain(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy: p, dataset: d }) => ({
        policy: setAllowModesOnPolicy(p, acpMap),
        dataset: d,
      }),
      ({ policy: p, dataset: d }) => ({
        policy: setAgents(p, d, webId, access[mode]),
        dataset: d,
      })
    );
    // making sure that policy is connected to access control
    const accessControls = getAccessControlAll(this.#datasetWithAcr);
    let accessControlWithPolicy = accessControls.find((ac) =>
      getPolicyUrlAll(ac).find(policyUrl)
    );
    if (!accessControlWithPolicy) {
      accessControlWithPolicy = chain(createAccessControl(), (ac) =>
        addPolicyUrl(ac, policyUrl)
      );
    }
    this.#datasetWithAcr = setAccessControl(
      this.#datasetWithAcr,
      accessControlWithPolicy
    );
    // return the modified policy dataset
    return modifiedPolicyDataset;
  }

  async saveAccessPolicyWithAgentForOriginalResource(
    policyDataset,
    webId,
    access
  ) {
    const policyUrl = `${this.#policyUrl}#controlAccessPolicy`;
    const existingAccessPolicyUrl = getReferencedPolicyUrlAll(
      this.#datasetWithAcr
    ).find((url) => url === policyUrl);
    const existingPolicy = getPolicy(policyDataset, existingAccessPolicyUrl);
    const accessPolicy = chain(
      existingPolicy || getOrCreatePolicy(policyDataset, policyUrl),
      (p) => setAllowModesOnPolicy(p, createAcpMap(true, true)),
      (p) => setAgents(p, policyDataset, webId, access.control)
    );
    const modifiedPolicyDataset = setPolicy(policyDataset, accessPolicy);
    // making sure that policy is connected to access control
    if (!existingPolicy) {
      this.#datasetWithAcr = await addControlPolicyUrl(
        this.#datasetWithAcr,
        policyUrl
      );
    }
    // return the modified policy dataset
    return modifiedPolicyDataset;
  }

  async saveApplyPolicyWithAgentsForPolicyResource(
    policyDataset,
    webId,
    access
  ) {
    const policyUrl = `${this.#policyUrl}#controlApplyPolicy`;
    const policyDatasetWithAcr = await getSolidDatasetWithAcp(
      getSourceUrl(policyDataset)
    );
    const accessControls = getAccessControlAll(policyDatasetWithAcr);
    const existingAccessPolicyUrl = accessControls
      .map((ac) => getPolicyUrlAll(ac).filter((url) => url === this.#policyUrl))
      .flat();
    const existingPolicy = getPolicy(policyDataset, existingAccessPolicyUrl[0]);
    const applyPolicy = chain(
      existingPolicy || getOrCreatePolicy(policyDataset, policyUrl),
      (p) => setAllowModesOnPolicy(p, createAcpMap(true, true)),
      (p) => setAgents(p, policyDataset, webId, access.control)
    );
    const modifiedPolicyDataset = setPolicy(policyDataset, applyPolicy);
    // making sure that policy is connected to access control
    let accessControlWithPolicy = accessControls.find((ac) =>
      getPolicyUrlAll(ac).find(policyUrl)
    );
    if (!accessControlWithPolicy) {
      accessControlWithPolicy = chain(createAccessControl(), (ac) =>
        addPolicyUrl(ac, policyUrl)
      );
    }
    setAccessControl(policyDatasetWithAcr, accessControlWithPolicy);
    // return the modified policy dataset
    return modifiedPolicyDataset;
  }

  async savePermissionsForAgent(webId, access) {
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDataset(this.#policyUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);

    try {
      const updatedDataset = chain(
        policyDataset,
        async (d) =>
          this.saveApplyPolicyWithAgentForOriginalResource(
            d,
            webId,
            access,
            "read",
            createAcpMap(true)
          ),
        async (d) =>
          this.saveApplyPolicyWithAgentForOriginalResource(
            d,
            webId,
            access,
            "write",
            createAcpMap(false, true)
          ),
        async (d) =>
          this.saveApplyPolicyWithAgentForOriginalResource(
            d,
            webId,
            access,
            "append",
            createAcpMap(false, false, true)
          ),
        async (d) =>
          this.saveAccessPolicyWithAgentForOriginalResource(d, webId, access),
        async (d) =>
          this.saveApplyPolicyWithAgentsForPolicyResource(d, webId, access)
      );
      await saveSolidDatasetAt(this.#policyUrl, updatedDataset);
      this.#datasetWithAcr = await saveAccessControlResource(
        this.#datasetWithAcr
      );
    } catch (err) {
      return error(err.message);
    }
    return respond(this.#datasetWithAcr);
  }

  static async init(resourceInfo, policiesContainer, fetch) {
    const resourceUrl = getSourceUrl(resourceInfo);
    const datasetWithAcr = await getResourceInfoWithAcp(resourceUrl, {
      fetch,
    });
    return new AcpAccessControlStrategy(
      datasetWithAcr,
      policiesContainer,
      fetch
    );
  }
}
