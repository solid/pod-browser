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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { renderWithTheme } from "../../__testUtils/withTheme";
import Bookmark, { toggleBookmarkHandler } from "./index";
import BookmarkContext from "../../src/contexts/bookmarksContext";
import * as bookmarkHelpers from "../../src/solidClientHelpers/bookmarks";

const iri = "https://mypod.myhost.com/catvideos";
const bookmarks = mockSolidDatasetFrom(
  "https://mypod.myhost.com/bookmarks/index.ttl"
);
const setBookmarks = jest.fn();

describe("Bookmark", () => {
  test("it renders a bookmark icon", async () => {
    const { asFragment } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} />
      </BookmarkContext.Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test("it renders a bookmark icon and text if withText prop is true", async () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} withText />
      </BookmarkContext.Provider>
    );
    const text = getByTestId("bookmark-text");
    expect(text).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });

  test("it renders default text if add and remove strings are not passed", async () => {
    const { getByText } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} withText />
      </BookmarkContext.Provider>
    );
    const addText = getByText("Add Bookmark");
    expect(addText).toBeTruthy();
  });
  test("it renders passed strings for add and remove if available", async () => {
    const { getByText } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark
          iri={iri}
          withText
          addText="Bookmark Pod"
          removeText="Remove Pod Bookmark"
        />
      </BookmarkContext.Provider>
    );
    const addText = getByText("Bookmark Pod");
    expect(addText).toBeTruthy();
  });

  test("it renders a button if menuItem is false", async () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} />
      </BookmarkContext.Provider>
    );
    const button = getByTestId("bookmark-button");
    expect(button).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });

  test("it renders a list item button if menuItem is true", async () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} menuItem />
      </BookmarkContext.Provider>
    );
    const button = getByTestId("bookmark-list-item-button");
    expect(button).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("toggleHandler", () => {
  test("it updates icon when the toggle handler is triggered", async () => {
    const { container } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} />
      </BookmarkContext.Provider>
    );

    expect(container.querySelector("#bookmark-icon-unselected")).toBeDefined();
  });

  test("it updates the icon when adding bookmarks", async () => {
    const setBookmarked = jest.fn();
    const setDisabled = jest.fn();

    const toggleHandler = toggleBookmarkHandler({
      bookmarks,
      bookmarked: false,
      iri,
      setSeverity: jest.fn(),
      setMessage: jest.fn(),
      setAlertOpen: jest.fn(),
      setBookmarked,
      setBookmarks,
      setDisabled,
      fetch: jest.fn(),
    });

    jest
      .spyOn(bookmarkHelpers, "addBookmark")
      .mockResolvedValueOnce({ response: bookmarks });

    await toggleHandler();
    expect(setBookmarked).toHaveBeenCalledWith(true);
    expect(setBookmarks).toHaveBeenCalled();
  });
  test("it updates the icon when removing bookmarks", async () => {
    const setBookmarked = jest.fn();
    const setDisabled = jest.fn();

    const toggleHandler = toggleBookmarkHandler({
      bookmarks,
      bookmarked: true,
      iri,
      setSeverity: jest.fn(),
      setMessage: jest.fn(),
      setAlertOpen: jest.fn(),
      setBookmarked,
      setBookmarks,
      setDisabled,
      fetch: jest.fn(),
    });

    jest
      .spyOn(bookmarkHelpers, "removeBookmark")
      .mockResolvedValueOnce({ response: bookmarks });

    await toggleHandler();
    expect(setBookmarked).toHaveBeenCalledWith(false);
    expect(setBookmarks).toHaveBeenCalled();
  });
  test("it renders an error when it is unsuccessful in adding bookmark", async () => {
    const { container } = renderWithTheme(
      <BookmarkContext.Provider value={(bookmarks, setBookmarks)}>
        <Bookmark iri={iri} />
      </BookmarkContext.Provider>
    );

    expect(container.querySelector("#bookmark-icon-unselected")).toBeDefined();

    const setBookmarked = jest.fn();
    const setAlertOpen = jest.fn();
    const setSeverity = jest.fn();
    const setMessage = jest.fn();
    const setDisabled = jest.fn();

    const toggleHandler = toggleBookmarkHandler({
      bookmarks,
      bookmarked: false,
      iri,
      setSeverity,
      setMessage,
      setAlertOpen,
      setBookmarked,
      setBookmarks,
      setDisabled,
      fetch: jest.fn(),
    });

    jest
      .spyOn(bookmarkHelpers, "addBookmark")
      .mockResolvedValueOnce({ response: "", error: "There was an error" });

    await toggleHandler();
    expect(setAlertOpen).toHaveBeenCalledWith(true);
    expect(setSeverity).toHaveBeenCalledWith("error");
    expect(setMessage).toHaveBeenCalledWith("There was an error");
    expect(setBookmarked).not.toHaveBeenCalled();
    expect(setBookmarks).not.toHaveBeenCalled();
  });
});
