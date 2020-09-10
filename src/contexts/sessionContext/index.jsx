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

import React, { createContext } from "react";
import {
  Session,
  getClientAuthenticationWithDependencies,
} from "@inrupt/solid-client-authn-browser";
import T from "prop-types";

export const defaultSessionContext = {
  session: new Session({
    clientAuthentication: getClientAuthenticationWithDependencies({}),
  }),
  isLoadingSession: true,
};
const sessionContext = createContext(defaultSessionContext);
export default sessionContext;

export function SessionContextProvider({
  children,
  isLoadingSession,
  session,
}) {
  return (
    <sessionContext.Provider value={{ session, isLoadingSession }}>
      {children}
    </sessionContext.Provider>
  );
}

SessionContextProvider.propTypes = {
  children: T.node,
  isLoadingSession: T.bool,
  session: T.node.isRequired,
};

SessionContextProvider.defaultProps = {
  children: null,
  isLoadingSession: false,
};
