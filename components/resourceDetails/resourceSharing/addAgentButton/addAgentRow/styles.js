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
  return createStyles(theme, ["icons", "button"], {
    addAgentForm: {
      display: "flex",
      flexDirection: "row",
      padding: 0,
    },
    nameAndAvatarContainer: {
      display: "flex",
      alignItems: "Center",
    },
    avatar: {
      width: "1.875rem",
      height: "1.875rem",
      margin: theme.spacing(0, 0.8),
    },
    detailText: {
      fontFamily: theme.typography.body.fontFamily,
      fontWeight: theme.typography.body.fontWeight,
      minWidth: "20rem",
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: theme.typography.body1.fontWeight,
      color: theme.palette.common.white,
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(0.8, 0.7),
      borderRadius: "10px",
      maxHeight: "2.5rem",
      margin: theme.spacing(0, 0.5),
    },
    searchBoxContainer: {
      display: "flex",
      border: "1px solid #D8D8D8",
      borderRadius: "10px",
      height: "2.5rem",
      minWidth: "20rem",
    },
    searchInput: {
      height: "100%",
      fontSize: "0.8125rem",
      width: "100%",
      fontFamily: theme.typography.body.fontFamily,
      fontWeight: theme.typography.body.fontWeight,
      color: theme.palette.primary.text,
      padding: theme.spacing(0.5),
    },
    agentPickerFormContainer: {
      display: "flex",
      alignItems: "center",
    },
  });
}
