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
    mobile: {
      [theme.breakpoints.up("sm")]: {
        display: "none",
      },
      display: "flex",
    },
    desktop: {
      [theme.breakpoints.up("sm")]: {
        display: "flex",
      },
      display: "none",
    },
    button: {
      marginTop: "0.5rem",
      width: "max-content",
      alignSelf: "flex-end",
      height: "max-content",
      fontWeight: theme.typography.fontWeightBold,
      fontSize: "0.8125rem",
      textDecoration: "none",
      borderRadius: "7px",
      backgroundColor: theme.palette.grey[50],
      whiteSpace: "nowrap",
      alignItems: "center",
      padding: theme.spacing(0.2, 1.6),
      [theme.breakpoints.up("sm")]: {
        marginTop: "unset",
        alignSelf: "center",
      },
    },
    icon: {
      color: theme.palette.primary.main,
      margin: theme.spacing(0.5),
    },
  });
}
