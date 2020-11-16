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
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockUnauthenticatedSession } from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { renderWithTheme } from "../../../__testUtils/renderWithTheme";
import { mountToJson } from "../../../__testUtils/mountWithTheme";

import ProviderLogin from "./index";

jest.mock("../../../src/windowHelpers");

describe("ProviderLogin form", () => {
  test("Renders a webid login form, with button bound to login", () => {
    const tree = mountToJson(<ProviderLogin />);

    expect(tree).toMatchSnapshot();
  });
  test("It calls the login function upon submitting the form", () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { login } = session;
    renderWithTheme(
      <SessionProvider>
        <ProviderLogin />
      </SessionProvider>
    );
    const loginInput = screen.getByText("Select ID provider");
    userEvent.type(loginInput, "{enter}");
    expect(login).toHaveBeenCalled();
  });
});
