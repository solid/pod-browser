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
import { POLICIES_TYPE_MAP } from "../../../../constants/policies";

export default function styles(theme) {
  return createStyles(theme, ["icons"], {
    title: {
      fontSize: theme.typography.h4.fontSize,
      fontWeight: theme.typography.fontWeightBold,
      flexGrow: 1,
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
      fontSize: "0.8125rem",
    },
    titleAndButtonContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    icon: {
      padding: theme.spacing(1),
      borderRadius: "50%",
      marginRight: theme.spacing(1.6),
      fontSize: theme.typography.h1.fontSize,
    },
    iconViewer: {
      color: POLICIES_TYPE_MAP.viewers.iconColor,
      backgroundColor: POLICIES_TYPE_MAP.viewers.iconBackgroundColor,
    },
    iconBlocked: {
      color: POLICIES_TYPE_MAP.blocked.iconColor,
      backgroundColor: POLICIES_TYPE_MAP.blocked.iconBackgroundColor,
    },
    iconEditor: {
      color: POLICIES_TYPE_MAP.editors.iconColor,
      backgroundColor: POLICIES_TYPE_MAP.editors.iconBackgroundColor,
    },
    iconSettings: {
      color: POLICIES_TYPE_MAP.custom.iconColor,
      backgroundColor: POLICIES_TYPE_MAP.custom.iconBackgroundColor,
    },
  });
}
