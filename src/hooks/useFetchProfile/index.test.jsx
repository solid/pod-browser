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
import useSWR from "swr";
import { renderHook } from "@testing-library/react-hooks";
import mockSession, { webIdUrl } from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import * as profileHelpers from "../../solidClientHelpers/profile";
import useFetchProfile, { FETCH_PROFILE } from "./index";

jest.mock("swr");

describe("useFetchProfile", () => {
  const webId = webIdUrl;
  let value;

  beforeEach(() => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const wrapper = ({ children }) => (
      <SessionProvider>{children}</SessionProvider>
    );
    jest.spyOn(profileHelpers, "fetchProfile");
    useSWR.mockReturnValue(42);
    value = renderHook(() => useFetchProfile(webId), { wrapper });
  });

  it("caches with SWR", () => {
    expect(value.result.current).toBe(42);
    expect(useSWR).toHaveBeenCalledWith(
      [webId, FETCH_PROFILE],
      expect.any(Function)
    );
  });
  test("useSWR fetches data using fetchProfile", () => {
    useSWR.mock.calls[0][1]();
    expect(profileHelpers.fetchProfile).toHaveBeenCalledWith(
      webId,
      expect.any(Function)
    );
  });
});
