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
import useResourceInfo, { GET_RESOURCE_INFO } from "./index";

jest.mock("swr");

describe("useResourceInfo", () => {
  const iri = "iri";

  beforeEach(() => {
    useSWR.mockReturnValue(42);
    jest.spyOn(solidClientFns, "getResourceInfo").mockReturnValue(1337);
  });

  it("caches using SWR", () => {
    expect(renderHook(() => useResourceInfo(iri)).result.current).toBe(42);
    expect(useSWR).toHaveBeenCalledWith(
      [iri, GET_RESOURCE_INFO],
      expect.any(Function)
    );
  });

  it("fetches data using getResourceInfo", () => {
    renderHook(() => useResourceInfo(iri));
    expect(useSWR.mock.calls[0][1]()).toBe(1337);
    expect(solidClientFns.getResourceInfo).toHaveBeenCalledWith(iri, {
      fetch: expect.any(Function),
    });
  });

  it("handles string undefined being passed as iri", () => {
    renderHook(() => useResourceInfo("undefined"));
    expect(useSWR).toHaveBeenCalledWith(null, expect.any(Function));
  });
});
