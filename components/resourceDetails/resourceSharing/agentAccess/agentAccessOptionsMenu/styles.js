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
  return createStyles(theme, ["icons"], {
    infoButton: {
      padding: 0,
      minWidth: "max-content",
    },
    infoIcon: {
      margin: theme.spacing(0.4),
      color: theme.palette.info.main,
    },
    button: {
      flexShrink: 0,
      width: "1.875rem",
      height: "1.875rem",
      color: theme.palette.text.secondary,
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "50%",
      margin: 0,
      padding: 0,
      cursor: "pointer",
      "&&:hover": {
        color: theme.palette.secondary.contrastText,
        backgroundColor: theme.palette.grey[400],
      },
    },
    listItemText: {
      fontWeight: 500,
    },
    webIdContainer: {
      backgroundColor: theme.palette.grey[100],
      fontSize: "0.75rem",
      fontWeight: 500,
      letterSpacing: 0,
      lineHeight: "13px",
      width: "100%",
      height: "100%",
      padding: theme.spacing(0.8, 1.2),
      marginTop: 0,
    },
    webId: {
      marginTop: "0.25rem",
      marginBottom: "0.25rem",
    },
    webIdContainerGutters: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    webIdContainerRoot: {
      paddingTop: 0,
    },
    listRoot: {
      paddingTop: 0,
    },
  });
}
