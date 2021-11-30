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

import { useSession } from "@inrupt/solid-ui-react";
import useSWR from "swr";
import { renderHook } from "@testing-library/react-hooks";
import * as groupModelFns from "../../models/group";
import useGroup from "./index";

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
const mockedSessionHook = useSession;

jest.mock("swr");
const mockedSwrHook = useSWR;

describe("useGroup", () => {
  const fetch = jest.fn();
  const swrResponse = 42;
  const groupResponse = "group";
  const groupUrl = "groupUrl";

  beforeEach(() => {
    mockedSessionHook.mockReturnValue({ fetch });
    mockedSwrHook.mockReturnValue(swrResponse);
    jest.spyOn(groupModelFns, "getGroup").mockResolvedValue(groupResponse);
  });

  it("uses SWR to cache", () => {
    const { result } = renderHook(() => useGroup(groupUrl));
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwrHook).toHaveBeenCalledWith(
      ["group", groupUrl],
      expect.any(Function),
      { errorRetryCount: 0 }
    );
  });

  it("returns group if given group URL", async () => {
    renderHook(() => useGroup(groupUrl));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(
      groupResponse
    );
  });

  it("returns null if no URL", async () => {
    renderHook(() => useGroup(null));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
  });
});
