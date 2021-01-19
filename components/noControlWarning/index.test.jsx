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

import React from "react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import NoControlWarning, {
  setupOnClose,
  TESTCAFE_ID_NO_CONTROL_ERROR,
} from "./index";

afterEach(() => sessionStorage.clear());

describe("NoControlWarning", () => {
  it("renders", () => {
    const { asFragment, queryByTestId } = renderWithTheme(
      <NoControlWarning podRootIri="http://example.com" />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByTestId(TESTCAFE_ID_NO_CONTROL_ERROR)).toBeTruthy();
  });

  it("renders nothing if no-control-warning-closed is set to true", () => {
    sessionStorage.setItem("no-control-warning-closed", "true");
    const { asFragment, queryByTestId } = renderWithTheme(
      <NoControlWarning podRootIri="http://example.com" />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByTestId(TESTCAFE_ID_NO_CONTROL_ERROR)).toBeFalsy();
  });
});

describe("setupOnClose", () => {
  it("allows user to close message", () => {
    expect(sessionStorage.getItem("no-control-warning-closed")).toBeNull();
    const event = { preventDefault: jest.fn() };
    expect(setupOnClose()(event)).toBeUndefined();
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(sessionStorage.getItem("no-control-warning-closed")).toEqual("true");
  });
});
