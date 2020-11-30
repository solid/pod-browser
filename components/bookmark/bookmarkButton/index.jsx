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
import { ListItem } from "@material-ui/core";
import PropTypes from "prop-types";

const TESTCAFE_ID_BOOKMARK_LIST_ITEM_BUTTON = "bookmark-list-item-button";
const TESTCAFE_ID_BOOKMARK_BUTTON = "bookmark-button";

export default function BookmarkButton({
  children,
  className,
  menuItem,
  clickHandler,
  disabled,
}) {
  return menuItem ? (
    <ListItem
      button
      disabled={disabled}
      data-testid={TESTCAFE_ID_BOOKMARK_LIST_ITEM_BUTTON}
      key="bookmark-pod"
      onClick={clickHandler}
      className={className}
    >
      {children}
    </ListItem>
  ) : (
    <button
      type="button"
      data-testid={TESTCAFE_ID_BOOKMARK_BUTTON}
      className={className}
      onClick={clickHandler}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
BookmarkButton.defaultProps = {
  children: null,
  className: null,
  menuItem: false,
  clickHandler: () => {},
  disabled: false,
};

BookmarkButton.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  menuItem: PropTypes.bool,
  clickHandler: PropTypes.func,
  disabled: PropTypes.bool,
};
