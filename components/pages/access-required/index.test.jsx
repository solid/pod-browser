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
import Router from "next/router";
import mockSession, {
  mockUnauthenticatedSession,
} from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import AccessRequired from ".";
import { mountToJson } from "../../../__testUtils/mountWithTheme";

jest.mock("next/router");

describe("Access Required page", () => {
  test("with profile that has access to Pod", () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider({
      session,
      isLoadingSession: false,
    });

    const snapshot = mountToJson(
      <SessionProvider>
        <AccessRequired />
      </SessionProvider>
    );
    expect(snapshot).toMatchSnapshot();
  });

  test("unauthenticated profile is redirected to login", () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider({
      session,
      isLoadingSession: false,
    });

    Router.push.mockResolvedValue(null);

    mountToJson(
      <SessionProvider>
        <AccessRequired />
      </SessionProvider>
    );

    expect(Router.push).toHaveBeenCalledWith("/login");
  });
});
