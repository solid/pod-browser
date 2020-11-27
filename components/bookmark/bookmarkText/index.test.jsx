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
import { screen } from "@testing-library/react";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import BookmarkText from "./index";

describe("BookmarkText", () => {
  test("it renders default add string when no addText is passed", async () => {
    renderWithTheme(<BookmarkText />);
    const text = screen.getByTestId("bookmark-text");
    expect(text.textContent).toEqual("Add Bookmark");
  });
  test("it renders default remove string when no removeText is passed", async () => {
    renderWithTheme(<BookmarkText bookmarked />);
    const text = screen.getByTestId("bookmark-text");
    expect(text.textContent).toEqual("Remove Bookmark");
  });
  test("it renders passed addText when available", async () => {
    renderWithTheme(<BookmarkText addText="Bookmark Pod" />);
    const text = screen.getByTestId("bookmark-text");
    expect(text.textContent).toEqual("Bookmark Pod");
  });
  test("it renders passed removeText when available", async () => {
    renderWithTheme(
      <BookmarkText bookmarked removeText="Remove Pod Bookmark" />
    );
    const text = screen.getByTestId("bookmark-text");
    expect(text.textContent).toEqual("Remove Pod Bookmark");
  });
});
