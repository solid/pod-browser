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

import useSWR from "swr";
import * as solidClientFns from "@inrupt/solid-client";
import { renderHook } from "@testing-library/react-hooks";
import { useSession } from "@inrupt/solid-ui-react";
import useDataset, { GET_DATASET } from "./index";

jest.mock("swr");
const mockedSwrHook = useSWR;

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
const mockedSessionHook = useSession;

describe("useDataset", () => {
  const iri = "http://example.com";
  const response = 1337;
  const fetch = jest.fn();
  const swrResponse = 42;

  beforeEach(() => {
    mockedSessionHook.mockReturnValue({ fetch });
    jest.spyOn(solidClientFns, "getSolidDataset").mockResolvedValue(response);
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  it("caches with SWR", () => {
    const value = renderHook(() => useDataset(iri, { refreshInterval: 0 }));
    expect(value.result.current).toBe(swrResponse);
    expect(useSWR).toHaveBeenCalledWith(
      [iri, GET_DATASET],
      expect.any(Function),
      { refreshInterval: 0 }
    );
  });

  test("useSWR fetches data using getSolidDataset", async () => {
    renderHook(() => useDataset(iri));
    await expect(useSWR.mock.calls[0][1]()).resolves.toBe(response);
    expect(solidClientFns.getSolidDataset).toHaveBeenCalledWith(iri, { fetch });
    expect(useSWR).toHaveBeenCalledWith(
      [iri, GET_DATASET],
      expect.any(Function),
      {}
    );
  });

  it("returns null if no URL is given", async () => {
    renderHook(() => useDataset(null));
    await expect(useSWR.mock.calls[0][1]()).resolves.toBeNull();
  });
});
