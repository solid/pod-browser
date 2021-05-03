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
import { render, act, screen } from "@testing-library/react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import Profile, {
  setupErrorComponent,
  TESTCAFE_ID_NAME_FIELD,
  TESTCAFE_ID_ORG_FIELD,
  TESTCAFE_ID_ROLE_FIELD,
} from "./index";

const profileIri = "https://example.com/profile/card#me";

describe("Profile", () => {
  test("renders a profile", () => {
    const { asFragment } = renderWithTheme(<Profile profileIri={profileIri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders an editable profile", () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    act(() => {
      const { asFragment } = renderWithTheme(
        <SessionProvider>
          <Profile profileIri={profileIri} editing />
        </SessionProvider>
      );
      expect(asFragment()).toMatchSnapshot();
    });
    expect(screen.findByTestId(TESTCAFE_ID_NAME_FIELD)).not.toBeNull();
    expect(screen.findByTestId(TESTCAFE_ID_ROLE_FIELD)).not.toBeNull();
    expect(screen.findByTestId(TESTCAFE_ID_ORG_FIELD)).not.toBeNull();
  });
});

describe("setupErrorComponent", () => {
  it("renders", () => {
    const bem = (value) => value;
    const { asFragment } = render(setupErrorComponent(bem)());
    expect(asFragment()).toMatchSnapshot();
  });
});
