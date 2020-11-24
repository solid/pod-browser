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

const styles = (theme, indicatorWidth, indicatorLabelWidth) => {
  const indicatorLabelPaddingLeft = indicatorLabelWidth < 42.8 ? 45 : 40;
  return createStyles(theme, ["button"], {
    indicator: {
      display: "flex",
      backgroundColor: theme.palette.background.default,
      minHeight: "60px",
      maxHeight: "max-content",
      width: "100vw",
      [theme.breakpoints.up("sm")]: {
        maxWidth: "50vw",
        minWidth: "128px",
        width: "max-content",
        height: "60px",
      },
    },
    indicatorLabel: {
      fontSize: theme.typography.subtitle2.fontSize,
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.primary.main,
      textTransform: "uppercase",
    },
    indicatorChevron: {
      paddingLeft: "0.5em",
      color: theme.palette.primary.main,
    },
    indicatorPrompt: {
      padding: theme.spacing(0.6, 2.4),
      cursor: "pointer",
      width: "100%",
      height: "100%",
      alignItems: "flex-start",
      justifyContent: "space-around",
      backgroundColor: "transparent",
      flexDirection: "column",
      display: "inline-flex",
      color: theme.palette.text.secondary,
      border: "none",
      borderTop: `1px solid ${theme.palette.grey.A100}`,
      borderBottom: `1px solid ${theme.palette.grey.A100}`,
      textTransform: "none",
      fontSize: theme.typography.subtitle2.fontSize,
      fontWeight: theme.typography.fontWeightRegular,
      [theme.breakpoints.up("sm")]: {
        border: "none",
        borderLeft: `1px solid ${theme.palette.grey.A100}`,
        alignItems: "flex-end",
        padding: theme.spacing(0.6, 4, 0.6, indicatorLabelPaddingLeft / 10),
      },
    },
    indicatorName: {
      boxSizing: "border-box",
      overflowWrap: "break-word",
      maxWidth: "100%",
      textAlign: "left",
      fontSize: theme.typography.htmlFontSize,
      [theme.breakpoints.up("sm")]: {
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
      },
    },
    popoverMenu: {
      maxWidth: `max(${indicatorWidth}px, 170px)`,
      minWidth: "128px",
      width: `max(${indicatorWidth}px, 170px)`,
      borderRadius: theme.spacing(0, 0, 1, 1),
      [theme.breakpoints.down("xs")]: {
        left: "0 !important", // overiding Material UI positioning
        width: "100vw",
        maxWidth: "100vw",
        minWidth: "100vw",
      },
    },
    list: {
      padding: 0,
    },
    menuItem: {
      padding: theme.spacing(1),
    },
    itemIcon: {
      padding: theme.spacing(0, 0.8),
      minWidth: "max-content !important",
    },
    itemText: {
      padding: 0,
    },
  });
};

export default styles;
