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

import { getSolidDataset, getSourceUrl } from "@inrupt/solid-client";
import { joinPath } from "../../stringHelpers";
import {
  getAccessControlAll,
  getAllowModesOnPolicy,
  getControlPolicyUrlAll,
  getPolicyAll,
  getPolicyUrlAll,
  getRequiredRuleOnPolicy,
  getResourceInfoWithAcp,
} from "./mockedClientApi";
import { fetchProfile } from "../../solidClientHelpers/profile";
import {
  ACL,
  createAccessMap,
  displayPermissions,
} from "../../solidClientHelpers/permissions";
import { sharedStart } from "../../solidClientHelpers/utils";

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
  const permission = permissions[webId] || {
    webId,
  };
  permission.acp = permissions.acp || {
    apply: createAcpMap(),
    access: createAcpMap(),
  };
  return permission;
}

export function getPolicyUrl(resource, policies) {
  const resourceUrl = getSourceUrl(resource);
  const policiesUrl = getSourceUrl(policies);
  const matchingStart = sharedStart(resourceUrl, policiesUrl);
  const path = resourceUrl.substr(matchingStart.length);
  return `${getPoliciesContainerUrl(matchingStart) + path}.ttl`;
}

export default class AcpAccessControlStrategy {
  #datasetWithAcr;

  #policies;

  #fetch;

  constructor(datasetWithAcr, policies, fetch) {
    this.#datasetWithAcr = datasetWithAcr;
    this.#policies = policies;
    this.#fetch = fetch;
  }

  async getPolicies(policyUrls) {
    const policyResources = await Promise.all(
      policyUrls.map((url) => getSolidDataset(url, { fetch: this.#fetch }))
    );
    const policies = policyResources
      .map((resource) => getPolicyAll(resource))
      .flat();
    return policies.map((policy) => ({
      modes: getAllowModesOnPolicy(policy),
      agents: getRequiredRuleOnPolicy(policy).agents,
    }));
  }

  async getPermissions() {
    const permissions = {};
    const policyUrl = getPolicyUrl(this.#datasetWithAcr, this.#policies);
    // assigning Read, Write, and Append
    const accessControls = getAccessControlAll(this.#datasetWithAcr);
    const policyUrls = accessControls
      .map((ac) => getPolicyUrlAll(ac).filter((url) => url === policyUrl))
      .flat();
    (await this.getPolicies(policyUrls)).forEach(({ modes, agents }) =>
      agents.forEach((webId) => {
        const permission = getOrCreatePermission(permissions, webId);
        permission.acp.apply = addAcpModes(permission.acp.apply, modes);
        permissions[webId] = permission;
      })
    );
    // assigning Control
    const controlPolicyUrls = getControlPolicyUrlAll(
      this.#datasetWithAcr
    ).filter((url) => url === policyUrl);
    (await this.getPolicies(controlPolicyUrls)).forEach(({ modes, agents }) =>
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

  // eslint-disable-next-line no-unused-vars
  async savePermissionsForAgent(webId, access) {
    throw new Error(`Not implemented: ${this}`);
  }

  static async init(resourceInfo, policies, fetch) {
    const datasetWithAcr = await getResourceInfoWithAcp(resourceInfo, {
      fetch,
    });
    return new AcpAccessControlStrategy(datasetWithAcr, policies, fetch);
  }
}
