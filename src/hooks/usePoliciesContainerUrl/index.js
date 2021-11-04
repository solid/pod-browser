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

import { acp_v3 as acp, getSourceIri } from "@inrupt/solid-client";
import { useEffect, useState } from "react";
import usePodRootUri from "../usePodRootUri";
import { getPoliciesContainerUrl } from "../../models/policy";
import useIsLegacyAcp from "../useIsLegacyAcp";

export default function usePoliciesContainerUrl(resourceInfo) {
  const [policiesContainerUrl, setPoliciesContainerUrl] = useState();
  const rootUrl = usePodRootUri(getSourceIri(resourceInfo));
  const { data: isLegacy } = useIsLegacyAcp(resourceInfo);

  useEffect(() => {
    if (isLegacy) {
      setPoliciesContainerUrl(
        rootUrl ? getPoliciesContainerUrl(rootUrl) : null
      );
    } else {
      setPoliciesContainerUrl(
        resourceInfo !== undefined && resourceInfo !== null
          ? acp.getLinkedAcrUrl(resourceInfo) ?? null
          : null
      );
    }
  }, [isLegacy, resourceInfo, rootUrl]);

  return policiesContainerUrl;
}
