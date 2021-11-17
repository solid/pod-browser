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

import {
  acp_v3 as legacyAcp,
  acp_v4 as acp,
  asUrl,
  deleteFile,
  getSolidDataset,
  getSourceUrl,
  isContainer,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import LinkHeader from "http-link-header";
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
  isCustomPolicy,
  getPolicyUrl,
  getPolicyResourceUrl,
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
import { ACP_TYPE_MAP, POLICIES_TYPE_MAP } from "../../../constants/policies";

export const noAcrAccessError =
  "No access to Access Control Resource for this resource";

const CONTROL_ACCESS_CONSENT = {
  titleConsent: "wants to add or remove people from",
  iconName: "user",
};

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

export const getAcpAccessDetails = (access) => {
  const { read, write, append, control } = access;
  const key =
    (read && "read") ||
    (write && "write") ||
    (append && "append") ||
    (control && "control");
  return ACP_TYPE_MAP[key];
};

export const getPolicyDetailFromAccess = (access, label) => {
  const { read, write, append, control } = access;
  if (read && write && !append) {
    return POLICIES_TYPE_MAP.editors[label];
  }
  if (read && !write && !append) {
    return POLICIES_TYPE_MAP.viewers[label];
  }
  if (read && append && !write) {
    return POLICIES_TYPE_MAP.viewAndAdd[label];
  }
  if (append && !write && !read) {
    return POLICIES_TYPE_MAP.addOnly[label];
  }
  if (write && !append && !read) {
    return POLICIES_TYPE_MAP.editOnly[label];
  }
  if (control) {
    return CONTROL_ACCESS_CONSENT[label];
  }
  return null;
};

/**
 * Discover whether an authorization server advertizes its configuration as descibed
 * in https://solid.github.io/authorization-panel/acp-specification/#capabilities-discovery.
 * This is used to determine whether an authorization server conforms to the legacy
 * ACP specification, or if it implements the latest version. The retrieved configuration
 * itself is irrelevant in this case, what is important is its presence or absence.
 *
 * TODO: Part of this should be moved to `@inrupt/solid-client`. When doing so,
 * make sure to remove the dependency on `http-link-header`, which will no longer
 * be necessary.
 *
 * @param {*} acrUrl The URL of the Access Control Resource
 */
export async function hasAcpConfiguration(acrUrl, authFetch) {
  // Defaults to the latest system.
  if (typeof acrUrl !== "string") {
    return false;
  }
  const response = await authFetch(acrUrl, {
    // The specification requires that this should be an OPTIONS request, but
    // this causes issues for cross-origin requests from a browser. ESS currently
    // allows to work around this issuing a HEAD request instead.
    method: "HEAD",
  });
  const linkHeader = response.headers.get("Link");
  if (linkHeader === null) {
    return false;
  }
  const parsedLinks = LinkHeader.parse(linkHeader);
  return (
    parsedLinks.get("rel", "http://www.w3.org/ns/solid/acp#grant").length > 0 ||
    parsedLinks.get("rel", "http://www.w3.org/ns/solid/acp#attribute").length >
      0
  );
}

// The following functions multiplex between the latest and legacy ACP API
function switchIfLegacy(legacyFunction, latestFunction, parameters, isLegacy) {
  return isLegacy
    ? legacyFunction(...parameters)
    : latestFunction(...parameters);
}

const getMatcher = (policyDataset, matcherUrl, legacy) =>
  switchIfLegacy(
    legacyAcp.getRule,
    acp.getMatcher,
    [policyDataset, matcherUrl],
    legacy
  );

const getMatcherAll = (policyDataset, legacy) =>
  switchIfLegacy(
    legacyAcp.getRuleAll,
    acp.getMatcherAll,
    [policyDataset],
    legacy
  );

const createMatcher = (matcherUrl, legacy) =>
  switchIfLegacy(legacyAcp.createRule, acp.createMatcher, [matcherUrl], legacy);

const getAllOfMatcherUrlAll = (policy, legacy) =>
  switchIfLegacy(
    legacyAcp.getAllOfRuleUrlAll,
    acp.getAllOfMatcherUrlAll,
    [policy],
    legacy
  );

const setAllOfMatcherUrl = (policy, matcher, legacy) =>
  switchIfLegacy(
    legacyAcp.setAllOfRuleUrl,
    acp.setAllOfMatcherUrl,
    [policy, matcher],
    legacy
  );

const addAllOfMatcherUrl = (policy, matcher, legacy) =>
  switchIfLegacy(
    legacyAcp.addAllOfRuleUrl,
    acp.addAllOfMatcherUrl,
    [policy, matcher],
    legacy
  );

const removeAllOfMatcherUrl = (policy, matcher, legacy) =>
  switchIfLegacy(
    legacyAcp.removeAllOfRuleUrl,
    acp.removeAllOfMatcherUrl,
    [policy, matcher],
    legacy
  );

const getAllowModes = (policy, legacy) =>
  switchIfLegacy(legacyAcp.getAllowModes, acp.getAllowModes, [policy], legacy);

const setAllowModes = (policy, modes, legacy) =>
  switchIfLegacy(
    legacyAcp.setAllowModes,
    acp.setAllowModes,
    [policy, modes],
    legacy
  );

const getMemberPolicyUrlAll = (datasetWithAcr, legacy) =>
  switchIfLegacy(
    legacyAcp.getMemberPolicyUrlAll,
    acp.getMemberPolicyUrlAll,
    [datasetWithAcr],
    legacy
  );

const addMemberPolicyUrl = (datasetWithAcr, policyUrl, legacy) =>
  switchIfLegacy(
    legacyAcp.addMemberPolicyUrl,
    acp.addMemberPolicyUrl,
    [datasetWithAcr, policyUrl],
    legacy
  );

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

export function getMatchersOrCreate(
  matcherUrls,
  policy,
  policyDataset,
  legacy
) {
  // assumption: Matchers resides in the same resource as the policies
  const matchers = matcherUrls
    .map((url) => getMatcher(policyDataset, url, legacy))
    .filter((matcher) => !!matcher);
  if (matchers.length === 0) {
    const matcherUrl = `${asUrl(policy)}${legacy ? "Rule" : "Matcher"}`; // e.g. <pod>/policies/.ttl#readPolicyMatcher
    return { existing: false, matchers: [createMatcher(matcherUrl, legacy)] };
  }
  return { existing: true, matchers };
}

export function getMatcherWithAgent(matchers, agentWebId) {
  // assumption 1: the matchers for the policies we work with will not have agents across multiple matchers
  // assumption 2: there will always be at least one matcher (we enforce this with getMatchersOrCreate)
  const matcher = matchers.find((r) =>
    acp.getAgentAll(r).find((webId) => webId === agentWebId)
  );
  // if we don't find the agent in a matcher, we'll just pick the first one
  return matcher || matchers[0];
}

export function setAgents(policy, policyDataset, webId, accessToMode, legacy) {
  const matcherUrls = getAllOfMatcherUrlAll(policy, legacy);
  const { existing, matchers } = getMatchersOrCreate(
    matcherUrls,
    policy,
    policyDataset,
    legacy
  );
  const matcher = getMatcherWithAgent(matchers, webId);
  const existingAgents = acp.getAgentAll(matcher);
  const agentIndex = existingAgents.indexOf(webId);
  let modifiedMatcher = matcher;
  if (accessToMode && agentIndex === -1) {
    modifiedMatcher = acp.addAgent(matcher, webId);
  }
  if (!accessToMode && agentIndex !== -1) {
    modifiedMatcher = acp.removeAgent(matcher, webId);
  }
  const modifiedDataset = setThing(policyDataset, modifiedMatcher);
  const modifiedPolicy = existing
    ? setAllOfMatcherUrl(policy, modifiedMatcher, legacy)
    : addAllOfMatcherUrl(policy, modifiedMatcher, legacy);
  return {
    policy: modifiedPolicy,
    dataset: modifiedDataset,
  };
}

export function setPublicAgent(dataset, policy, access, legacy) {
  const matchersUrls = getAllOfMatcherUrlAll(policy, legacy);
  const { existing, matchers } = getMatchersOrCreate(
    matchersUrls,
    policy,
    dataset,
    legacy
  );
  const modifiedMatchers = matchers.map((matcher) =>
    access ? acp.setPublic(matcher) : acp.removePublic(matcher)
  );
  const [modifiedDataset] = modifiedMatchers.map((modifiedMatcher) => {
    return setThing(dataset, modifiedMatcher);
  });
  const [modifiedPolicy] = existing
    ? modifiedMatchers.map((modifiedMatcher) =>
        setAllOfMatcherUrl(policy, modifiedMatcher, legacy)
      )
    : modifiedMatchers.map((modifiedMatcher) =>
        addAllOfMatcherUrl(policy, modifiedMatcher, legacy)
      );
  return {
    policy: modifiedPolicy,
    dataset: modifiedDataset,
  };
}

export function setAuthenticatedAgent(dataset, policy, access, legacy) {
  const matchersUrls = getAllOfMatcherUrlAll(policy, legacy);
  const { existing, matchers } = getMatchersOrCreate(
    matchersUrls,
    policy,
    dataset,
    legacy
  );
  const modifiedMatchers = matchers.map((matcher) => {
    const modifiedMatcher = access
      ? acp.setAuthenticated(matcher)
      : acp.removeAuthenticated(matcher);
    return modifiedMatcher;
  });
  const [modifiedDataset] = modifiedMatchers.map((modifiedMatcher) => {
    return setThing(dataset, modifiedMatcher);
  });
  const [modifiedPolicy] = existing
    ? modifiedMatchers.map((modifiedMatcher) =>
        setAllOfMatcherUrl(policy, modifiedMatcher, legacy)
      )
    : modifiedMatchers.map((modifiedMatcher) =>
        addAllOfMatcherUrl(policy, modifiedMatcher, legacy)
      );
  return {
    policy: modifiedPolicy,
    dataset: modifiedDataset,
  };
}

export function getNamedPolicyModesAndAgents(policyUrl, policyDataset, legacy) {
  const policy = acp.getPolicy(policyDataset, policyUrl);
  if (!policy) return { modes: {}, agents: [] };
  const modes = getAllowModes(policy, legacy);
  const matcherUrls = getAllOfMatcherUrlAll(policy, legacy);
  // assumption: matchers resides in the same resource as policies
  const matchers = matcherUrls
    .map((url) => getMatcher(policyDataset, url, legacy))
    .filter((matcher) => matcher !== null);
  const agents = matchers.reduce(
    (memo, matcher) => memo.concat(acp.getAgentAll(matcher)),
    []
  );
  const [authenticatedStatus] = matchers.map((matcher) =>
    acp.hasAuthenticated(matcher)
  );
  if (authenticatedStatus) {
    agents.unshift(AUTHENTICATED_AGENT_PREDICATE);
  }
  const [publicStatus] = matchers.map((matcher) => acp.hasPublic(matcher));
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
export function getPolicyModesAndAgents(policyUrls, policyDataset, legacy) {
  return policyUrls
    .map((url) => acp.getPolicy(policyDataset, url))
    .filter((policy) => !!policy)
    .map((policy) => {
      const modes = getAllowModes(policy, legacy);
      const matcherUrls = getAllOfMatcherUrlAll(policy, legacy);
      // assumption: matchers resides in the same resource as policies
      const matchers = matcherUrls.map((matcher) =>
        getMatcher(policyDataset, matcher, legacy)
      );
      const agents = matchers.reduce(
        (memo, matcher) => memo.concat(acp.getAgentAll(matcher)),
        []
      );
      return {
        modes,
        agents,
      };
    });
}

export function removePermissionsForAgent(webId, policyDataset, legacy) {
  return getMatcherAll(policyDataset, legacy).reduce((dataset, matcher) => {
    const modifiedMatcher = acp.removeAgent(matcher, webId);
    return setThing(dataset, modifiedMatcher);
  }, policyDataset);
}

function updateAllowPolicy(
  policyDataset,
  policyUrl,
  webId,
  accessToMode,
  acpMap,
  legacy
) {
  return chain(
    getOrCreatePolicy(policyDataset, policyUrl),
    ({ policy, dataset }) => ({
      policy: setAllowModes(policy, acpMap, legacy),
      dataset,
    }),
    ({ policy, dataset }) =>
      setAgents(policy, dataset, webId, accessToMode, legacy),
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

function ensureApplyMembers(policyUrl, datasetWithAcr, changed, legacy) {
  const policies = getMemberPolicyUrlAll(datasetWithAcr, legacy);
  const existingPolicies = policies.find((url) => policyUrl === url);
  if (existingPolicies) {
    return {
      changed,
      acr: datasetWithAcr,
    };
  }
  const acr = addMemberPolicyUrl(datasetWithAcr, policyUrl, legacy);
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
  fetch,
  legacy
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
        return getNamedPolicyModesAndAgents(url, dataset, legacy);
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
              alias,
              legacy
            );
            const directPolicyName = legacy
              ? getPolicyUrlName(directPolicyUrl, alias, legacy)
              : policyUrl;
            // : `${policyUrl}${alias}`;
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

/**
 * FIXME This function doesn't really make sense, but it is the current implementation
 * so let's keep it as is for now and figure it out later.
 *
 * @param {*} policyResourceUrl
 */
async function updatePolicyIfChanged(policyResourceUrl, fetch) {
  try {
    const policyDatasetWithAcr = await acp.getSolidDatasetWithAcr(
      policyResourceUrl,
      { fetch }
    );
    // FIXME: this assignment doesn't make sense to me.
    const { acr: policyAcr, changed: policyChanged } = {
      acr: policyDatasetWithAcr,
      changed: false,
    };
    // This is never true ?
    if (policyChanged) {
      await acp.saveAcrFor(policyAcr, { fetch });
    }
  } catch (err) {
    if (!isHTTPError(err.message, 404)) throw err;
  }
}

export default class AcpAccessControlStrategy {
  #originalWithAcr;

  #policyUrl;

  #policiesContainerUrl;

  #fetch;

  // Legacy ACP behavior uses rules instead of matchers, and stores policies
  // in resources external to the ACR.
  #isLegacy;

  constructor(originalWithAcr, policiesContainerUrl, fetch, legacy) {
    this.#originalWithAcr = originalWithAcr;
    this.#policyUrl = getPolicyUrl(
      originalWithAcr,
      policiesContainerUrl,
      legacy
    );
    this.#policiesContainerUrl = policiesContainerUrl;
    this.#fetch = fetch;
    this.#isLegacy = legacy;
  }

  async getAllPermissionsForResource() {
    const allPermissions = await getPodBrowserPermissions(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      this.#fetch,
      this.#isLegacy
    );
    return allPermissions;
  }

  async getPermissionsForPolicy(policyName) {
    const allPermissions = await getPodBrowserPermissions(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      this.#fetch,
      this.#isLegacy
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
        policyDataset,
        this.#isLegacy
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
        policyDataset,
        this.#isLegacy
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
      updateAllowPolicy(
        d,
        allowUrl,
        webId,
        access[mode],
        acpMap,
        this.#isLegacy
      )
    );
  }

  saveAccessPolicyForOriginalResource(dataset, webId, access) {
    const allowUrl = getAllowAccessPolicy(this.#policyUrl, "control");
    const modes = createAcpMap(true, true);
    return chain(dataset, (d) =>
      updateAllowPolicy(
        d,
        allowUrl,
        webId,
        access.control,
        modes,
        this.#isLegacy
      )
    );
  }

  saveApplyPolicyForPolicyResource(dataset, webId, access) {
    const allowUrl = getAllowApplyPolicy(this.#policyUrl, "control");
    const modes = createAcpMap(true, true);
    return chain(dataset, (d) =>
      updateAllowPolicy(
        d,
        allowUrl,
        webId,
        access.control,
        modes,
        this.#isLegacy
      )
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

  async linkPoliciesToAcr(originalChanged, originalAcr) {
    if (originalChanged) {
      this.#originalWithAcr = await acp.saveAcrFor(originalAcr, {
        fetch: this.#fetch,
      });
    }
  }

  async ensureAccessControlAllNamedPolicies() {
    // ensuring access controls for original resource
    const editorsPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "editors",
      this.#isLegacy
    );
    const editorsPolicy = this.#isLegacy
      ? getPolicyUrlName(editorsPolicyResourceUrl, "editors")
      : `${this.#policyUrl}editors`;
    const viewersPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "viewers",
      this.#isLegacy
    );
    const viewersPolicy = this.#isLegacy
      ? getPolicyUrlName(viewersPolicyResourceUrl, "viewers")
      : `${this.#policyUrl}viewers`;
    const { acr: originalAcr, changed: originalChanged } = chain(
      {
        acr: this.#originalWithAcr,
        changed: false,
      },
      ({ acr, changed }) => ensureApplyControl(editorsPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyControl(viewersPolicy, acr, changed),
      ({ acr, changed }) =>
        ensureApplyMembers(editorsPolicy, acr, changed, this.#isLegacy),
      ({ acr, changed }) =>
        ensureApplyMembers(viewersPolicy, acr, changed, this.#isLegacy)
    );
    // In order to apply the policies to the target resource, both the policies'
    // content and their links to the Access Control must be saved.
    if (this.#isLegacy) {
      // In legacy systems, the policies' content must be saved first, because they
      // are stored in external resources.
      // ensuring policy content is up-to-date
      await updatePolicyIfChanged(editorsPolicyResourceUrl, this.#fetch);
      await updatePolicyIfChanged(viewersPolicyResourceUrl, this.#fetch);
      // ensuring access controls for policy resource
      await this.linkPoliciesToAcr(originalChanged, originalAcr);
    } else {
      // In latest systems, the policies are inline of the ACR. It means they could
      // be disregarded if they are not linked to the Access Control first.
      // ensuring access controls for policy resource
      await this.linkPoliciesToAcr(originalChanged, originalAcr);
      // ensuring policy content is up-to-date
      await updatePolicyIfChanged(editorsPolicyResourceUrl, this.#fetch);
      await updatePolicyIfChanged(viewersPolicyResourceUrl, this.#fetch);
    }
  }

  async ensureAccessControlAllCustomPolicies() {
    // ensuring access controls for original resource
    const viewAndAddPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "viewAndAdd",
      this.#isLegacy
    );
    const viewAndAddPolicy = this.#isLegacy
      ? getPolicyUrlName(viewAndAddPolicyResourceUrl, "viewAndAdd")
      : `${this.#policyUrl}viewAndAdd`;
    const editOnlyPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "editOnly",
      this.#isLegacy
    );
    const editOnlyPolicy = this.#isLegacy
      ? getPolicyUrlName(editOnlyPolicyResourceUrl, "editOnly")
      : `${this.#policyUrl}editOnly`;
    const addOnlyPolicyResourceUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      "addOnly",
      this.#isLegacy
    );
    const addOnlyPolicy = this.#isLegacy
      ? getPolicyUrlName(addOnlyPolicyResourceUrl, "addOnly")
      : `${this.#policyUrl}addOnly`;

    const { acr: originalAcr, changed: originalChanged } = chain(
      {
        acr: this.#originalWithAcr,
        changed: false,
      },
      ({ acr, changed }) => ensureApplyControl(viewAndAddPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyControl(editOnlyPolicy, acr, changed),
      ({ acr, changed }) => ensureApplyControl(addOnlyPolicy, acr, changed),
      ({ acr, changed }) =>
        ensureApplyMembers(viewAndAddPolicy, acr, changed, this.#isLegacy),
      ({ acr, changed }) =>
        ensureApplyMembers(editOnlyPolicy, acr, changed, this.#isLegacy),
      ({ acr, changed }) =>
        ensureApplyMembers(addOnlyPolicy, acr, changed, this.#isLegacy)
    );

    // In order to apply the policies to the target resource, both the policies'
    // content and their links to the Access Control must be saved.
    if (this.#isLegacy) {
      // In legacy systems, the policies' content must be saved first, because they
      // are stored in external resources.
      // ensuring policy content is up-to-date
      await updatePolicyIfChanged(viewAndAddPolicyResourceUrl, this.#fetch);
      await updatePolicyIfChanged(editOnlyPolicyResourceUrl, this.#fetch);
      await updatePolicyIfChanged(addOnlyPolicyResourceUrl, this.#fetch);
      // ensuring access controls for policy resource
      await this.linkPoliciesToAcr(originalChanged, originalAcr);
    } else {
      // In latest systems, the policies are inline of the ACR. It means they could
      // be disregarded if they are not linked to the Access Control first.
      // ensuring access controls for policy resource
      await this.linkPoliciesToAcr(originalChanged, originalAcr);
      // ensuring policy content is up-to-date
      await updatePolicyIfChanged(viewAndAddPolicyResourceUrl, this.#fetch);
      await updatePolicyIfChanged(editOnlyPolicyResourceUrl, this.#fetch);
      await updatePolicyIfChanged(addOnlyPolicyResourceUrl, this.#fetch);
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
    if (!this.#isLegacy) {
      // For non-legacy systems, the policy must be linked to the ACR before its
      // contet is written.
      await this.linkPoliciesToAcr(originalChanged, originalAcr);
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
      try {
        await acp.saveAcrFor(policyAcr, { fetch: this.#fetch });
      } catch (error) {
        // TODO: Handle this error (probably by replacing acpv1.saveAcrFor with newer ACP APIs)
        // Again, there is something in acpv1.saveAcrFor that fails to handle the policyAcr properly.
        // It doesn't seem to affect the outcome though, so we'll leave it like this for now
      }
    }

    if (this.#isLegacy) {
      // For legacy systems, the policy must be linked to the ACR after its
      // contet has been written in external resources.
      await this.linkPoliciesToAcr(originalChanged, originalAcr);
    }
  }

  // For backwards compatibility, so that it remains compatible with the legacy
  // implementation which will still be around.
  setRulePublic = this.setMatcherPublic;

  async setMatcherPublic(policyName, access) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName,
      this.#isLegacy
    );

    const { respond, error } = createResponder();
    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);
    const policyUrl = this.#isLegacy
      ? getPolicyUrlName(namedPolicyContainerUrl, policyName)
      : `${this.#policyUrl}${policyName}`;
    const acpMap = acpMapForApplyPolicies[policyName];
    const updatedDataset = chain(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: setAllowModes(policy, acpMap, this.#isLegacy),
        dataset,
      }),
      ({ policy, dataset }) =>
        setPublicAgent(dataset, policy, access, this.#isLegacy),
      ({ policy, dataset }) => acp.setPolicy(dataset, policy)
    );

    if (this.#isLegacy) {
      // Saving changes to the policy resource first
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
      // then saving changes to the ACRs
      await this.ensureAccessControlPolicyAll(policyName);
    } else {
      // saving changes to the ACRs first
      await this.ensureAccessControlPolicyAll(policyName);
      // then saving changes to the inline policy
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
    }

    return respond(this.#originalWithAcr);
  }

  // For backwards compatibility, so that it remains compatible with the legacy
  // implementation which will still be around.
  setRuleAuthenticated = this.setMatcherAuthenticated;

  async setMatcherAuthenticated(policyName, access) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName,
      this.#isLegacy
    );

    const { respond, error } = createResponder();
    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);
    const policyUrl = this.#isLegacy
      ? getPolicyUrlName(namedPolicyContainerUrl, policyName)
      : `${this.#policyUrl}${policyName}`;
    const acpMap = acpMapForApplyPolicies[policyName];
    const updatedDataset = chain(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: setAllowModes(policy, acpMap, this.#isLegacy),
        dataset,
      }),
      ({ policy, dataset }) =>
        setAuthenticatedAgent(dataset, policy, access, this.#isLegacy),
      ({ policy, dataset }) => acp.setPolicy(dataset, policy)
    );

    if (this.#isLegacy) {
      // Saving changes to the policy resource first
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
      // then saving changes to the ACRs
      await this.ensureAccessControlPolicyAll(policyName);
    } else {
      // saving changes to the ACRs first
      await this.ensureAccessControlPolicyAll(policyName);
      // then saving changes to the inline policy
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
    }

    return respond(this.#originalWithAcr);
  }

  async addAgentToPolicy(webId, policyName) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName,
      this.#isLegacy
    );

    const { respond, error } = createResponder();
    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);
    if (getOrCreateError) return error(getOrCreateError);
    const policyUrl = this.#isLegacy
      ? getPolicyUrlName(namedPolicyContainerUrl, policyName)
      : `${this.#policyUrl}${policyName}`;
    const acpMap = acpMapForApplyPolicies[policyName];
    const updatedDataset = chain(
      getOrCreatePolicy(policyDataset, policyUrl),
      ({ policy, dataset }) => ({
        policy: setAllowModes(policy, acpMap, this.#isLegacy),
        dataset,
      }),
      ({ policy, dataset }) =>
        setAgents(policy, dataset, webId, true, this.#isLegacy),
      ({ policy, dataset }) => acp.setPolicy(dataset, policy)
    );

    if (this.#isLegacy) {
      // Saving changes to the policy resource first
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
      // then saving changes to the ACRs
      await this.ensureAccessControlPolicyAll(policyName);
    } else {
      // saving changes to the ACRs first
      await this.ensureAccessControlPolicyAll(policyName);
      // then saving changes to the inline policy
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
    }

    return respond(this.#originalWithAcr);
  }

  async removeAgentFromPolicy(webId, policyName) {
    const namedPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName,
      this.#isLegacy
    );
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(namedPolicyContainerUrl, this.#fetch);
    if (getOrCreateError) return error(getOrCreateError);

    const policyUrl = this.#isLegacy
      ? getPolicyUrlName(namedPolicyContainerUrl, policyName)
      : `${this.#policyUrl}${policyName}`;
    const policy = acp.getPolicy(policyDataset, policyUrl);
    if (!policy) {
      // not able to remove the agent from this policy (most likely because it is inherited)
      // we simply terminate and return the original ACR
      return respond(this.#originalWithAcr);
    }
    const matchersUrls = getAllOfMatcherUrlAll(policy, this.#isLegacy);
    const [updatedDataset] = matchersUrls.map((matcherUrl) => {
      const matcher = getMatcher(policyDataset, matcherUrl, this.#isLegacy);
      const modifiedMatcher = acp.removeAgent(matcher, webId);
      return setThing(policyDataset, modifiedMatcher);
    });
    const { agents } = getNamedPolicyModesAndAgents(
      policyUrl,
      updatedDataset,
      this.#isLegacy
    );
    const isLastAgent = !agents.length;
    if (isLastAgent) {
      // remove the matcher
      const [modifiedPolicy] = matchersUrls.map((matcherUrl) => {
        return removeAllOfMatcherUrl(policy, matcherUrl, this.#isLegacy);
      });
      const modifiedPolicyMatchersUrls = getAllOfMatcherUrlAll(
        modifiedPolicy,
        this.#isLegacy
      );
      // if there are no matchers left in the policy
      // In the case of the latest ACP systems, the policies are stored inline of
      // the ACR, so there is nothing to delete.
      if (!modifiedPolicyMatchersUrls.length && this.#isLegacy) {
        await deleteFile(policyUrl, { fetch: this.#fetch });
        // if policies container is a container and it's empty, remove it too
        if (namedPolicyContainerUrl && isContainer(namedPolicyContainerUrl)) {
          deletePoliciesContainer(namedPolicyContainerUrl, fetch);
        }
      }
    }

    if (this.#isLegacy) {
      // Saving changes to the policy resource first
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
      // then saving changes to the ACRs
      await this.ensureAccessControlPolicyAll(policyName);
    } else {
      // saving changes to the ACRs first
      await this.ensureAccessControlPolicyAll(policyName);
      // then saving changes to the inline policy
      await saveSolidDatasetAt(namedPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
    }

    return respond(this.#originalWithAcr);
  }

  async removeAgentFromCustomPolicy(webId, policyName) {
    const customPolicyContainerUrl = getPolicyResourceUrl(
      this.#originalWithAcr,
      this.#policiesContainerUrl,
      policyName,
      this.#isLegacy
    );
    const { respond, error } = createResponder();

    const {
      response: policyDataset,
      error: getOrCreateError,
    } = await getOrCreateDatasetOld(customPolicyContainerUrl, this.#fetch);

    if (getOrCreateError) return error(getOrCreateError);

    const policyUrl = this.#isLegacy
      ? getPolicyUrlName(customPolicyContainerUrl, policyName)
      : `${this.#policyUrl}${policyName}`;
    const policy = acp.getPolicy(policyDataset, policyUrl);
    const matchersUrls = acp.getAllOfMatcherUrlAll(policy);
    const [updatedDataset] = matchersUrls.map((matcherUrl) => {
      const matcher = acp.getMatcher(policyDataset, matcherUrl);
      const modifiedMatcher = acp.removeAgent(matcher, webId);
      return setThing(policyDataset, modifiedMatcher);
    });

    const { agents } = getNamedPolicyModesAndAgents(
      policyUrl,
      updatedDataset,
      this.#isLegacy
    );
    const isLastAgent = !agents.length;
    if (isLastAgent) {
      // remove the matcher
      const [modifiedPolicy] = matchersUrls.map((matcherUrl) => {
        return acp.removeAllOfMatcherUrl(policy, matcherUrl);
      });
      const modifiedPolicyMatchersUrls = acp.getAllOfMatcherUrlAll(
        modifiedPolicy
      );
      // if there are no matchers left in the policy
      if (!modifiedPolicyMatchersUrls.length) {
        await deleteFile(policyUrl, { fetch: this.#fetch });
        // if policies container is a container and it's empty, remove it too
        if (customPolicyContainerUrl && isContainer(customPolicyContainerUrl)) {
          deletePoliciesContainer(customPolicyContainerUrl, fetch);
        }
      }
    }

    if (this.#isLegacy) {
      // Saving changes to the policy resource first
      await saveSolidDatasetAt(customPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
      // then saving changes to the ACRs
      await this.ensureAccessControlPolicyAll(policyName);
    } else {
      // saving changes to the ACRs first
      await this.ensureAccessControlPolicyAll(policyName);
      // then saving changes to the inline policy
      await saveSolidDatasetAt(customPolicyContainerUrl, updatedDataset, {
        fetch: this.#fetch,
      });
    }

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
      ? removePermissionsForAgent(webId, policyDataset, this.#isLegacy)
      : this.updatePermissionsForAgent(webId, access, policyDataset);

    if (this.#isLegacy) {
      // Saving changes to the policy resource first
      await saveSolidDatasetAt(this.#policyUrl, updatedDataset, {
        fetch: this.#fetch,
      });
      /// saving changes to the ACRs
      await this.ensureAccessControlAll();
    } else {
      // saving changes to the ACRs
      await this.ensureAccessControlAll();
      // then saving changes to the inline policy
      await saveSolidDatasetAt(this.#policyUrl, updatedDataset, {
        fetch: this.#fetch,
      });
    }

    return respond(this.#originalWithAcr);
  }

  static async init(resourceInfo, policiesContainerUrl, fetch, legacy) {
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
      fetch,
      legacy
    );
  }
}
