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
import { mount } from "enzyme";

import {
  clearLocalstorage,
  generateRedirectUrl,
} from "../../../src/windowHelpers";

import SessionContext from "../../../src/contexts/sessionContext";
import { mountToJson, WithTheme } from "../../../__testUtils/mountWithTheme";

import ProviderLogin, * as ProviderFunctions from "./index";

jest.mock("../../../src/windowHelpers");

describe("ProviderLogin form", () => {
  test("Renders a webid login form, with button bound to login", () => {
    const tree = mountToJson(<ProviderLogin />);

    expect(tree).toMatchSnapshot();
  });
});

describe("loginWithProvider", () => {
  test("clicking login calls loginWithProvider", () => {
    const session = {
      login: jest.fn(),
    };

    const tree = mount(
      <SessionContext.Provider value={{ session }}>
        <WithTheme>
          <ProviderLogin />
        </WithTheme>
      </SessionContext.Provider>
    );

    tree
      .find("button[children='Log In']")
      .simulate("click", { preventDefault: () => {} });

    expect(session.login).toHaveBeenCalled();
  });

  test("Calls login", async () => {
    const redirect = "foo";
    const providerIri = "https://test.url";
    const session = {
      login: jest.fn(),
    };

    generateRedirectUrl.mockReturnValue("foo");

    await ProviderFunctions.loginWithProvider(providerIri, session);

    expect(clearLocalstorage).toHaveBeenCalled();
    expect(session.login).toHaveBeenCalledWith({
      oidcIssuer: providerIri,
      redirectUrl: redirect,
    });
  });

  test("Bubbles errors", async () => {
    const error = "Failure";
    const providerIri = "https://test.url";
    const session = {
      login: jest.fn().mockRejectedValue(error),
    };

    await expect(
      ProviderFunctions.loginWithProvider(providerIri, session)
    ).rejects.toMatch(error);
  });
});
