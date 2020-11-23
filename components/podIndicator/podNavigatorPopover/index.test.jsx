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
import { renderWithTheme } from "../../../__testUtils/withTheme";
import PodNavigatorPopover, {
  submitHandler,
  closeHandler,
  clickHandler,
} from "./index";
import { resourceHref } from "../../../src/navigator";
import { normalizeContainerUrl } from "../../../src/stringHelpers";

test("it renders the pod indicator with the correct name with a formatted name", async () => {
  const { asFragment, queryByText } = renderWithTheme(
    <PodNavigatorPopover
      anchor={{}}
      setDisplayNavigator={() => {}}
      popoverWidth={100}
    />
  );
  expect(queryByText("Alice")).toBeDefined();
  expect(asFragment()).toMatchSnapshot();
});

describe("submitHandler", () => {
  const url = "http://url.com";
  let event;
  let handleClose;
  let setUrl;
  const router = {};
  let setDirtyForm;
  let setDirtyUrlField;

  beforeEach(() => {
    event = { preventDefault: jest.fn() };
    handleClose = jest.fn();
    setUrl = jest.fn();
    router.push = jest.fn();
    setDirtyForm = jest.fn();
    setDirtyUrlField = jest.fn();
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
      const setDisplayNavigator = jest.fn();
      closeHandler(setAnchorEl, setDisplayNavigator)();
      expect(setAnchorEl).toHaveBeenCalledWith(null);
      expect(setDisplayNavigator).toHaveBeenCalledWith(false);
    });
  });

  test("it sets up a submit handler", async () => {
    await submitHandler(
      handleClose,
      setUrl,
      setDirtyForm,
      setDirtyUrlField
    )(event, url, router);
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(router.push).toHaveBeenCalledWith(
      "/resource/[iri]",
      resourceHref(normalizeContainerUrl(url))
    );
    expect(handleClose).toHaveBeenCalledWith();
    expect(setUrl).toHaveBeenCalledWith("");
    expect(setDirtyForm).toHaveBeenCalledWith(false);
    expect(setDirtyUrlField).toHaveBeenCalledWith(false);
  });

  it("should do nothing if no url is given", async () => {
    await submitHandler(
      handleClose,
      setUrl,
      setDirtyForm,
      setDirtyUrlField
    )(event, "", router);
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(router.push).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
    expect(setUrl).not.toHaveBeenCalled();
    expect(setDirtyForm).toHaveBeenCalledWith(true);
    expect(setDirtyUrlField).not.toHaveBeenCalled();
  });
});
