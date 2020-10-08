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

import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { getResourceInfoWithAcl, hasResourceAcl } from "@inrupt/solid-client";
import Router from "next/router";
import usePodRoot from "../usePodRoot";
import useAuthenticatedProfile from "../useAuthenticatedProfile";

export default function useRedirectIfNoControlAccessToOwnPod(
  resourceUrl,
  location = "/access-required"
) {
  const { fetch, sessionRequestInProgress } = useSession();
  const { data: profile } = useAuthenticatedProfile();
  const podRoot = usePodRoot(resourceUrl, profile);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    if (sessionRequestInProgress || !profile) {
      setRedirect(null);
      return;
    }

    (async () => {
      const podResources = await Promise.all(
        profile.pods
          .filter((pod) => pod === podRoot)
          .map((pod) => getResourceInfoWithAcl(pod, { fetch }))
      );
      const hasControlAccessToPods = !podResources.find(
        (podResource) => !hasResourceAcl(podResource)
      );
      if (hasControlAccessToPods) {
        setRedirect(false);
        return;
      }
      await Router.push(location);
      setRedirect(true);
    })();
  }, [sessionRequestInProgress, profile, location, podRoot, fetch]);

  return redirect;
}
