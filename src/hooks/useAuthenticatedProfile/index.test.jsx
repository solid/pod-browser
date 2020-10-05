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
import { renderHook } from "@testing-library/react-hooks";
import useAuthenticatedProfile from "./index";
import useFetchProfile from "../useFetchProfile";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import mockSession, {
  mockUnauthenticatedSession,
  webIdUrl,
} from "../../../__testUtils/mockSession";

jest.mock("../useFetchProfile");

const webId = "https://webid.com/#me";
const profile = { webId };

describe("useAuthenticatedProfile", () => {
  test("no profile loaded when no session is given", () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider(session);
    const wrapper = ({ children }) => (
      <SessionProvider>{children}</SessionProvider>
    );

    useFetchProfile.mockReturnValue(null);

    const { result } = renderHook(() => useAuthenticatedProfile(), { wrapper });
    expect(result.current).toBeNull();
    expect(useFetchProfile).toHaveBeenCalledWith(null);
  });

  test("profile is loaded when session is given", () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const wrapper = ({ children }) => (
      <SessionProvider>{children}</SessionProvider>
    );

    useFetchProfile.mockReturnValue(profile);

    const { result } = renderHook(() => useAuthenticatedProfile(), { wrapper });

    expect(result.current).toBe(profile);
    expect(useFetchProfile).toHaveBeenCalledWith(webIdUrl);
  });
});
