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

import React from "react";
import T from "prop-types";
import WithTheme from "./withTheme";
import { FeatureProvider } from "../src/contexts/featureFlagsContext";
import { AlertProvider } from "../src/contexts/alertContext";
import { ConfirmationDialogProvider } from "../src/contexts/confirmationDialogContext";
import mockSessionContextProvider from "./mockSessionContextProvider";
import mockSession from "./mockSession";

export default function TestApp({ children, session }) {
  const SessionProvider = mockSessionContextProvider(session);
  return (
    <WithTheme>
      <SessionProvider>
        <FeatureProvider>
          <AlertProvider>
            <ConfirmationDialogProvider>{children}</ConfirmationDialogProvider>
          </AlertProvider>
        </FeatureProvider>
      </SessionProvider>
    </WithTheme>
  );
}

TestApp.defaultProps = {
  session: mockSession(),
};

TestApp.propTypes = {
  children: T.node.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  session: T.object,
};
