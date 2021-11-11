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

import { getSourceUrl } from "@inrupt/solid-client";
import { sharedStart } from "../../solidClientHelpers/utils";
import { getContainerUrl, joinPath } from "../../stringHelpers";
import {
  customPolicies,
  namedPolicies,
  POLICIES_TYPE_MAP,
} from "../../../constants/policies";

const POLICIES_CONTAINER = "pb_policies/";

export function getPoliciesContainerUrl(podRootUri) {
  return joinPath(podRootUri, POLICIES_CONTAINER);
}

export function getPolicyUrl(resource, policiesContainerUrl, externalPolicy) {
  if (externalPolicy) {
    const resourceUrl = getSourceUrl(resource);
    const rootUrl = policiesContainerUrl.substr(
      0,
      policiesContainerUrl.length - POLICIES_CONTAINER.length
    );
    const matchingStart = sharedStart(resourceUrl, rootUrl);
    const path = `${resourceUrl.substr(matchingStart.length)}.ttl`;
    return joinPath(getPoliciesContainerUrl(matchingStart), path);
  }
  // If the policy is not in an external resource, it is inline of the ACR
  // It is expected that the `policiesContainerUrl` is the IRI or the ACR where
  // the access control data for the current resource will be stored.
  const policyUrl = new URL(policiesContainerUrl);
  // The current base policy IRI is identified by the resource IRI base64-encoded in the ACR dataset.
  policyUrl.hash = encodeURIComponent(btoa(getSourceUrl(resource)));
  return policyUrl.href;
}

export function getResourcePoliciesContainerPath(
  resource,
  policiesContainerUrl,
  externalResourcesSupported
) {
  return getContainerUrl(
    getPolicyUrl(resource, policiesContainerUrl, externalResourcesSupported)
  );
}

export function getPolicyResourceUrl(
  resource,
  policiesContainerUrl,
  policyName,
  externalResourcesSupported
) {
  // External resources in ACRs are supported in legacy systems.
  if (externalResourcesSupported) {
    const resourceUrl = getSourceUrl(resource);
    const rootUrl = policiesContainerUrl.substr(
      0,
      policiesContainerUrl.length - POLICIES_CONTAINER.length
    );
    const matchingStart = sharedStart(resourceUrl, rootUrl);
    const path = `${resourceUrl.substr(
      matchingStart.length
    )}.ttl.${policyName}.ttl`;
    return joinPath(getPoliciesContainerUrl(matchingStart), path);
  }
  return policiesContainerUrl;
}

export function getPolicyType(type) {
  return POLICIES_TYPE_MAP[type];
}

export function isCustomPolicy(type) {
  return customPolicies.find((policy) => policy.name === type) !== undefined;
}

export function isNamedPolicy(type) {
  return namedPolicies.find((policy) => policy.name === type) !== undefined;
}
