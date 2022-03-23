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
import { useRouter } from "next/router";

import useReturnUrl, { RETURN_TO_PAGE_KEY } from "./useReturnUrl";
import mockLocalStorage from "../../__testUtils/mockLocalStorage";

jest.mock("next/router");

describe("useReturnUrl", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage(),
      writable: true,
    });
  });

  it("returns a persist and restore method", () => {
    const { result } = renderHook(() => useReturnUrl());

    expect(result.current).toHaveProperty("restore");
    expect(result.current).toHaveProperty("persist");
  });

  it("persists the returnTo query param to localstorage", () => {
    useRouter.mockReturnValue({ query: { returnTo: "/some/path" } });
    const setItemSpy = jest.spyOn(window.localStorage, "setItem");

    const { result } = renderHook(() => useReturnUrl());

    act(() => {
      result.current.persist();
    });

    expect(setItemSpy).toHaveBeenCalledWith(RETURN_TO_PAGE_KEY, "/some/path");
  });

  it("should not persists if the returnTo query parameter is missing", () => {
    useRouter.mockReturnValue({ query: {} });
    const setItemSpy = jest.spyOn(window.localStorage, "setItem");

    const { result } = renderHook(() => useReturnUrl());

    act(() => {
      result.current.persist();
    });

    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("restores the route from localstorage", async () => {
    const replaceMock = jest.fn();
    useRouter.mockReturnValue({ replace: replaceMock });

    const getItemSpy = jest.spyOn(window.localStorage, "getItem");
    getItemSpy.mockReturnValue("/some/path");

    const { result } = renderHook(() => useReturnUrl());

    act(() => {
      result.current.restore();
    });

    expect(getItemSpy).toHaveBeenCalledWith(RETURN_TO_PAGE_KEY);
    expect(replaceMock).toHaveBeenCalledWith("/some/path");
  });

  it("restores the route to route if the stored value is not relative", async () => {
    const replaceMock = jest.fn();
    useRouter.mockReturnValue({ replace: replaceMock });

    const getItemSpy = jest.spyOn(window.localStorage, "getItem");
    getItemSpy.mockReturnValue("some/non-relative/path");

    const { result } = renderHook(() => useReturnUrl());

    act(() => {
      result.current.restore();
    });

    expect(getItemSpy).toHaveBeenCalledWith(RETURN_TO_PAGE_KEY);
    expect(replaceMock).toHaveBeenCalledWith("/");
  });
});
