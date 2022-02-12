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

const DETAILS_ICON_COLOR = "#4CAF50";
const EDIT_ICON_COLOR = "#7B4DFF";

export default function styles(theme) {
  return {
    "access-details--wrapper": {
      display: "flex",
      flexDirection: "column",
      wordBreak: "break-word",
      margin: "1rem",
    },
    "access-details--title": {
      padding: 0,
      margin: 0,
      fontFamily: theme.typography.h2.fontFamily,
      position: "relative",
    },
    "access-details--resource-info": {
      flexGrow: 1,
      "& > *": {
        paddingLeft: "2rem",
      },
      "& p": {
        fontSize: "0.8125rem",
        margin: 0,
        wordWrap: "break-word",
      },
    },
    "access-details--icon": {
      fontSize: "1.5rem",
      display: "flex",
      alignItems: "center",
      background: "linear-gradient(to right, #0D6796, #33B2D3)",
      "-webkit-background-clip": "text",
      color: "transparent",
      marginRight: "1rem",
    },
    avatar: {
      marginRight: "1rem",
    },
    "access-details--avatar-container": {
      display: "flex",
      justifyContent: "center",
    },
    "access-details--agent-name": {
      color: "#000",
      textDecorationColor: "#000",
      fontSize: "20px",
      fontWeight: "700",
      textDecoration: "underline",
    },
    "access-details--section": {
      minWidth: "100%",
      display: "flex",
      flexDirection: "column",
    },
    "access-details--section-header": {
      fontFamily: theme.typography.h3.fontFamily,
      alignSelf: "end",
      marginBottom: 0,
    },
    "access-details--edit-icon": {
      color: EDIT_ICON_COLOR,
      paddingRight: ".5rem",
    },
    "access-details--section-icon": {
      color: DETAILS_ICON_COLOR,
      fontSize: "1rem",
      alignItems: "flex-start",
    },
    listItemIcon: {
      minWidth: "fit-content",
      paddingRight: "0.5rem",
      display: "flex",
      alignSelf: "flex-start",
      paddingTop: "0.2rem",
    },
    listItemTitleText: {
      fontFamily: theme.typography.body.fontFamily,
      fontSize: theme.typography.body1.fontSize,
    },
    listItemSecondaryText: {
      fontFamily: theme.typography.body.fontFamily,
      fontSize: "0.8125rem",
    },
    "access-details--separator": {
      backgroundColor: theme.palette.grey.A100,
      border: "none",
      height: "1px",
      width: "100%",
    },
    listItemText: {
      marginTop: 0,
    },
    purpose: {
      display: "flex",
      justifyContent: "flex-start",
    },
    "access-details--action-container": {
      justifyContent: "space-between",
      width: "100%",
      marginTop: "1rem",
    },
    "access-details--revoke-text": {
      textTransform: "none",
      color: theme.palette.error.main,
      padding: "1rem 0",
      border: "none",
      background: "transparent",
      textDecoration: "underline",
      fontSize: "1rem",
      cursor: "pointer",
      textAlign: "left",
      justifySelf: "flex-end",
    },
  };
}
