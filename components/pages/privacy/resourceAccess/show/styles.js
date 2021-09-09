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

const secondaryTeal80 = "#3D85AB";
const secondaryTeal10 = "#E6EFF4";

const styles = (theme) => {
  return createStyles(theme, ["back-to-nav", "input"], {
    avatar: {
      width: "64px",
      height: "64px",
    },
    avatarText: {
      fontFamily: theme.typography.h1.fontFamily,
      fontSize: "1.5rem",
      color: theme.palette.secondary.contrastText,
    },
    headerLink: {
      display: "block",
      fontFamily: theme.typography.body2.fontFamily,
      fontSize: "1rem",
      fontWeight: theme.typography.body2.fontWeight,
      color: theme.palette.secondary.contrastText,
    },
    container: {
      width: "100%",
      maxWidth: theme.breakpoints.width("md"),
      paddingTop: theme.spacing(1),
      margin: "0 auto",
    },
    "access-details--icon": {
      fontSize: "1.5rem",
      display: "flex",
      alignItems: "center",
      background: "linear-gradient(to right, #0D6796, #33B2D3)",
      "-webkit-background-clip": "text",
      color: "transparent",
    },
    table__container: {
      border: "solid 1px",
      borderColor: theme.palette.grey["200"],
      borderCollapse: "collapse",
      boxShadow: "0 4px 12px 1px rgba(208,208,208,0.22)",
      borderRadius: 8,
      paddingBottom: "0.5em",
    },
    table: {
      borderCollapse: "collapse",
      borderRadius: 8,
    },
    table__header: {
      borderBottom: "1px solid",
      borderBottomColor: theme.palette.grey["200"],
    },
    "table__head-cell": {
      padding: "1em",
    },
    "table__body-row": {
      borderBottom: "0 !important",
      borderTop: "1px solid",
      borderTopColor: theme.palette.grey["200"],
      position: "relative",
      "&:hover": {
        // cursor: "pointer",
        background: theme.palette.grey["50"],
      },
      "&:last-child": {
        borderBottom: 0,
      },
    },
    "table__body-row--active": {
      border: `2px solid ${secondaryTeal80} !important`,
      backgroundColor: secondaryTeal10,
    },
    "table__body-cell": {
      width: "2em",
    },

    "table__body-cell--interactive": {
      width: "auto",
      maxWidth: "650px",
      cursor: "pointer",
      textDecoration: "underline",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      direction: "rtl",
      textAlign: "left",
    },
  });
};

export default styles;
