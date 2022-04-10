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

import { renderHook, act } from "@testing-library/react-hooks";
import useLocalStorage from "./index";

import mockLocalStorage from "../../../__testUtils/mockLocalStorage";
import mockConsole from "../../../__testUtils/mockConsole";

const KEY = "key";
const VALUES = {
  INITIAL: "initial value",
  CHANGED: "changed value",
  NONE: "",
};

describe("useLocalStorage", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage(),
      writable: true,
    });

    Object.defineProperty(window, "console", {
      value: mockConsole(),
      writable: true,
    });
  });

  describe("Setup", () => {
    it("Returns initial value", () => {
      const { result } = renderHook(() => useLocalStorage(KEY, VALUES.INITIAL));
      expect(result.current[0]).toMatch(VALUES.INITIAL);
    });

    it("When no initial value is passed, returns an empty string", () => {
      const { result } = renderHook(() => useLocalStorage(KEY));
      expect(result.current[0]).toMatch(VALUES.NONE);
    });

    it("Returns setValue function", () => {
      const { result } = renderHook(() => useLocalStorage(KEY, VALUES.INITIAL));
      expect(typeof result.current[1]).toMatch("function");
    });

    it("Returns the initial value when localstorage contains invalid JSON", () => {
      jest.spyOn(window.localStorage, "getItem").mockReturnValue("not json");

      const { result } = renderHook(() => useLocalStorage(KEY, VALUES.INITIAL));

      expect(result.current[0]).toMatch(VALUES.INITIAL);

      // I don't think we really need a test to cover this:
      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("When `setValue()` is called, the `value` updates", () => {
    const setItemSpy = jest.spyOn(window.localStorage, "setItem");

    const { result } = renderHook(() => useLocalStorage(KEY, VALUES.INITIAL));

    act(() => {
      result.current[1](VALUES.CHANGED);
    });

    expect(result.current[0]).toMatch(VALUES.CHANGED);
    expect(setItemSpy).toHaveBeenCalledWith(KEY, VALUES.CHANGED);
  });

  // Ideally the error case for localstorage.setItem is handled, but this is
  // currently not present in the code:
  it.skip("When `setValue()` is called, handles errors from localstorage", () => {
    // Replace setItem in localStorage with something that errors:
    const setItemSpy = jest.spyOn(window.localStorage, "setItem");
    setItemSpy.mockImplementation(() => {
      throw new Error("Storage is full");
    });

    const { result } = renderHook(() => useLocalStorage(KEY, VALUES.INITIAL));

    act(() => {
      result.current[1](VALUES.CHANGED);
    });

    expect(setItemSpy).toHaveBeenCalledWith(KEY, VALUES.CHANGED);
    expect(result.current[0]).toBe(VALUES.INITIAL);
  });
});
