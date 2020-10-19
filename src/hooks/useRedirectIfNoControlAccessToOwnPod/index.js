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
import { useEffect } from "react";
import Router from "next/router";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import usePodRootUri from "../usePodRootUri";
import useResourceInfo from "../useResourceInfo";
import { hasAccess } from "../../accessControl";

export default function useRedirectIfNoControlAccessToOwnPod(
  resourceUrl,
  location = "/access-required"
) {
  const { fetch, sessionRequestInProgress } = useSession();
  const { data: profile } = useAuthenticatedProfile();
  const podRootUri = usePodRootUri(resourceUrl, profile);
  const profilePodUri =
    podRootUri && profile
      ? profile.pods.find((pod) => pod === podRootUri)
      : null;
  const { data: profilePod } = useResourceInfo(profilePodUri);

  useEffect(() => {
    if (sessionRequestInProgress || !profile || !profilePod) {
      return;
    }
    if (hasAccess(profilePod)) {
      return;
    }
    Router.push(location);
  }, [sessionRequestInProgress, profile, location, fetch, profilePod]);
}
