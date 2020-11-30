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

import { ERROR_REGEXES, hasError, isHTTPError } from "./index";

describe("hasError", () => {
  it("handles when URL is not an IdP for Chrome, Edge, and Firefox", () =>
    expect(hasError(new Error("fetch"), ERROR_REGEXES.INVALID_IDP)).toBe(true));
  it("handles when URL is not an IDP for Safari", () =>
    expect(
      hasError(
        new Error("Not allowed to request resource"),
        ERROR_REGEXES.INVALID_IDP
      )
    ).toBe(true));
  it("handles when value is not a valid URL for Chrome and Edge", () =>
    expect(hasError(new Error("Invalid URL"), ERROR_REGEXES.INVALID_URL)).toBe(
      true
    ));
  it("handles when value is not a value for Firefox", () =>
    expect(
      hasError(new Error("URL constructor"), ERROR_REGEXES.INVALID_URL)
    ).toBe(true));
  it("handles when value is empty", () =>
    expect(
      hasError(new Error("sessionId"), ERROR_REGEXES.HANDLER_NOT_FOUND)
    ).toBe(true));
});

describe("isHTTPError", () => {
  it("Checks http messages for given code", () => {
    expect(isHTTPError("Something with 404", 404)).toBeTruthy();
    expect(isHTTPError("Something with 500", 404)).toBeFalsy();
    expect(isHTTPError("Something with 404", 500)).toBeFalsy();
  });

  it("also handles Error objects", () => {
    expect(isHTTPError(new Error("Something with 404"), 404)).toBeTruthy();
    expect(isHTTPError(new Error("Something with 500"), 404)).toBeFalsy();
    expect(isHTTPError(new Error("Something with 404"), 500)).toBeFalsy();
  });
});
