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
import usePodRootUri from "./index";

const location = "https://foo.com/bar/baz";
const locationWithNoEndingSlash = "https://bar.com";
const profile = {
  webId: "webId",
  pods: ["https://foo.com/bar/", locationWithNoEndingSlash],
};

describe("usePodRootUri", () => {
  test("it will return undefined if location is undefined", () => {
    const { result } = renderHook(() => usePodRootUri("undefined", null));
    expect(result.current).toBeNull();
  });

  test("it will guess storage URI if profile is null", () => {
    const { result } = renderHook(() => usePodRootUri(location, null));
    expect(result.current).toEqual("https://foo.com/");
  });

  test("it will guess storage URI if profile.pods is empty", () => {
    const { result } = renderHook(() =>
      usePodRootUri(location, { ...profile, pods: undefined })
    );
    expect(result.current).toEqual("https://foo.com/");
  });

  test("it will use storage URI in profile if it matches location", () => {
    const { result } = renderHook(() => usePodRootUri(location, profile));
    expect(result.current).toEqual("https://foo.com/bar/");
  });

  test("it makes sure baseUri ends with slash", () => {
    const { result } = renderHook(() =>
      usePodRootUri(locationWithNoEndingSlash, profile)
    );
    expect(result.current).toEqual("https://bar.com/");
  });
});
