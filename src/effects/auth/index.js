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

import { useEffect, useContext } from "react";
import Router from "next/router";
import { getSolidDatasetWithAcl, hasResourceAcl } from "@inrupt/solid-client";
import SessionContext from "../../contexts/sessionContext";
import useAuthenticatedProfile from "../../hooks/useAuthenticatedProfile";
import usePodRoot from "../../hooks/usePodRoot";

export const SESSION_STATES = {
  LOGGED_IN: "LOGGED_IN",
  LOGGED_OUT: "LOGGED_OUT",
};

export async function redirectBasedOnSessionState(
  sessionIsLoggedIn,
  isLoadingSession,
  redirectIfSessionState,
  location
) {
  if (isLoadingSession) {
    return;
  }

  if (
    sessionIsLoggedIn &&
    redirectIfSessionState === SESSION_STATES.LOGGED_IN
  ) {
    await Router.push(location);
  }

  if (
    !sessionIsLoggedIn &&
    redirectIfSessionState === SESSION_STATES.LOGGED_OUT
  ) {
    await Router.push(location);
  }
}

export function useRedirectIfLoggedOut(location = "/login") {
  const { session, isLoadingSession } = useContext(SessionContext);

  useEffect(() => {
    redirectBasedOnSessionState(
      session.info.isLoggedIn,
      isLoadingSession,
      SESSION_STATES.LOGGED_OUT,
      location
    );
  });
}

export function useRedirectIfLoggedIn(location = "/") {
  const { session, isLoadingSession } = useContext(SessionContext);

  useEffect(() => {
    redirectBasedOnSessionState(
      session.info.isLoggedIn,
      isLoadingSession,
      SESSION_STATES.LOGGED_IN,
      location
    );
  });
}

export function useRedirectIfNoControlAccessToOwnPod(
  resourceUrl,
  location = "/access-required"
) {
  const { session, isLoadingSession } = useContext(SessionContext);
  const profile = useAuthenticatedProfile();
  const podRoot = usePodRoot(resourceUrl, profile);

  useEffect(() => {
    if (isLoadingSession || !profile) return;

    Promise.all(
      profile.pods
        .filter((pod) => pod === podRoot)
        .map((pod) =>
          getSolidDatasetWithAcl(pod, {
            fetch: session.fetch,
          })
        )
    ).then((podResources) => {
      const hasControlAccessToPods = !podResources.find(
        (podResource) => !hasResourceAcl(podResource)
      );
      if (hasControlAccessToPods) return;
      Router.push(location);
    });
  }, [session, isLoadingSession, profile, location, podRoot]);
}
