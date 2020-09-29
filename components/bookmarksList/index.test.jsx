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
import BookmarksList from "./index";
import mockBookmarks from "../../__testUtils/mockBookmarks";
import mockBookmarksContextProvider from "../../__testUtils/mockBookmarksContextProvider";

describe("BookmarksList", () => {
  test("it renders a spinner if bookmarks are loading", async () => {
    const bookmarks = null;
    const setBookmarks = jest.fn();
    const BookmarksContextProvider = mockBookmarksContextProvider({
      bookmarks,
      setBookmarks,
    });
    const tree = mountToJson(
      <BookmarksContextProvider>
        <BookmarksList />
      </BookmarksContextProvider>
    );
    expect(tree).toMatchSnapshot();
  });
  test("it renders a list of bookmarks", async () => {
    const bookmarks = mockBookmarks();
    const setBookmarks = jest.fn();
    const BookmarksContextProvider = mockBookmarksContextProvider({
      bookmarks,
      setBookmarks,
    });
    const tree = mountToJson(
      <BookmarksContextProvider>
        <BookmarksList />
      </BookmarksContextProvider>
    );
    expect(tree).toMatchSnapshot();
  });
});
