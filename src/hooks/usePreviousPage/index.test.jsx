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
import usePreviousPage from "./index";
import mockLocalStorage from "../../../__testUtils/mockLocalStorage";

describe("usePreviousPage", () => {
  const previousPage = "http://example.com/";

  describe("with Local Storage", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: mockLocalStorage(),
        writable: true,
      });
    });
    it("returns null when no previousPage is available in local storage", () => {
      const { result } = renderHook(() => usePreviousPage());
      expect(result.current).toBeNull();
    });

    it("returns previous page url when available in local storage", async () => {
      window.localStorage.setItem("previousPage", previousPage);
      const { result } = renderHook(() => usePreviousPage());
      expect(result.current).toBe(previousPage);
    });
  });

  describe("without Local Storage", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });
    });
    it("returns null when local storage is not available", () => {
      const { result } = renderHook(() => usePreviousPage());
      expect(result.current).toBeNull();
    });
  });
});
