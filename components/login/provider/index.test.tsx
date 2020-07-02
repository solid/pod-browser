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

import auth from "solid-auth-client";
import { mount } from "enzyme";
import { mountToJson, WithTheme } from "../../../__testUtils/mountWithTheme";

import ProviderLogin, * as ProviderFunctions from "./index";

jest.mock("solid-auth-client");

describe("ProviderLogin form", () => {
  test("Renders a webid login form, with button bound to login", () => {
    const tree = mountToJson(<ProviderLogin />);

    expect(tree).toMatchSnapshot();
  });
});

describe("loginWithProvider", () => {
  test("clicking login calls loginWithProvider", () => {
    const tree = mount(
      <WithTheme>
        <ProviderLogin />
      </WithTheme>
    );

    (auth.popupLogin as jest.Mock).mockResolvedValue(null);
    tree.find("button").simulate("click", { preventDefault: () => {} });

    expect(auth.popupLogin).toHaveBeenCalledWith({
      popupUri: `/login-popup.html`,
    });
  });

  test("Calls login", async () => {
    (auth.popupLogin as jest.Mock).mockResolvedValue(null);

    await ProviderFunctions.loginWithProvider();

    expect(auth.popupLogin).toHaveBeenCalledWith({
      popupUri: `/login-popup.html`,
    });
  });

  test("Bubbles errors", async () => {
    const error = "Failure";
    (auth.popupLogin as jest.Mock).mockRejectedValue(error);
    await expect(ProviderFunctions.loginWithProvider()).rejects.toMatch(error);
  });
});
