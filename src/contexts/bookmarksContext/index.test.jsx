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

import React, { useContext } from "react";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { render } from "@testing-library/react";
import BookmarkContext, { BookmarksContextProvider } from "./index";

const bookmarksIri = "https://mypod.myhost.com/bookmarks/index.ttl";
const bookmark = {
  dataset: mockSolidDatasetFrom(bookmarksIri),
  iri: bookmarksIri,
};

function ChildComponent() {
  const { bookmarks, setBookmarks } = useContext(BookmarkContext);
  setBookmarks(bookmark);
  return (
    <div id="bookmarks">{bookmarks ? "bookmarks exist" : "no bookmarks"}</div>
  );
}

describe("BookmarksContext", () => {
  test("it has context data", () => {
    const { asFragment } = render(
      <BookmarksContextProvider>
        <ChildComponent />
      </BookmarksContextProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
