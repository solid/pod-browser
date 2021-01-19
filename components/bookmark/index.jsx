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
import {
  addBookmark,
  RECALLS_PROPERTY_IRI,
  removeBookmark,
} from "../../src/solidClientHelpers/bookmarks";
import BookmarksContext from "../../src/contexts/bookmarksContext";
import BookmarkButton from "./bookmarkButton";
import BookmarkText from "./bookmarkText";
import AlertContext from "../../src/contexts/alertContext";

const BOOKMARK_ADDED_NOTIFICATION_MESSAGE = "Resource added to bookmarks";
const BOOKMARK_REMOVED_NOTIFICATION_MESSAGE = "Bookmark removed";

export const toggleBookmarkHandler = ({
  bookmarks,
  iri,
  setSeverity,
  setMessage,
  setAlertOpen,
  bookmarked,
  setBookmarks,
  setBookmarked,
  setDisabled,
  profileName,
  fetch,
}) => {
  return async () => {
    setDisabled(true);
    let results;
    let message;
    if (bookmarked) {
      results = await removeBookmark(iri, bookmarks, fetch);
      message = BOOKMARK_REMOVED_NOTIFICATION_MESSAGE;
    } else {
      results = await addBookmark(iri, bookmarks, profileName, fetch);
      message = BOOKMARK_ADDED_NOTIFICATION_MESSAGE;
    }
    const { response, error } = results;
    if (error) {
      setSeverity("error");
      setMessage(error);
      setAlertOpen(true);
    } else {
      setBookmarked(!bookmarked);
      setSeverity("success");
      setMessage(message);
      setAlertOpen(true);
      setBookmarks(response);
    }
  };
};

const isBookmarked = (iri, dataset) => {
  const listOfRecallsUrls = getUrlAll(dataset, RECALLS_PROPERTY_IRI);
  return listOfRecallsUrls.includes(iri);
};

export default function Bookmark({
  iri,
  menuItem,
  withText,
  addText,
  removeText,
  profileName,
}) {
  const { session } = useSession();
  const { setAlertOpen, setMessage, setSeverity } = useContext(AlertContext);
  const { fetch } = session;
  const useStyles = makeStyles((theme) =>
    createStyles(styles(theme, menuItem))
  );
  const bem = useBem(useStyles());
  const { bookmarks, setBookmarks } = useContext(BookmarksContext);
  const [bookmarked, setBookmarked] = useState();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (!bookmarks) {
      return;
    }
    const { dataset } = bookmarks;
    if (!dataset) {
      return;
    }
    const bookmarkState = isBookmarked(iri, dataset);
    setBookmarked(bookmarkState);
    setDisabled(false);
  }, [bookmarks, iri, setBookmarked, setDisabled]);

  const toggleBookmark = toggleBookmarkHandler({
    bookmarks,
    bookmarked,
    iri,
    setSeverity,
    setMessage,
    setAlertOpen,
    setBookmarked,
    setBookmarks,
    setDisabled,
    profileName,
    fetch,
  });

  const bookmarkIconClass = bookmarked
    ? "bookmark-icon-selected"
    : "bookmark-icon-unselected";

  const bookmarkButtonClass = menuItem
    ? clsx(bem("bookmark-menu-item"))
    : clsx(
        bem("button", "text"),
        bem("bookmark-button"),
        menuItem && bem("bookmark-menu-item")
      );

  return (
    <BookmarkButton
      className={bookmarkButtonClass}
      menuItem={menuItem}
      clickHandler={toggleBookmark}
      disabled={disabled}
    >
      <i
        className={clsx(bem("icon-star"), bem("icon"), bem(bookmarkIconClass))}
        aria-label="bookmark"
        alt="bookmark button"
      />
      {(withText || menuItem) && (
        <BookmarkText
          bookmarked={bookmarked}
          addText={addText}
          removeText={removeText}
          className={bem("bookmark-text")}
        />
      )}
    </BookmarkButton>
  );
}

Bookmark.propTypes = {
  iri: PropTypes.string.isRequired,
  menuItem: PropTypes.bool,
  withText: PropTypes.bool,
  addText: PropTypes.string,
  removeText: PropTypes.string,
  profileName: PropTypes.string,
};

Bookmark.defaultProps = {
  menuItem: false,
  withText: false,
  addText: null,
  removeText: null,
  profileName: null,
};
