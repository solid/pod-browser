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
import userEvent from "@testing-library/user-event";
import { useSession } from "@inrupt/solid-ui-react";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import MenuDrawer, { TESTCAFE_ID_MENU_DRAWER_BUTTON } from "./index";
import { mockAuthenticatedSession } from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { TESTCAFE_ID_USER_MENU_LOGOUT } from "../../../src/hooks/useUserMenu";

jest.mock("@inrupt/solid-ui-react");
const mockedUseSession = useSession;

describe("MenuDrawer", () => {
  let logout;
  let session;
  let SessionProvider;

  beforeEach(() => {
    logout = jest.fn();
    session = { ...mockAuthenticatedSession() };
    SessionProvider = mockSessionContextProvider(session);
    mockedUseSession.mockReturnValue({ session, logout });
  });

  it("renders menu drawer", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <SessionProvider>
        <MenuDrawer />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_MENU_DRAWER_BUTTON)).toBeDefined();
  });

  it("customizes onClick for buttons (e.g. for log out)", () => {
    const { getByTestId } = renderWithTheme(
      <SessionProvider>
        <MenuDrawer />
      </SessionProvider>
    );
    userEvent.click(getByTestId(TESTCAFE_ID_MENU_DRAWER_BUTTON));
    userEvent.click(getByTestId(TESTCAFE_ID_USER_MENU_LOGOUT));
    expect(logout).toHaveBeenCalled();
  });
});
