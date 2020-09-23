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

import React, { useContext, useEffect, useState } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import PropTypes from "prop-types";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { getUrlAll } from "@inrupt/solid-client";
import styles from "./styles";
import { addBookmark } from "../../src/solidClientHelpers/bookmarks";
import BookmarksContext from "../../src/contexts/bookmarksContext";
import AlertContext from "../../src/contexts/alertContext";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const toggleBookmarkHandler = ({
  bookmarks,
  bookmarked,
  iri,
  setSeverity,
  setMessage,
  setAlertOpen,
  setBookmarked,
  setBookmarks,
  fetch,
}) => {
  return async () => {
    if (bookmarked) {
      return; // returning for now until we have the remove logic
    }
    const { response, error } = await addBookmark(iri, bookmarks, fetch);
    if (error) {
      setSeverity("error");
      setMessage(error);
      setAlertOpen(true);
    } else {
      setBookmarked(true); // optimistically set bookmarked to true so it doesn't take that long to display the item as bookmarked
      setBookmarks(response);
    }
  };
};

const isBookmarked = (iri, dataset) => {
  const listOfRecallsUrls = getUrlAll(
    dataset,
    "http://www.w3.org/2002/01/bookmark#recalls"
  );
  if (!listOfRecallsUrls) {
    return false;
  }
  return listOfRecallsUrls.includes(iri);
};

export default function Bookmark({ iri }) {
  const { session } = useSession();
  const { setAlertOpen, setMessage, setSeverity } = useContext(AlertContext);
  const { fetch } = session;
  const bem = useBem(useStyles());
  const { bookmarks, setBookmarks } = useContext(BookmarksContext);
  const [bookmarked, setBookmarked] = useState();

  useEffect(() => {
    if (!bookmarks) {
      return;
    }
    const { dataset } = bookmarks;
    const bookmarkState = isBookmarked(iri, dataset);
    setBookmarked(bookmarkState);
  }, [bookmarks, iri]);

  const toggleBookmark = toggleBookmarkHandler({
    bookmarks,
    bookmarked,
    iri,
    setSeverity,
    setMessage,
    setAlertOpen,
    setBookmarked,
    setBookmarks,
    fetch,
  });

  const bookmarkIconClass = bookmarked
    ? "bookmark-icon-selected"
    : "bookmark-icon-unselected";

  return (
    <button
      type="button"
      className={clsx(bem("button", "text"))}
      onClick={toggleBookmark}
    >
      <i
        className={clsx(bem("icon-star"), bem(bookmarkIconClass))}
        aria-label="bookmark"
        alt="bookmark button"
      />
    </button>
  );
}

Bookmark.propTypes = {
  iri: PropTypes.string.isRequired,
};
