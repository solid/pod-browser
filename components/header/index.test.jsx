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
import { useRouter } from "next/router";
import { waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import Header, { TESTCAFE_ID_HEADER_LOGO } from "./index";
import {
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
} from "../../__testUtils/mockSession";
import { TESTCAFE_ID_USER_MENU } from "./userMenu";
import { TESTCAFE_ID_MAIN_NAV } from "./mainNav";
import { TESTCAFE_ID_MENU_DRAWER } from "./menuDrawer";
import useAuthenticatedProfile from "../../src/hooks/useAuthenticatedProfile";
import { mockProfileAlice } from "../../__testUtils/mockPersonResource";

jest.mock("next/router");
const mockedRouterHook = useRouter;

jest.mock("../../src/hooks/useAuthenticatedProfile");
const mockedAuthenticatedHook = useAuthenticatedProfile;

describe("Header", () => {
  describe("with user logged in", () => {
    beforeEach(() => {
      mockedRouterHook.mockReturnValue({
        query: {
          iri: "https://mypod.myhost.com",
        },
      });
    });

    it("renders a header", async () => {
      const session = mockAuthenticatedSession();
      const SessionProvider = mockSessionContextProvider(session);
      mockedAuthenticatedHook.mockReturnValue(mockProfileAlice());

      const { asFragment, queryByTestId } = renderWithTheme(
        <SessionProvider>
          <Header />
        </SessionProvider>
      );
      await waitFor(() => {
        expect(queryByTestId(TESTCAFE_ID_HEADER_LOGO)).toBeDefined();
        expect(queryByTestId(TESTCAFE_ID_MENU_DRAWER)).toBeDefined();
        expect(queryByTestId(TESTCAFE_ID_MAIN_NAV)).toBeDefined();
        expect(queryByTestId(TESTCAFE_ID_USER_MENU)).toBeDefined();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("while user logged out", () => {
    it("renders only logo", () => {
      const session = mockUnauthenticatedSession();
      const SessionProvider = mockSessionContextProvider(session);

      const { asFragment, queryByTestId } = renderWithTheme(
        <SessionProvider>
          <Header />
        </SessionProvider>
      );

      expect(asFragment()).toMatchSnapshot();
      expect(queryByTestId(TESTCAFE_ID_HEADER_LOGO)).toBeDefined();
      expect(queryByTestId(TESTCAFE_ID_MENU_DRAWER)).toBeNull();
      expect(queryByTestId(TESTCAFE_ID_MAIN_NAV)).toBeNull();
      expect(queryByTestId(TESTCAFE_ID_USER_MENU)).toBeNull();
    });
  });
});
