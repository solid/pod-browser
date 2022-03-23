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
import PropTypes from "prop-types";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { IconButton, InputBase, createStyles } from "@material-ui/core";
import styles from "./styles";

export const TESTCAFE_ID_SEARCH_INPUT = "search-input";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function AgentsSearchBar({ handleFilterChange }) {
  const bem = useBem(useStyles());

  const classes = useStyles();
  return (
    <div className={classes.searchBoxContainer}>
      <IconButton type="submit" aria-label="search">
        <i
          className={clsx(bem("icon-search"), bem("icon"), classes.iconSearch)}
          aria-label="search"
        />
      </IconButton>
      <InputBase
        classes={{ root: classes.searchInput }}
        placeholder="Search by name or WebId"
        inputProps={{
          "data-testid": TESTCAFE_ID_SEARCH_INPUT,
          "aria-label": "Search by name or WebId",
          onChange: handleFilterChange,
        }}
      />
    </div>
  );
}

AgentsSearchBar.propTypes = {
  handleFilterChange: PropTypes.func,
};

AgentsSearchBar.defaultProps = {
  handleFilterChange: () => {},
};
