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

/* eslint-disable react/jsx-one-expression-per-line */

import React from "react";
import T from "prop-types";
import { createStyles, ListItem, ListItemText } from "@mui/core";
import { makeStyles } from "@mui/styles";
import styles from "./styles";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";
const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function AccessDetailsButton({ setOpenModal }) {
  const classes = useStyles();

  return (
    <ListItem
      data-testid={TESTCAFE_ID_VIEW_DETAILS_BUTTON}
      button
      onClick={() => setOpenModal(true)}
    >
      <ListItemText
        disableTypography
        classes={{ primary: classes.listItemText }}
      >
        View Details
      </ListItemText>
    </ListItem>
  );
}

AccessDetailsButton.propTypes = {
  setOpenModal: T.func.isRequired,
};
