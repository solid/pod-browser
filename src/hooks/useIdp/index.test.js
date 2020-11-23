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

import * as routerFns from "next/router";
import { renderHook } from "@testing-library/react-hooks";
import useIdp from "./index";

describe("useIdp", () => {
  it("returns null when there is no idp query param", () => {
    jest.spyOn(routerFns, "useRouter").mockReturnValue({ query: {} });
    const { result } = renderHook(() => useIdp());
    expect(result.current).toBeNull();
  });

  it("returns an object with a valid idp query param", () => {
    const idp = "https://example.com";
    jest.spyOn(routerFns, "useRouter").mockReturnValue({ query: { idp } });
    const { result } = renderHook(() => useIdp());
    expect(result.current).toEqual({
      iri: idp,
      label: "example.com",
    });
  });

  it("will choose the first idp in a list of idps", () => {
    const idp1 = "https://example.com";
    const idp2 = "https://example2.com";
    jest
      .spyOn(routerFns, "useRouter")
      .mockReturnValue({ query: { idp: [idp1, idp2] } });
    const { result } = renderHook(() => useIdp());
    expect(result.current).toEqual({
      iri: idp1,
      label: "example.com",
    });
  });

  it("returns null on invalid idp query param", () => {
    jest
      .spyOn(routerFns, "useRouter")
      .mockReturnValue({ query: { idp: "test" } });
    const { result } = renderHook(() => useIdp());
    expect(result.current).toBeNull();
  });
});
