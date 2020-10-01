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
import { mountToJson } from "../../__testUtils/mountWithTheme";
import PodNavigator, {
  clickHandler,
  closeHandler,
  submitHandler,
} from "./index";
import * as navigatorFns from "../../src/navigator";

describe("PodNavigator", () => {
  it("renders view", () => {
    expect(mountToJson(<PodNavigator />)).toMatchSnapshot();
  });
});

describe("clickHandler", () => {
  test("it sets up a click handler", () => {
    const setAnchorEl = jest.fn();
    const currentTarget = "test";
    clickHandler(setAnchorEl)({ currentTarget });
    expect(setAnchorEl).toHaveBeenCalledWith(currentTarget);
  });
});

describe("closeHandler", () => {
  test("it sets up a close handler", () => {
    const setAnchorEl = jest.fn();
    closeHandler(setAnchorEl)();
    expect(setAnchorEl).toHaveBeenCalledWith(null);
  });
});

describe("submitHandler", () => {
  const router = "router";
  const fetch = "fetch";
  const url = "url";
  let event;
  let handleClose;

  beforeEach(() => {
    event = { preventDefault: jest.fn() };
    handleClose = jest.fn();
  });

  test("it sets up a submit handler", async () => {
    jest.spyOn(navigatorFns, "urlRedirect").mockResolvedValue(false);
    await submitHandler(handleClose)(event, url, router, fetch);
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(navigatorFns.urlRedirect).toHaveBeenCalledWith(url, router, {
      fetch,
    });
    expect(handleClose).not.toHaveBeenCalled();
  });

  test("closes on successful redirect", async () => {
    jest.spyOn(navigatorFns, "urlRedirect").mockResolvedValue(true);
    await submitHandler(handleClose)(event, url, router, fetch);
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(navigatorFns.urlRedirect).toHaveBeenCalledWith(url, router, {
      fetch,
    });
    expect(handleClose).toHaveBeenCalledWith();
  });
});
