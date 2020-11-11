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

import { useEffect, useState } from "react";
import { useSession } from "@inrupt/solid-ui-react";
// eslint-disable-next-line camelcase
import { acp_v1 } from "@inrupt/solid-client/dist";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import { getPoliciesContainerUrl } from "../../solidClientHelpers/policies";
import { getOrCreateContainer } from "../../solidClientHelpers/resource";
import useResourceInfo from "../useResourceInfo";

export default function usePoliciesContainer() {
  const [policiesContainer, setPoliciesContainer] = useState();
  const { fetch } = useSession();
  const { data: profile } = useAuthenticatedProfile();
  const podRootUri = profile?.pods[0];
  const { data: podRoot, error: podRootError } = useResourceInfo(podRootUri);
  const [error, setError] = useState(podRootError || null);

  useEffect(() => {
    if (!profile || podRootError || !podRoot || !acp_v1.hasLinkedAcr(podRoot)) {
      setPoliciesContainer(null);
      setError(podRootError || null);
      return;
    }
    const policiesUri = getPoliciesContainerUrl(podRootUri);
    getOrCreateContainer(policiesUri, fetch).then(
      ({ response, error: createError }) => {
        setPoliciesContainer(response || null);
        setError(createError || null);
      }
    );
  }, [fetch, podRoot, podRootError, podRootUri, profile]);

  return { policiesContainer, error };
}
