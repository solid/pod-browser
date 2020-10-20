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
  createAclFromFallbackAcl,
  getAgentAccessAll,
  getAgentDefaultAccessAll,
  getFallbackAcl,
  getResourceAcl,
  getResourceInfoWithAcl,
  getSourceUrl,
  hasAccessibleAcl,
  hasFallbackAcl,
  hasResourceAcl,
  saveAclFor,
  setAgentDefaultAccess,
  setAgentResourceAccess,
} from "@inrupt/solid-client";
import {
  chain,
  createResponder,
  isContainerIri,
} from "../../solidClientHelpers/utils";
import { displayPermissions } from "../../solidClientHelpers/permissions";
import { fetchProfile } from "../../solidClientHelpers/profile";
import { isUrl } from "../../stringHelpers";

export default class WacAccessControlStrategy {
  #datasetWithAcl;

  #fetch;

  constructor(datasetWithAcl, fetch) {
    this.#datasetWithAcl = datasetWithAcl;
    this.#fetch = fetch;
  }

  async getPermissions() {
    if (hasResourceAcl(this.#datasetWithAcl)) {
      const accessModeList = getAgentAccessAll(this.#datasetWithAcl);
      return this.normalizePermissions(accessModeList);
    }
    if (hasAccessibleAcl(this.#datasetWithAcl)) {
      const fallbackAcl = getFallbackAcl(this.#datasetWithAcl);
      const accessModeList = getAgentDefaultAccessAll(fallbackAcl);
      return this.normalizePermissions(accessModeList);
    }
    throw new Error(
      `No access to ACL for ${getSourceUrl(this.#datasetWithAcl)}`
    );
  }

  async normalizePermissions(permissions) {
    return Promise.all(
      Object.keys(permissions)
        .filter(isUrl)
        .map(async (webId) => {
          const acl = permissions[webId];
          const profile = await fetchProfile(webId, this.#fetch);
          const alias = displayPermissions(acl);
          return {
            acl,
            profile,
            alias,
            webId,
          };
        })
    );
  }

  async savePermissionsForAgent(webId, access) {
    const { respond, error } = createResponder();

    if (!hasAccessibleAcl(this.#datasetWithAcl)) {
      return error("dataset does not have accessible ACL");
    }

    let aclDataset;
    if (hasResourceAcl(this.#datasetWithAcl)) {
      aclDataset = getResourceAcl(this.#datasetWithAcl);
    } else if (hasFallbackAcl(this.#datasetWithAcl)) {
      aclDataset = createAclFromFallbackAcl(this.#datasetWithAcl);
    } else {
      return error("unable to access ACL");
    }

    if (!aclDataset) return error("aclDataset is empty");

    const datasetUri = getSourceUrl(this.#datasetWithAcl);
    const updatedAcl = chain(
      setAgentResourceAccess(aclDataset, webId, access),
      (acl) =>
        isContainerIri(datasetUri)
          ? setAgentDefaultAccess(acl, webId, access) // will only apply default permissions if dataset is a container
          : acl
    );
    if (!updatedAcl) return error("updatedAcl is empty");

    const response = await saveAclFor(this.#datasetWithAcl, updatedAcl, {
      fetch: this.#fetch,
    });
    if (!response) return error("response is empty");

    // TODO: Can optimize once saveAclFor returns the resource dataset instead of the acl dataset
    const dataset = await getResourceInfoWithAcl(
      getSourceUrl(this.#datasetWithAcl),
      {
        fetch: this.#fetch,
      }
    );
    if (!dataset) return error("dataset is empty");

    this.#datasetWithAcl = dataset;

    return respond(dataset);
  }

  static async init(resourceInfo, fetch) {
    const datasetWithAcl = await getResourceInfoWithAcl(
      getSourceUrl(resourceInfo),
      { fetch }
    );
    return new WacAccessControlStrategy(datasetWithAcl, fetch);
  }
}
