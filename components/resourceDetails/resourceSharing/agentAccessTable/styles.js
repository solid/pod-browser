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

export default function styles(theme) {
  return createStyles(theme, ["icons", "table"], {
    accordion: {
      padding: theme.spacing(1.8, 1.6),
      color: theme.palette.secondary.contrastText,
    },
    rounded: {
      borderRadius: "4px",
      boxShadow: `0 1px 4px 0 ${theme.palette.grey[500]}`,
    },
    title: {
      fontSize: theme.typography.h4.fontSize,
      fontWeight: 800,
    },
    headerContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing(1.6),
      "&& p": {
        padding: 0,
        margin: 0,
      },
    },
    textContainer: {
      width: "100%",
      flexDirection: "column",
    },
    description: {
      fontSize: "12px",
    },
    permissionsContainer: {
      position: "relative",
      boxSizing: "border-box",
      border: "1px solid #D8D8D8",
      borderRadius: "4px",
      fontSize: theme.typography.body2.fontSize,
      padding: 0,
      overflow: "auto",
      "&& p": {
        padding: 0,
        margin: 0,
      },
    },
    showAllButtonContainer: {
      width: "100%",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0) 0%, #FFFFFF 100%)",
      position: "absolute",
      textAlign: "center",
      bottom: 0,
      padding: theme.spacing(0.6, 0.7),
    },
    showAllButton: {
      cursor: "pointer",
      width: "100%",
      backgroundColor: "transparent",
      border: "none",
    },
    expanded: {
      position: "relative",
    },
    showAllText: {
      textAlign: "center",
      color: theme.palette.primary.main,
      fontSize: "13px",
    },
    showAllButtonIcon: {
      color: theme.palette.primary.main,
      fontSize: "13px",
    },
    titleAndButtonContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    icon: {
      padding: theme.spacing(1),
      borderRadius: "50%",
      marginRight: theme.spacing(1.6),
      fontSize: "22px",
    },
    iconViewer: {
      color: "#2196F3",
      backgroundColor: "#E8F4FD",
    },
    iconBlocked: {
      color: "#F44336",
      backgroundColor: "#FDECEA",
    },
    iconEditor: {
      color: "#4CAF50",
      backgroundColor: "#EDF7ED",
    },
    emptyStateTextContainer: {
      display: "flex",
      flexDirection: "column",
      padding: theme.spacing(0.7, 1.4),
      textAlign: "center",
    },
    "agents-table": {
      padding: 0,
    },
    "agent-cell": {
      whiteSpace: "break-spaces",
      padding: 0,
    },
    tabsContainer: {
      paddingLeft: theme.spacing(1.2),
      paddingRight: theme.spacing(1.2),
      borderBottom: "1px solid #D8D8D8",
    },
    tab: {
      textTransform: "none",
      minWidth: "max-content",
      fontFamily: theme.typography.body1.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      color: theme.palette.primary.text,
    },
    selected: {
      color: theme.palette.primary.main,
    },
    indicator: {
      height: "3px",
      width: "100%",
      backgroundColor: theme.palette.primary.main,
    },
    searchBoxContainer: {
      display: "flex",
      margin: theme.spacing(0.7, 1.2),
      border: "1px solid #D8D8D8",
      borderRadius: "10px",
      height: "40px",
    },
    searchInput: {
      fontSize: "14px",
      width: "100%",
      font: "inherit",
      fontWeight: 500,
      color: theme.palette.primary.text,
    },
    iconSearch: {
      fontSize: theme.typography.body1.fontSize,
    },
  });
}
