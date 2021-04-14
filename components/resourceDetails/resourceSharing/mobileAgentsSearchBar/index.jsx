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

/* eslint-disable react/forbid-prop-types */

import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { IconButton, InputBase, createStyles } from "@material-ui/core";
import styles from "./styles";
import FeatureContext from "../../../../src/contexts/featureFlagsContext";
import { GROUPS_PAGE_ENABLED } from "../../../../src/featureFlags";

export const TESTCAFE_ID_MOBILE_SEARCH_INPUT = "mobile-search-input";
export const TESTCAFE_ID_SEARCH_BUTTON = "search-button";
export const TESTCAFE_ID_CLOSE_BUTTON = "close-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function MobileAgentsSearchBar({ handleFilterChange }) {
  const { enabled } = useContext(FeatureContext);
  const bem = useBem(useStyles());
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles();
  const textInput = React.createRef();
  const useGroupUI = enabled(GROUPS_PAGE_ENABLED);

  useEffect(() => {
    if (expanded) {
      textInput.current.focus();
    }
  }, [expanded, textInput]);

  return (
    <div
      className={bem("searchBoxContainer", {
        expanded,
        hidden: !expanded,
        "can-be-hidden": useGroupUI,
      })}
    >
      <IconButton
        data-testid={TESTCAFE_ID_SEARCH_BUTTON}
        type="button"
        aria-label="search"
        onClick={() => setExpanded(!expanded)}
      >
        <i
          className={clsx(bem("icon-search"), bem("icon"), classes.iconSearch)}
          aria-label="search"
        />
      </IconButton>
      <InputBase
        autoFocus
        className={clsx(bem("searchInput", expanded ? "expanded" : "hidden"))}
        placeholder="Search by name or WebId"
        inputProps={{
          className: clsx(bem("searchInput", expanded ? "expanded" : "hidden")),
          "data-testid": TESTCAFE_ID_MOBILE_SEARCH_INPUT,
          "aria-label": "Search by name or WebId",
          onChange: handleFilterChange,
          ref: textInput,
        }}
      />
      <IconButton
        type="button"
        data-testid={TESTCAFE_ID_CLOSE_BUTTON}
        aria-label="close"
        classes={{
          root: expanded ? classes.iconCloseExpanded : classes.iconCloseHidden,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <i
          className={clsx(
            bem("icon-cancel"),
            bem("icon"),
            classes.iconClose,
            expanded ? "expanded" : "hidden"
          )}
          aria-label="close"
        />
      </IconButton>
    </div>
  );
}

MobileAgentsSearchBar.propTypes = {
  handleFilterChange: PropTypes.func,
};

MobileAgentsSearchBar.defaultProps = {
  handleFilterChange: () => {},
};
