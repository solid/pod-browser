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
import { render } from "@testing-library/react";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import AppProfile, {
  setupErrorComponent,
  TESTCAFE_ID_NAME_TITLE,
  TESTCAFE_ID_WEBID_FIELD,
  TESTCAFE_ID_TOS_FIELD,
  TESTCAFE_ID_POLICY_FIELD,
} from "./index";
import {
  APP_POLICY_URL,
  APP_TOS_URL,
  APP_WEBID,
} from "../../../__testUtils/mockApp";

describe("App Profile", () => {
  // FIXME: for now this renders only one possibility - need to update once we're not hardcoding the mock app
  test("renders a mock app profile", async () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { asFragment, findByTestId } = renderWithTheme(
      <SessionProvider>
        <AppProfile />
      </SessionProvider>
    );
    await expect(findByTestId(TESTCAFE_ID_NAME_TITLE)).resolves.not.toBeNull();
    expect(await findByTestId(TESTCAFE_ID_NAME_TITLE)).toHaveTextContent(
      "Mock App"
    );
    expect(await findByTestId(TESTCAFE_ID_WEBID_FIELD)).toHaveTextContent(
      APP_WEBID
    );
    expect(await findByTestId(TESTCAFE_ID_TOS_FIELD)).toHaveTextContent(
      APP_TOS_URL
    );
    expect(await findByTestId(TESTCAFE_ID_POLICY_FIELD)).toHaveTextContent(
      APP_POLICY_URL
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("setupErrorComponent", () => {
  it("renders", () => {
    const bem = (value) => value;
    const { asFragment } = render(setupErrorComponent(bem)());
    expect(asFragment()).toMatchSnapshot();
  });
});
