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

import { renderHook } from "@testing-library/react-hooks";
import useIdpFromQuery from "./index";
import useQuery from "../useQuery";

jest.mock("../useQuery");

describe("useIdpFromQuery", () => {
  it("returns null when there is no idp query param", () => {
    useQuery.mockReturnValue(undefined);
    const { result } = renderHook(() => useIdpFromQuery());
    expect(result.current).toBeNull();
  });

  it("returns an object with a valid idp query param", () => {
    const idp = "https://example.com";
    useQuery.mockReturnValue(idp);
    const { result } = renderHook(() => useIdpFromQuery());
    expect(result.current).toEqual({
      iri: idp,
      label: "example.com",
    });
  });

  it("returns null on invalid idp query param", () => {
    useQuery.mockReturnValue("test");
    const { result } = renderHook(() => useIdpFromQuery());
    expect(result.current).toBeNull();
  });
});
