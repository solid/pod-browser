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

const SETTINGS_ICON_COLOR = "#404040";
const SETTINGS_BACKGROUND_COLOR = "#F5F5F5";

export default function styles(theme) {
  return createStyles(theme, ["icons"], {
    dropdown: {
      display: "flex",
      border: `1px solid ${theme.palette.grey.A100}`,
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(1.2),
      padding: theme.spacing(1.2),
      fontWeight: theme.typography.body.fontWeight,
      fontFamily: theme.typography.body.fontFamily,
      backgroundColor: theme.palette.background.paper,
    },
    menuItem: {
      fontWeight: theme.typography.body.fontWeight,
      fontFamily: theme.typography.body.fontFamily,
    },
    manuItemText: {
      padding: 0,
    },
    title: {
      fontSize: theme.typography.h4.fontSize,
      fontWeight: theme.typography.fontWeightBold,
    },
    headerContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing(1.6),
    },
    textContainer: {
      width: "100%",
      flexDirection: "column",
    },
    description: {
      "&& p": {
        padding: 0,
        margin: 0,
        whiteSpace: "break-spaces",
      },
      fontSize: "0.8125rem",
    },
    titleAndButtonContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    "icon-custom-policies": {
      width: "1.5rem",
      height: "1.5rem",
      fontStretch: "unset",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: SETTINGS_ICON_COLOR,
      backgroundColor: SETTINGS_BACKGROUND_COLOR,
      padding: theme.spacing(1),
      borderRadius: "50%",
      marginRight: theme.spacing(1.6),
      fontSize: theme.typography.h1.fontSize,
    },
    iconCaret: {
      fontSize: "2.125rem",
      top: "25%",
      color: theme.palette.text.primary,
      marginRight: "1rem",
    },
  });
}
