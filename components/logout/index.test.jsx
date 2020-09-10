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
import { mountToJson } from "enzyme-to-json";

import { clearLocalstorage, hardRedirect } from "../../src/windowHelpers";

import SessionContext from "../../src/contexts/sessionContext";

import LogOutButton from "./index";

jest.mock("../../src/windowHelpers");

describe("Logout button", () => {
  test("Renders a logout button", () => {
    const session = {
      logout: jest.fn(),
    };

    const tree = mount(
      <SessionContext.Provider value={{ session }}>
        <LogOutButton>Log Out</LogOutButton>
      </SessionContext.Provider>
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("Calls logout and redirects on click", async () => {
    const session = {
      logout: jest.fn(),
    };

    const tree = mount(
      <SessionContext.Provider value={{ session }}>
        <LogOutButton>Log Out</LogOutButton>
      </SessionContext.Provider>
    );

    tree.simulate("click", { preventDefault: () => {} });

    expect(session.logout).toHaveBeenCalled();

    // Wait until promises resolve, then continue.
    await session.logout();

    expect(clearLocalstorage).toHaveBeenCalled();
    expect(hardRedirect).toHaveBeenCalledWith("/login");
  });
});
