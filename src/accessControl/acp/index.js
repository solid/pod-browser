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

import {
  acp_v1 as acp,
  asUrl,
  getSolidDataset,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import {
  ACL,
  createAccessMap,
  displayPermissions,
  isEmptyAccess,
} from "../../solidClientHelpers/permissions";
import {
  chain,
  createResponder,
  isHTTPError,
} from "../../solidClientHelpers/utils";
import { getOrCreateDataset } from "../../solidClientHelpers/resource";
import { getPolicyUrl } from "../../solidClientHelpers/policies";

export const noAcrAccessError =
  "No access to Access Control Resource for this resource";

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

export function convertAcpToAcl(access) {
  return createAccessMap(
    access.apply.read,
    access.apply.write,
    access.apply.append,
    access.access.read && access.access.write
  );
}

export function getOrCreatePermission(permissions, webId) {
  const permission = permissions[webId] ?? {
    webId,
  };
  permission.acp = permission.acp ?? {
    apply: createAcpMap(),
    access: createAcpMap(),
  };
  return permission;
}

export function getOrCreatePolicy(policyDataset, url) {
  const existingPolicy = acp.getPolicy(policyDataset, url);
  if (existingPolicy) {
    return { policy: existingPolicy, dataset: policyDataset };
  }
  const newPolicy = acp.createPolicy(url);
  const updatedPolicyDataset = acp.setPolicy(policyDataset, newPolicy);
  return { policy: newPolicy, dataset: updatedPolicyDataset };
}

export function getRulesOrCreate(ruleUrls, policy, policyDataset) {
  // assumption: Rules resides in the same resource as the policies
  const rules = ruleUrls
    .map((url) => acp.getRule(policyDataset, url))
    .filter((rule) => !!rule);
  if (rules.length === 0) {
    const ruleUrl = `${asUrl(policy)}Rule`; // e.g. <pod>/policies/.ttl#readPolicyRule
    return { existing: false, rules: [acp.createRule(ruleUrl)] };
  }
  return { existing: true, rules };
}

export function getRuleWithAgent(rules, agentWebId) {
  // assumption 1: the rules for the policies we work with will not have agents across multiple rules
  // assumption 2: there will always be at least one rule (we enforce this with getRulesOrCreate)
  const rule = rules.find((r) =>
    acp.getAgentAll(r).find((webId) => webId === agentWebId)
  );
  // if we don't find the agent in a rule, we'll just pick the first one
  return rule || rules[0];
}

export function setAgents(policy, policyDataset, webId, accessToMode) {
  const ruleUrls = acp.getRequiredRuleUrlAll(policy);
  const { existing, rules } = getRulesOrCreate(ruleUrls, policy, policyDataset);
  const rule = getRuleWithAgent(rules, webId);
  const existingAgents = acp.getAgentAll(rule);
  const agentIndex = existingAgents.indexOf(webId);
  let modifiedRule = rule;
  if (accessToMode && agentIndex === -1) {
    modifiedRule = acp.addAgent(rule, webId);
  }
  if (!accessToMode && agentIndex !== -1) {
    modifiedRule = acp.removeAgent(rule, webId);
  }
  const modifiedDataset = setThing(policyDataset, modifiedRule);
  const modifiedPolicy = existing
    ? acp.setRequiredRuleUrl(policy, modifiedRule)
    : acp.addRequiredRuleUrl(policy, modifiedRule);
  return {
    policy: modifiedPolicy,
    dataset: modifiedDataset,
  };
}

export function getPolicyModesAndAgents(policyUrls, policyDataset) {
  return policyUrls
    .map((url) => acp.getPolicy(policyDataset, url))
    .filter((policy) => !!policy)
    .map((policy) => {
      const modes = acp.getAllowModes(policy);
      const ruleUrls = acp.getRequiredRuleUrlAll(policy);
      // assumption: rule resides in the same resource as policies
      const rules = ruleUrls.map((url) => acp.getRule(policyDataset, url));
      const agents = rules.reduce(
        (memo, rule) => memo.concat(acp.getAgentAll(rule)),
        []
      );
      return {
        modes,
        agents,
      };
    });
}

export function removePermissionsForAgent(webId, policyDataset) {
  return acp.getRuleAll(policyDataset).reduce((dataset, rule) => {
    const modifiedRule = acp.removeAgent(rule, webId);
    return setThing(dataset, modifiedRule);
  }, policyDataset);
}

function updateAllowPolicy(
  policyDataset,
  policyUrl,
  webId,
  accessToMode,
  acpMap
) {
  return chain(
    getOrCreatePolicy(policyDataset, policyUrl),
    ({ policy, dataset }) => ({
      policy: acp.setAllowModes(policy, acpMap),
      dataset,
    }),
    ({ policy, dataset }) => setAgents(policy, dataset, webId, accessToMode),
    ({ policy, dataset }) => acp.setPolicy(dataset, policy)
  );
}

function getAllowAccessPolicy(policyUrl, mode) {
  return `${policyUrl}#${mode}AccessPolicy`;
}

function getAllowApplyPolicy(policyUrl, mode) {
  return `${policyUrl}#${mode}ApplyPolicy`;
}

function ensureAccessControl(policyUrl, datasetWithAcr, changed) {
  const accessControls = acp.getControlAll(datasetWithAcr);
  const existingAccessControl = accessControls.find((ac) =>
    acp.getPolicyUrlAll(ac).find((url) => policyUrl === url)
  );
  return {
    changed: changed || !existingAccessControl,
    acr: existingAccessControl
      ? datasetWithAcr
      : chain(datasetWithAcr, (acr) => acp.addAcrPolicyUrl(acr, policyUrl)),
  };
}

function ensureApplyControl(policyUrl, datasetWithAcr, changed) {
  const accessControls = acp.getControlAll(datasetWithAcr);
  const existingAccessControl = accessControls.find((ac) =>
    acp.getPolicyUrlAll(ac).find((url) => policyUrl === url)
  );
  return {
    changed: changed || !existingAccessControl,
    acr: existingAccessControl
      ? datasetWithAcr
      : acp.setControl(
          datasetWithAcr,
          chain(acp.createControl(), (ac) => acp.addPolicyUrl(ac, policyUrl))
        ),
  };
}

export default class AcpAccessControlStrategy {
  #originalWithAcr;

  #policyUrl;

  #fetch;

  constructor(originalWithAcr, policiesContainer, fetch) {
    this.#originalWithAcr = originalWithAcr;
    this.#policyUrl = getPolicyUrl(originalWithAcr, policiesContainer);
    this.#fetch = fetch;
  }

  async getPermissions() {
    const permissions = {};
    try {
      const policyDataset = await getSolidDataset(this.#policyUrl, {
        fetch: this.#fetch,
      });
      // assigning Read, Write, and Append
      // assumption 1: We know the URLs of the policies we want to check
      getPolicyModesAndAgents(
        [
          getAllowApplyPolicy(this.#policyUrl, "read"),
          getAllowApplyPolicy(this.#policyUrl, "write"),
          getAllowApplyPolicy(this.#policyUrl, "append"),
        ],
        policyDataset
      ).forEach(({ modes, agents }) =>
        agents.forEach((webId) => {
          const permission = getOrCreatePermission(permissions, webId);
          permission.acp.apply = addAcpModes(permission.acp.apply, modes);
          permissions[webId] = permission;
        })
      );
      // assigning Control
      // assumption 2: control access involves another policy URL, but since both have the same modes, we only check one
      getPolicyModesAndAgents(
        [getAllowAccessPolicy(this.#policyUrl, "control")],
        policyDataset
      ).forEach(({ modes, agents }) =>
        agents.forEach((webId) => {
          const permission = getOrCreatePermission(permissions, webId);
          permission.acp.access = addAcpModes(permission.acp.access, modes);
          permissions[webId] = permission;
        })
      );
      // normalize permissions
      return Object.values(permissions).map(({ acp: access, webId }) => {
        const acl = convertAcpToAcl(access);
        return {
          acl,
          alias: displayPermissions(acl),
          webId,
        };
      });
    } catch (error) {
      if (isHTTPError(error.message, 403) || isHTTPError(error.message, 404)) {
        return [];
      }
      throw error;
    }
  }

  saveApplyPolicyForOriginalResource(dataset, webId, access, mode, acpMap) {
    const allowUrl = getAllowApplyPolicy(this.#policyUrl, mode);
    return chain(dataset, (d) =>
      updateAllowPolicy(d, allowUrl, webId, access[mode], acpMap)
    );
  }

  saveAccessPolicyForOriginalResource(dataset, webId, access) {
    const allowUrl = getAllowAccessPolicy(this.#policyUrl, "control");
    const modes = createAcpMap(true, true);
    return chain(dataset, (d) =>
      updateAllowPolicy(d, allowUrl, webId, access.control, modes)
    );
  }

  saveApplyPolicyForPolicyResource(dataset, webId, access) {
    const allowUrl = getAllowApplyPolicy(this.#policyUrl, "control");
    const modes = createAcpMap(true, true);
    return chain(dataset, (d) =>
      updateAllowPolicy(d, allowUrl, webId, access.control, modes)
    );
  }

  updatePermissionsForAgent(webId, access, policyDataset) {
    return chain(
      policyDataset,
      (dataset) =>
        this.saveApplyPolicyForOriginalResource(
          dataset,
          webId,
          access,
          "read",
          createAcpMap(true)
        ),
      (dataset) =>
        this.saveApplyPolicyForOriginalResource(
          dataset,
          webId,
          access,
          "write",
          createAcpMap(false, true)
        ),
      (dataset) =>
        this.saveApplyPolicyForOriginalResource(
          dataset,
          webId,
          access,
          "append",
          createAcpMap(false, false, true)
        ),
      (dataset) =>
        this.saveAccessPolicyForOriginalResource(dataset, webId, access),
      (dataset) => this.saveApplyPolicyForPolicyResource(dataset, webId, access)
    );
  }

  async ensureAccessControlAll() {
    // ensuring access controls for original resource
    const readAllowApply = getAllowApplyPolicy(this.#policyUrl, "read");
    const writeAllowApply = getAllowApplyPolicy(this.#policyUrl, "write");
    const appendAllowApply = getAllowApplyPolicy(this.#policyUrl, "append");
    const controlAllowAcc = getAllowAccessPolicy(this.#policyUrl, "control");
    const { acr: originalAcr, changed: originalChanged } = chain(
      {
        acr: this.#originalWithAcr,
        changed: false,
      },
      ({ acr, changed }) => ensureApplyControl(readAllowApply, acr, changed),
      ({ acr, changed }) => ensureApplyControl(writeAllowApply, acr, changed),
      ({ acr, changed }) => ensureApplyControl(appendAllowApply, acr, changed),
      ({ acr, changed }) => ensureAccessControl(controlAllowAcc, acr, changed)
    );
    if (originalChanged) {
      this.#originalWithAcr = await acp.saveAcrFor(originalAcr, {
        fetch: this.#fetch,
      });
    }
    // ensuring access controls for policy resource
    const policyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
      this.#policyUrl,
      { fetch: this.#fetch }
    );
    const controlAllowApply = getAllowApplyPolicy(this.#policyUrl, "control");
    const { acr: policyAcr, changed: policyChanged } = chain(
      {
        acr: policyDatasetWithAcr,
        changed: false,
      },
      ({ acr, changed }) => ensureApplyControl(controlAllowApply, acr, changed)
    );
    if (policyChanged) {
      await acp.saveAcrFor(policyAcr, { fetch: this.#fetch });
    }
  }

  async savePermissionsForAgent(webId, access) {
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDataset(this.#policyUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);

    const updatedDataset = isEmptyAccess(access)
      ? removePermissionsForAgent(webId, policyDataset)
      : this.updatePermissionsForAgent(webId, access, policyDataset);
    // saving changes to the policy resource
    await saveSolidDatasetAt(this.#policyUrl, updatedDataset, {
      fetch: this.#fetch,
    });
    // saving changes to the ACRs
    await this.ensureAccessControlAll();
    return respond(this.#originalWithAcr);
  }

  static async init(resourceInfo, policiesContainer, fetch) {
    const resourceUrl = getSourceUrl(resourceInfo);
    const datasetWithAcr = await acp.getResourceInfoWithAcr(resourceUrl, {
      fetch,
    });
    if (!acp.hasAccessibleAcr(datasetWithAcr)) {
      throw new Error(noAcrAccessError);
    }
    return new AcpAccessControlStrategy(
      datasetWithAcr,
      policiesContainer,
      fetch
    );
  }
}
