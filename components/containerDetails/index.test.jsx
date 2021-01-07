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
import * as RouterFns from "next/router";
import T from "prop-types";
import { render } from "@testing-library/react";
import ContainerDetails from "./index";
import ResourceDrawer, {
  handleCloseDrawer,
  handleRedirectToParentContainer,
} from "../resourceDrawer";

jest.mock("../resourceDrawer");

describe("ContainerDetails", () => {
  let mutate;
  let onUpdateFn;
  let onDeleteCurrentContainerFn;
  let handleCloseDrawerFn;
  let handleRedirectToParentContainerFn;
  let renderResult;

  beforeEach(() => {
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "asPath",
      replace: jest.fn(),
      query: {},
    });

    function MockResourceDrawer({ onUpdate, onDeleteCurrentContainer }) {
      onUpdateFn = onUpdate;
      onDeleteCurrentContainerFn = onDeleteCurrentContainer;
      return null;
    }
    MockResourceDrawer.propTypes = {
      onUpdate: T.func.isRequired,
      onDeleteCurrentContainer: T.func.isRequired,
    };

    ResourceDrawer.mockImplementationOnce(MockResourceDrawer);

    handleCloseDrawerFn = jest.fn().mockResolvedValue(jest.fn());
    handleCloseDrawer.mockImplementationOnce(() => handleCloseDrawerFn);

    handleRedirectToParentContainerFn = jest.fn().mockResolvedValue(jest.fn());
    handleRedirectToParentContainer.mockImplementationOnce(
      () => handleRedirectToParentContainerFn
    );

    mutate = jest.fn();

    renderResult = render(<ContainerDetails mutate={mutate} />);
  });

  test("Renders view", () => {
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  describe("when DetailsContextMenu.onUpdate is called", () => {
    beforeEach(() => onUpdateFn());

    test("it calls mutate", () => expect(mutate).toHaveBeenCalled());
    test("it calls handleCloseDrawerFn", () =>
      expect(handleCloseDrawerFn).toHaveBeenCalled());
  });

  describe("when onDeleteCurrentContainer is called", () => {
    beforeEach(() => onDeleteCurrentContainerFn());

    test("it calls mutate", () => expect(mutate).toHaveBeenCalled());
    test("it calls handleRedirectToParentContainerFn", () =>
      expect(handleRedirectToParentContainerFn).toHaveBeenCalled());
  });
});
