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

import { useEffect } from "react";
import Router, { useRouter } from "next/router";
import { useSession } from "@inrupt/solid-ui-react";

export const SESSION_STATES = {
  LOGGED_IN: "LOGGED_IN",
  LOGGED_OUT: "LOGGED_OUT",
};

export async function redirectBasedOnSessionState(
  sessionIsLoggedIn,
  sessionRequestInProgress,
  redirectIfSessionState,
  location
) {
  if (sessionRequestInProgress) {
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
  const { session, sessionRequestInProgress } = useSession();

  useEffect(() => {
    if (session.info.isLoggedIn) return;
    redirectBasedOnSessionState(
      session.info.isLoggedIn,
      sessionRequestInProgress,
      SESSION_STATES.LOGGED_OUT,
      location
    );
  });
}

export function useRedirectIfLoggedIn(location = "/") {
  const { session, sessionRequestInProgress } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (
      (session.info.isLoggedIn && !router.asPath.includes("login")) ||
      sessionRequestInProgress
    )
      return;
    redirectBasedOnSessionState(
      session.info.isLoggedIn,
      sessionRequestInProgress,
      SESSION_STATES.LOGGED_IN,
      location
    );
  }, [session, router, location, sessionRequestInProgress]);
}
