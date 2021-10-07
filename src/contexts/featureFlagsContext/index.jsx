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
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import rules from "../../featureFlags";

export const defaultContext = {
  enabled: () => false,
};
const FeatureContext = createContext(defaultContext);

export async function isEnabled(session, fetch, rule, extraContext) {
  const result = await rules()[rule](session, fetch, extraContext);
  return result;
}

export function FeatureProvider({ children }) {
  const { session, fetch } = useSession();

  const sessionBoundEnabled = (rule, extraContext) =>
    isEnabled(session, fetch, rule, extraContext);

  // Pass the current session in as context.
  return (
    <FeatureContext.Provider value={{ enabled: sessionBoundEnabled }}>
      {children}
    </FeatureContext.Provider>
  );
}

FeatureProvider.propTypes = {
  children: T.node,
};

FeatureProvider.defaultProps = {
  children: null,
};

export default FeatureContext;
