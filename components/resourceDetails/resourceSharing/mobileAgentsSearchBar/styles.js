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

import { createStyles } from "@solid/lit-prism-patterns";

const SEARCH_BOX_HEIGHT = 50;

export default function styles(theme) {
  return createStyles(theme, ["icons", "table"], {
    searchBoxContainer: {
      display: "none",
      margin: theme.spacing(0.7, 1.2),
      border: `1px solid ${theme.palette.grey.A100}`,
      borderRadius: "10px",
      height: "2.5rem",
      [theme.breakpoints.down("xs")]: {
        border: "none",
        display: "flex",
        "&.expanded": {
          boxShadow: `0px 0px 0px 1px ${theme.palette.primary.main} inset`,
          display: "flex",
          height: SEARCH_BOX_HEIGHT,
          borderRadius: "5px",
          border: `1px solid ${theme.palette.grey.A100}`,
          position: "absolute",
          backgroundColor: theme.palette.background.paper,
          right: theme.spacing(0.25),
          left: theme.spacing(0.25),
        },
        "&.hidden": {
          width: "min-content",
        },
      },
    },
    searchInput: {
      [theme.breakpoints.down("xs")]: {
        visibility: "hidden",
        "&.expanded": {
          visibility: "visible",
        },
      },
      fontSize: "0.8125rem",
      width: "100%",
      font: "inherit",
      fontWeight: 500,
      color: theme.palette.primary.text,
    },
    iconSearch: {
      fontSize: theme.typography.body1.fontSize,
    },
    iconCloseExpanded: {
      display: "none",
      [theme.breakpoints.down("xs")]: {
        display: "flex",
        fontSize: theme.typography.body1.fontSize,
        position: "relative",
        paddingRight: "1rem",
      },
    },
    iconCloseHidden: {
      display: "none",
    },
  });
}
