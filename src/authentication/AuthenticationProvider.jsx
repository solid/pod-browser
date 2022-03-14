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

/* eslint-disable no-console */
import T from "prop-types";
import React, { useEffect, useCallback, useContext } from "react";
import { useRouter } from "next/router";
import { useSession } from "@inrupt/solid-ui-react";
import { EVENTS } from "@inrupt/solid-client-authn-core";

import useReturnUrl from "./useReturnUrl";
import AlertContext from "../contexts/alertContext";
import Spinner from "../../components/spinner";

export default function AuthenticationProvider({ children }) {
  const { session, sessionRequestInProgress } = useSession();
  const { alertError } = useContext(AlertContext);
  const router = useRouter();
  const { restore } = useReturnUrl();

  const onError = useCallback(
    async (error, description) => {
      alertError(`${error}: ${description}`);

      // FIXME: Remove once interaction_required bug in SDK is resolved:
      // Actually, I'm not sure, maybe we always want this?
      if (error === "interaction_required") {
        await session.logout();
      } else {
        await router.push("/login");
      }
    },
    [alertError, session, router]
  );

  const onSessionRestore = useCallback(
    async (url) => {
      await router.push(url);
    },
    [router]
  );

  const onLogin = useCallback(async () => {
    restore();
  }, [restore]);

  const onLogout = useCallback(async () => {
    await router.push("/login");
  }, [router]);

  useEffect(() => {
    session.on(EVENTS.ERROR, onError);
    // FIXME: Replace with EVENTS once solid-client-authn-js #2002 is merged
    session.on("login", onLogin);
    session.on("logout", onLogout);
    session.on("sessionRestore", onSessionRestore);

    return () => {
      session.off(EVENTS.ERROR, onError);
      // FIXME: Replace with EVENTS once solid-client-authn-js #2002 is merged
      session.off("login", onLogin);
      session.off("logout", onLogout);
      session.off("sessionRestore", onSessionRestore);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sessionRequestInProgress) {
    return <Spinner />;
  }

  return <>{children}</>;
}

AuthenticationProvider.propTypes = {
  children: T.node.isRequired,
};
