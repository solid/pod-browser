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
import { sharedStart } from "./utils";
import { joinPath } from "../stringHelpers";

const POLICIES_CONTAINER = "pb_policies/";

export function getPoliciesContainerUrl(podRootUri) {
  return joinPath(podRootUri, POLICIES_CONTAINER);
}

export function getPolicyUrl(resource, policiesContainer) {
  const resourceUrl = getSourceUrl(resource);
  const policiesContainerUrl = getSourceUrl(policiesContainer);
  const rootUrl = policiesContainerUrl.substr(
    0,
    policiesContainerUrl.length - POLICIES_CONTAINER.length
  );
  const matchingStart = sharedStart(resourceUrl, rootUrl);
  const path = `${resourceUrl.substr(matchingStart.length)}.ttl`;
  return joinPath(getPoliciesContainerUrl(matchingStart), path);
}
