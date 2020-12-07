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
import * as solidClientFns from "@inrupt/solid-client";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import PodNavigatorPopover, {
  submitHandler,
  closeHandler,
  clickHandler,
} from "./index";
import { resourceHref } from "../../../src/navigator";

describe("PodNavigatorPopover", () => {
  test("renders a pod navigator popover", () => {
    const { asFragment } = renderWithTheme(
      <PodNavigatorPopover
        anchor={{}}
        setDisplayNavigator={jest.fn()}
        popoverWidth={100}
      />
    );
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
    const fetch = jest.fn();

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
      const resourceInfo = solidClientFns.mockSolidDatasetFrom(url);
      jest
        .spyOn(solidClientFns, "getResourceInfo")
        .mockResolvedValue(resourceInfo);
      await submitHandler(
        handleClose,
        setUrl,
        setDirtyForm,
        setDirtyUrlField,
        url,
        router,
        fetch
      )(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(router.push).toHaveBeenCalledWith(
        "/resource/[iri]",
        resourceHref(url)
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
        setDirtyUrlField,
        "",
        router,
        fetch
      )(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(router.push).not.toHaveBeenCalled();
      expect(handleClose).not.toHaveBeenCalled();
      expect(setUrl).not.toHaveBeenCalled();
      expect(setDirtyForm).toHaveBeenCalledWith(true);
      expect(setDirtyUrlField).not.toHaveBeenCalled();
    });

    it("it redirects with the correct url for a container on submit", async () => {
      const resourceInfo = solidClientFns.mockSolidDatasetFrom(
        "https://example.org/Photos/"
      );
      jest
        .spyOn(solidClientFns, "getResourceInfo")
        .mockResolvedValue(resourceInfo);
      await submitHandler(
        handleClose,
        setUrl,
        setDirtyForm,
        setDirtyUrlField,
        "https://example.org/Photos",
        router,
        fetch
      )(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(router.push).toHaveBeenCalledWith(
        "/resource/[iri]",
        resourceHref("https://example.org/Photos/")
      );
      expect(handleClose).toHaveBeenCalled();
      expect(setUrl).toHaveBeenCalled();
      expect(setDirtyForm).toHaveBeenCalledWith(false);
      expect(setDirtyUrlField).toHaveBeenCalledWith(false);
    });

    it("redirects with the correct url for a resource on submit", async () => {
      const resourceInfo = solidClientFns.mockSolidDatasetFrom(
        "https://example.org/photo.jpg"
      );
      jest
        .spyOn(solidClientFns, "getResourceInfo")
        .mockResolvedValue(resourceInfo);
      await submitHandler(
        handleClose,
        setUrl,
        setDirtyForm,
        setDirtyUrlField,
        "https://example.org/photo.jpg",
        router,
        fetch
      )(event, "https://example.org/photo.jpg", router);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(router.push).toHaveBeenCalledWith(
        "/resource/[iri]",
        resourceHref("https://example.org/photo.jpg")
      );
      expect(handleClose).toHaveBeenCalled();
      expect(setUrl).toHaveBeenCalled();
      expect(setDirtyForm).toHaveBeenCalledWith(false);
      expect(setDirtyUrlField).toHaveBeenCalledWith(false);
    });
    it("redirects to a url with ending slash when it cannot fetch the source url", async () => {
      jest
        .spyOn(solidClientFns, "getResourceInfo")
        .mockRejectedValue(new Error("error"));
      await submitHandler(
        handleClose,
        setUrl,
        setDirtyForm,
        setDirtyUrlField,
        "https://example.org/photo.jpg",
        router,
        fetch
      )(event);
      expect(event.preventDefault).toHaveBeenCalledWith();
      expect(router.push).toHaveBeenCalledWith(
        "/resource/[iri]",
        resourceHref("https://example.org/photo.jpg/")
      );
      expect(handleClose).toHaveBeenCalled();
      expect(setUrl).toHaveBeenCalled();
      expect(setDirtyForm).toHaveBeenCalledWith(false);
      expect(setDirtyUrlField).toHaveBeenCalledWith(false);
    });
  });
});
