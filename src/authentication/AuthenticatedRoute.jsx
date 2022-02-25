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

import React, { useEffect } from "react";
import T from "prop-types";
import { useRouter } from "next/router";
import { useSession } from "@inrupt/solid-ui-react";
import Spinner from "../../components/spinner";

const isAuthCallback = (asPath) => {
  try {
    const route = new URL(asPath, window.location.href);
    const params = route.searchParams;

    return params.has("error") || (params.has("code") && params.has("code"));
  } catch (e) {
    return false;
  }
};
const AuthenticatedRoute = ({ children }) => {
  const { session, sessionRequestInProgress } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.info.isLoggedIn || sessionRequestInProgress) {
      // no-op for logged-in or session is still loading
      return;
    }

    // We use window.location.href as router.asPath is not actually accurate:
    const current = new URL(window.location.href);
    const path = current.pathname + current.search;

    if (isAuthCallback(path)) {
      return;
    }

    router.replace({
      pathname: "/login",
      query: { returnTo: path },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session.info.isLoggedIn) {
    return <>{children}</>;
  }

  // You may receive bug reports relating to this, but hopefully you never will:
  // Basically a user could get stuck at the spinner and not have a "next"
  // action to do, but reloading the page should fix the problem
  return <Spinner />;
};

AuthenticatedRoute.propTypes = {
  children: T.node.isRequired,
};

export default AuthenticatedRoute;
