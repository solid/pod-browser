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
  acp_v3 as acp,
  asUrl,
  deleteFile,
  getSolidDataset,
  getSourceUrl,
  isContainer,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import {
  ACL,
  createAccessMap,
  displayPermissions,
  isEmptyAccess,
} from "../../solidClientHelpers/permissions";
import { chain, createResponder } from "../../solidClientHelpers/utils";
import {
  deletePoliciesContainer,
  getOrCreateDatasetOld,
} from "../../solidClientHelpers/resource";
import {
  getPolicyResourceUrl,
  getPolicyUrl,
  isCustomPolicy,
} from "../../models/policy";
import { isHTTPError } from "../../error";
import {
  PUBLIC_AGENT_PREDICATE,
  PUBLIC_AGENT_TYPE,
} from "../../models/contact/public";
import {
  AUTHENTICATED_AGENT_PREDICATE,
  AUTHENTICATED_AGENT_TYPE,
} from "../../models/contact/authenticated";
import { POLICIES_TYPE_MAP } from "../../../constants/policies";

export const noAcrAccessError =
  "No access to Access Control Resource for this resource";

export function createAcpMap(read = false, write = false, append = false) {
  return {
    [ACL.READ.key]: read,
    [ACL.WRITE.key]: write,
    [ACL.APPEND.key]: append,
  };
}
const acpMapForApplyPolicies = {
  editors: createAcpMap(true, true),
  viewers: createAcpMap(true),
  viewAndAdd: createAcpMap(true, false, true),
  editOnly: createAcpMap(false, true),
  addOnly: createAcpMap(false, false, true),
};

export const getPolicyDetailFromAccess = (access, label) => {
  const { read, write, append } = access;
  if (read && write && !append) {
    return POLICIES_TYPE_MAP.editors[label];
  }
  if (read && !write && !append) {
    return POLICIES_TYPE_MAP.viewers[label];
  }
  if (read && append && !write) {
    return POLICIES_TYPE_MAP.viewAndAdd[label];
  }
  if (append && !write && !write) {
    return POLICIES_TYPE_MAP.addOnly[label];
  }
  if (write && !append && !read) {
    return POLICIES_TYPE_MAP.editOnly[label];
  }
  return null;
};

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

export function getOrCreatePermission(
  permissions,
  webId,
  type,
  inherited = false
) {
  const permission = permissions[webId] ?? {
    webId,
  };
  if (type) {
    permission.type = type;
  }
  permission.inherited = inherited;
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
  const ruleUrls = acp.getAllOfRuleUrlAll(policy);
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
    ? acp.setAllOfRuleUrl(policy, modifiedRule)
    : acp.addAllOfRuleUrl(policy, modifiedRule);
  return {
    policy: modifiedPolicy,
    dataset: modifiedDataset,
  };
}

export function setPublicAgent(dataset, policy, access) {
  const rulesUrls = acp.getAllOfRuleUrlAll(policy);
  const { existing, rules } = getRulesOrCreate(rulesUrls, policy, dataset);
  const modifiedRules = rules.map((rule) =>
    access ? acp.setPublic(rule) : acp.removePublic(rule)
  );
  const [modifiedDataset] = modifiedRules.map((modifiedRule) => {
    return setThing(dataset, modifiedRule);
  });
  const [modifiedPolicy] = existing
    ? modifiedRules.map((modifiedRule) =>
        acp.setAllOfRuleUrl(policy, modifiedRule)
      )
    : modifiedRules.map((modifiedRule) =>
        acp.addAllOfRuleUrl(policy, modifiedRule)
      );
  return {
    policy: modifiedPolicy,
    dataset: modifiedDataset,
  };
}

export function setAuthenticatedAgent(dataset, policy, access) {
  const rulesUrls = acp.getAllOfRuleUrlAll(policy);
  const { existing, rules } = getRulesOrCreate(rulesUrls, policy, dataset);
  const modifiedRules = rules.map((rule) => {
    const modifiedRule = access
      ? acp.setAuthenticated(rule)
      : acp.removeAuthenticated(rule);
    return modifiedRule;
  });
  const [modifiedDataset] = modifiedRules.map((modifiedRule) => {
    return setThing(dataset, modifiedRule);
  });
  const [modifiedPolicy] = existing
    ? modifiedRules.map((modifiedRule) =>
        acp.setAllOfRuleUrl(policy, modifiedRule)
      )
    : modifiedRules.map((modifiedRule) =>
        acp.addAllOfRuleUrl(policy, modifiedRule)
      );
  return {
    policy: modifiedPolicy,
    dataset: modifiedDataset,
  };
}

export function getNamedPolicyModesAndAgents(policyUrl, policyDataset) {
  const policy = acp.getPolicy(policyDataset, policyUrl);
  if (!policy) return { modes: {}, agents: [] };
  const modes = acp.getAllowModes(policy);
  const ruleUrls = acp.getAllOfRuleUrlAll(policy);
  // assumption: rule resides in the same resource as policies
  const rules = ruleUrls.map((url) => acp.getRule(policyDataset, url));
  const agents = rules.reduce(
    (memo, rule) => memo.concat(acp.getAgentAll(rule)),
    []
  );
  const [authenticatedStatus] = rules.map((rule) => acp.hasAuthenticated(rule));
  if (authenticatedStatus) {
    agents.unshift(AUTHENTICATED_AGENT_PREDICATE);
  }
  const [publicStatus] = rules.map((rule) => acp.hasPublic(rule));
  if (publicStatus) {
    agents.unshift(PUBLIC_AGENT_PREDICATE);
  }
  return {
    policyUrl,
    modes,
    agents,
  };
}

export function getAgentType(webId) {
  if (webId === PUBLIC_AGENT_PREDICATE) {
    return PUBLIC_AGENT_TYPE;
  }
  if (webId === AUTHENTICATED_AGENT_PREDICATE) {
    return AUTHENTICATED_AGENT_TYPE;
  }
  return "agent";
}

// this is from old permissions
export function getPolicyModesAndAgents(policyUrls, policyDataset) {
  return policyUrls
    .map((url) => acp.getPolicy(policyDataset, url))
    .filter((policy) => !!policy)
    .map((policy) => {
      const modes = acp.getAllowModes(policy);
      const ruleUrls = acp.getAllOfRuleUrlAll(policy);
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

function getPolicyUrlName(policyUrl, name) {
  return `${policyUrl}#${name}Policy`;
}

function ensureAccessControl(policyUrl, datasetWithAcr, changed) {
  const policies = acp.getPolicyUrlAll(datasetWithAcr);
  if (policies.includes(policyUrl)) {
    return {
      changed,
      acr: datasetWithAcr,
    };
  }
  const acr = acp.addAcrPolicyUrl(datasetWithAcr, policyUrl);
  return {
    changed: true,
    acr,
  };
}

function ensureApplyMembers(policyUrl, datasetWithAcr, changed) {
  const policies = acp.getMemberPolicyUrlAll(datasetWithAcr);
  const existingPolicies = policies.find((url) => policyUrl === url);
  if (existingPolicies) {
    return {
      changed,
      acr: datasetWithAcr,
    };
  }
  const acr = acp.addMemberPolicyUrl(datasetWithAcr, policyUrl);
  return {
    changed: changed || !existingPolicies,
    acr,
  };
}

function ensureApplyControl(policyUrl, datasetWithAcr, changed) {
  const policies = acp.getPolicyUrlAll(datasetWithAcr);
  const existingPolicies = policies.find((url) => policyUrl === url);
  if (existingPolicies) {
    return {
      changed,
      acr: datasetWithAcr,
    };
  }
  const acr = acp.addPolicyUrl(datasetWithAcr, policyUrl);
  return {
    changed: changed || !existingPolicies,
    acr,
  };
}

export function getPodBrowserPolicyUrlAll(
  resourceWithAcr,
  policiesContainerUrl
) {
  const policies = acp.getPolicyUrlAll(resourceWithAcr);
  return policies.filter((policyUrl) =>
    policyUrl.startsWith(policiesContainerUrl)
  );
}

export async function getPodBrowserPermissions(
  resourceWithAcr,
  policiesContainerUrl,
  fetch
) {
  const policiesUrls = getPodBrowserPolicyUrlAll(
    resourceWithAcr,
    policiesContainerUrl
  );
  if (!policiesUrls.length) return [];
  try {
    const modesAndAgents = await Promise.all(
      policiesUrls.map(async (url) => {
        const dataset = await getSolidDataset(url, {
          fetch,
        });
        return getNamedPolicyModesAndAgents(url, dataset);
      })
    );
    return modesAndAgents.reduce(
      (memo, { policyUrl, modes, agents }) =>
        memo.concat(
          agents.map((webId) => {
            // TODO: when we have groups we can pass a "group" type here
            const access = {
              apply: addAcpModes(createAcpMap(), modes),
              access: createAcpMap(),
            };
            const acl = convertAcpToAcl(access);
            const alias = getPolicyDetailFromAccess(acl, "name");
            const directPolicyUrl = getPolicyResourceUrl(
              resourceWithAcr,
              policiesContainerUrl,
              alias
            );
            const directPolicyName = getPolicyUrlName(directPolicyUrl, alias);
            return {
              type: getAgentType(webId),
              acl,
              alias,
              webId,
              inherited: policyUrl !== directPolicyName,
            };
          })
        ),
      []
    );
  } catch (error) {
    if (isHTTPError(error.message, 403) || isHTTPError(error.message, 404)) {
      return [];
    }
    throw error;
  }
}

export function getWebIdsFromPermissions(permissions) {
  return (permissions || []).map(({ webId }) => webId);
}

export function getWebIdsFromInheritedPermissions(permissions) {
  return getWebIdsFromPermissions(
    (permissions || []).filter(({ inherited }) => inherited)
  );
}

export default class AcpAccessControlStrategy {
  #originalWithAcr;

  #policyUrl;

  #policiesContainerUrl;

  #fetch;

  constructor(originalWithAcr, policiesContainerUrl, fetch) {
    this.#originalWithAcr = originalWithAcr;
    this.#policyUrl = getPolicyUrl(originalWithAcr, policiesContainerUrl);
    this.#policiesContainerUrl = policiesContainerUrl;
    this.#fetch = fetch;
  }

  async getPermissionsForPolicy(policyName) {
    const allPermissions = await getPodBrowserPermissions(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      this.#fetch
    );
    return allPermissions.filter(({ alias }) => alias === policyName);
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

  async ensureAccessControlAllNamedPolicies() {
    // ensuring access controls for original resource
    const editorsPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "editors"
    );
    const viewersPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "viewers"
    );
    const editorsPolicy = getPolicyUrlName(editorsPolicyResourceUrl, "editors");
    const viewersPolicy = getPolicyUrlName(viewersPolicyResourceUrl, "viewers");
    const { acr: originalAcr, changed: originalChanged } = chain(
      {
        acr: this.#originalWithAcr,
        changed: false,
      },
      ({ acr, changed }) => ensureApplyControl(editorsPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyControl(viewersPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyMembers(editorsPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyMembers(viewersPolicy, acr, changed)
    );
    // ensuring access controls for policy resource
    try {
      const editorsPolicyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
        editorsPolicyResourceUrl,
        { fetch: this.#fetch }
      );
      const viewersPolicyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
        viewersPolicyResourceUrl,
        { fetch: this.#fetch }
      );

      const { acr: editorsPolicyAcr, changed: editorsPolicyChanged } = {
        acr: editorsPolicyDatasetWithAcr,
        changed: false,
      };
      if (editorsPolicyChanged) {
        await acp.saveAcrFor(editorsPolicyAcr, { fetch: this.#fetch });
      }
      const { acr: viewersPolicyAcr, changed: viewersPolicyChanged } = {
        acr: viewersPolicyDatasetWithAcr,
        changed: false,
      };
      if (viewersPolicyChanged) {
        await acp.saveAcrFor(viewersPolicyAcr, { fetch: this.#fetch });
      }
    } catch (err) {
      if (!isHTTPError(err.message, 404)) throw err;
    }
    // ensuring access controls for policy resource
    if (originalChanged) {
      this.#originalWithAcr = await acp.saveAcrFor(originalAcr, {
        fetch: this.#fetch,
      });
    }
  }

  async ensureAccessControlAllCustomPolicies() {
    // ensuring access controls for original resource
    const viewAndAddPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "viewAndAdd"
    );
    const editOnlyPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "editOnly"
    );
    const addOnlyPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "addOnly"
    );
    const viewAndAddPolicy = getPolicyUrlName(
      viewAndAddPolicyResourceUrl,
      "viewAndAdd"
    );
    const editOnlyPolicy = getPolicyUrlName(
      editOnlyPolicyResourceUrl,
      "editOnly"
    );
    const addOnlyPolicy = getPolicyUrlName(addOnlyPolicyResourceUrl, "addOnly");

    const { acr: originalAcr, changed: originalChanged } = chain(
      {
        acr: this.#originalWithAcr,
        changed: false,
      },
      ({ acr, changed }) => ensureApplyControl(viewAndAddPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyControl(editOnlyPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyControl(addOnlyPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyMembers(viewAndAddPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyMembers(editOnlyPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyMembers(addOnlyPolicy, acr, changed)
    );
    // ensuring access controls for policy resource
    try {
      const viewAndAddPolicyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
        viewAndAddPolicyResourceUrl,
        { fetch: this.#fetch }
      );
      const editOnlyPolicyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
        editOnlyPolicyResourceUrl,
        { fetch: this.#fetch }
      );
      const addOnlyPolicyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
        addOnlyPolicyResourceUrl,
        { fetch: this.#fetch }
      );

      const { acr: viewAndAddPolicyAcr, changed: viewAndAddPolicyChanged } = {
        acr: viewAndAddPolicyDatasetWithAcr,
        changed: false,
      };
      if (viewAndAddPolicyChanged) {
        await acp.saveAcrFor(viewAndAddPolicyAcr, { fetch: this.#fetch });
      }
      const { acr: editOnlyPolicyAcr, changed: editOnlyPolicyChanged } = {
        acr: editOnlyPolicyDatasetWithAcr,
        changed: false,
      };
      if (editOnlyPolicyChanged) {
        await acp.saveAcrFor(editOnlyPolicyAcr, { fetch: this.#fetch });
      }
      const { acr: addOnlyPolicyAcr, changed: addOnlyPolicyChanged } = {
        acr: addOnlyPolicyDatasetWithAcr,
        changed: false,
      };
      if (addOnlyPolicyChanged) {
        await acp.saveAcrFor(addOnlyPolicyAcr, { fetch: this.#fetch });
      }
    } catch (err) {
      if (!isHTTPError(err.message, 404)) throw err;
    }
    // important to save changes to original resource ACR _after_ the requests to create new policies are created
    if (originalChanged) {
      this.#originalWithAcr = await acp.saveAcrFor(originalAcr, {
        fetch: this.#fetch,
      });
    }
  }

  async ensureAccessControlPolicyAll(policyName) {
    return isCustomPolicy(policyName)
      ? this.ensureAccessControlAllCustomPolicies()
      : this.ensureAccessControlAllNamedPolicies();
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
    const canSharePolicy = getAllowApplyPolicy(this.#policyUrl, "canShare");

    const { acr: policyAcr, changed: policyChanged } = chain(
      {
        acr: policyDatasetWithAcr,
        changed: false,
      },
      ({ acr, changed }) => ensureApplyControl(controlAllowApply, acr, changed),
      ({ acr, changed }) => ensureApplyControl(canSharePolicy, acr, changed)
    );
    if (policyChanged) {
      try {
        await acp.saveAcrFor(policyAcr, { fetch: this.#fetch });
      } catch (error) {
        // TODO: Handle this error (probably by replacing acpv1.saveAcrFor with newer ACP APIs)
        // Again, there is something in acpv1.saveAcrFor that fails to handle the policyAcr properly.
        // It doesn't seem to affect the outcome though, so we'll leave it like this for now
      }
    }
  }

  async setRulePublic(policyName, access) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName
    );

    const { respond, error } = createResponder();
    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);
    const policyUrl = getPolicyUrlName(namedPolicyContainerUrl, policyName);
    const acpMap = acpMapForApplyPolicies[policyName];
    const updatedDataset = chain(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: acp.setAllowModes(policy, acpMap),
        dataset,
      }),
      ({ policy, dataset }) => setPublicAgent(dataset, policy, access),
      ({ policy, dataset }) => acp.setPolicy(dataset, policy)
    );

    // saving changes to the policy resource
    await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
      fetch: this.#fetch,
    });

    // saving changes to the ACRs
    await this.ensureAccessControlPolicyAll(policyName);

    return respond(this.#originalWithAcr);
  }

  async setRuleAuthenticated(policyName, access) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName
    );

    const { respond, error } = createResponder();
    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);
    const policyUrl = getPolicyUrlName(namedPolicyContainerUrl, policyName);
    const acpMap = acpMapForApplyPolicies[policyName];
    const updatedDataset = chain(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: acp.setAllowModes(policy, acpMap),
        dataset,
      }),
      ({ policy, dataset }) => setAuthenticatedAgent(dataset, policy, access),
      ({ policy, dataset }) => acp.setPolicy(dataset, policy)
    );

    // saving changes to the policy resource
    await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
      fetch: this.#fetch,
    });

    // saving changes to the ACRs
    await this.ensureAccessControlPolicyAll(policyName);

    return respond(this.#originalWithAcr);
  }

  async addAgentToPolicy(webId, policyName) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName
    );

    const { respond, error } = createResponder();
    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);
    if (getOrCreateError) return error(getOrCreateError);
    const policyUrl = getPolicyUrlName(namedPolicyContainerUrl, policyName);
    const acpMap = acpMapForApplyPolicies[policyName];
    const updatedDataset = chain(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: acp.setAllowModes(policy, acpMap),
        dataset,
      }),
      ({ policy, dataset }) => setAgents(policy, dataset, webId, true),
      ({ policy, dataset }) => acp.setPolicy(dataset, policy)
    );

    // saving changes to the policy resource
    await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
      fetch: this.#fetch,
    });

    // saving changes to the ACRs
    await this.ensureAccessControlPolicyAll(policyName);

    return respond(this.#originalWithAcr);
  }

  async removeAgentFromPolicy(webId, policyName) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName
    );
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);
    if (getOrCreateError) return error(getOrCreateError);

    const policyUrl = getPolicyUrlName(namedPolicyContainerUrl, policyName);
    const policy = acp.getPolicy(policyDataset, policyUrl);
    if (!policy) {
      // not able to remove the agent from this policy (most likely because it is inherited)
      // we simply terminate and return the original ACR
      return respond(this.#originalWithAcr);
    }
    const rulesUrls = acp.getAllOfRuleUrlAll(policy);
    const [updatedDataset] = rulesUrls.map((ruleUrl) => {
      const rule = acp.getRule(policyDataset, ruleUrl);
      const modifiedRule = acp.removeAgent(rule, webId);
      return setThing(policyDataset, modifiedRule);
    });
    const { agents } = getNamedPolicyModesAndAgents(policyUrl, updatedDataset);
    const isLastAgent = !agents.length;
    if (isLastAgent) {
      // remove the rule
      const [modifiedPolicy] = rulesUrls.map((ruleUrl) => {
        return acp.removeAllOfRuleUrl(policy, ruleUrl);
      });
      const modifiedPolicyRulesUrls = acp.getAllOfRuleUrlAll(modifiedPolicy);
      // if there are no rules left in the policy
      if (!modifiedPolicyRulesUrls.length) {
        await deleteFile(policyUrl, { fetch: this.#fetch });
        // if policies container is a container and it's empty, remove it too
        if (namedPolicyContainerUrl && isContainer(namedPolicyContainerUrl)) {
          deletePoliciesContainer(namedPolicyContainerUrl, fetch);
        }
      }
    }

    // saving changes to the policy resource
    await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
      fetch: this.#fetch,
    });

    // saving changes to the ACRs
    await this.ensureAccessControlPolicyAll(policyName);

    return respond(this.#originalWithAcr);
  }

  async removeAgentFromCustomPolicy(webId, policyName) {
    const customPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName
    );
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(customPolicyContainerUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);

    const policyUrl = getPolicyUrlName(customPolicyContainerUrl, policyName);
    const policy = acp.getPolicy(policyDataset, policyUrl);
    const rulesUrls = acp.getAllOFRuleUrlAll(policy);
    const [updatedDataset] = rulesUrls.map((ruleUrl) => {
      const rule = acp.getRule(policyDataset, ruleUrl);
      const modifiedRule = acp.removeAgent(rule, webId);
      return setThing(policyDataset, modifiedRule);
    });

    const { agents } = getNamedPolicyModesAndAgents(policyUrl, updatedDataset);
    const isLastAgent = !agents.length;
    if (isLastAgent) {
      // remove the rule
      const [modifiedPolicy] = rulesUrls.map((ruleUrl) => {
        return acp.removeAllOfRuleUrl(policy, ruleUrl);
      });
      const modifiedPolicyRulesUrls = acp.getAllOfRuleUrlAll(modifiedPolicy);
      // if there are no rules left in the policy
      if (!modifiedPolicyRulesUrls.length) {
        await deleteFile(policyUrl, { fetch: this.#fetch });
        // if policies container is a container and it's empty, remove it too
        if (customPolicyContainerUrl && isContainer(customPolicyContainerUrl)) {
          deletePoliciesContainer(customPolicyContainerUrl, fetch);
        }
      }
    }

    // saving changes to the policy resource
    await saveSolidDatasetAt(customPolicyContainerUrl, updatedDataset, {
      fetch: this.#fetch,
    });

    // saving changes to the ACRs
    await this.ensureAccessControlPolicyAll(policyName);

    return respond(this.#originalWithAcr);
  }

  async savePermissionsForAgent(webId, access) {
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(this.#policyUrl, this.#fetch);

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

  static async init(resourceInfo, policiesContainerUrl, fetch) {
    const resourceUrl = getSourceUrl(resourceInfo);
    const datasetWithAcr = await acp.getResourceInfoWithAcr(resourceUrl, {
      fetch,
    });
    if (!acp.hasAccessibleAcr(datasetWithAcr)) {
      throw new Error(noAcrAccessError);
    }
    return new AcpAccessControlStrategy(
      datasetWithAcr,
      policiesContainerUrl,
      fetch
    );
  }
}
