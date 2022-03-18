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
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import BookmarkButton from "./index";

describe("BookmarkButton", () => {
  it("returns a list item when menuItem is true", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <BookmarkButton menuItem />
    );
    const listItem = getByTestId("bookmark-list-item-button");
    expect(listItem).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });
  it("returns a button when menuItem is false", () => {
    const { asFragment, getByTestId } = renderWithTheme(<BookmarkButton />);
    const button = getByTestId("bookmark-button");
    expect(button).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });
  it("calls the clickHandler on click", () => {
    const clickHandler = jest.fn();
    const { getByTestId } = renderWithTheme(
      <BookmarkButton clickHandler={clickHandler} />
    );
    const button = getByTestId("bookmark-button");
    userEvent.click(button);
    expect(clickHandler).toHaveBeenCalled();
  });
  it("default value for clickHandler", () => {
    const { getByTestId } = renderWithTheme(<BookmarkButton />);
    const { clickHandler } = BookmarkButton.defaultProps;
    const button = getByTestId("bookmark-button");
    userEvent.click(button);
    expect(clickHandler).toBeInstanceOf(Function);
  });
});
