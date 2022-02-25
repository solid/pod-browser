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
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "@inrupt/solid-ui-react";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

import Spinner from "../../components/spinner";

export default function SessionReady({ children }) {
  const [sessionError, setSessionError] = useState();
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    const instance = getDefaultSession();
    instance.onError((error) => {
      console.error(error);
      setSessionError(error);
    });

    instance.onSessionRestore(async (url) => {
      console.log("onSessionRestore");
      try {
        await router.push(url);
      } catch (err) {
        console.error(err);
      }
    });

    instance.onLogout(async () => {
      console.log("onLogout");

      try {
        await router.push("/login");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    });
  });

  if (sessionError) {
    return <div>{sessionError.message}</div>;
  }

  if (session.sessionRequestInProgress) {
    return <Spinner />;
  }

  return <>{children}</>;
}

SessionReady.propTypes = {
  children: T.node.isRequired,
};
