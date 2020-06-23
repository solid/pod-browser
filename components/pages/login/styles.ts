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

import { createStyles, PrismTheme } from "@solid/lit-prism-patterns";

const styles = (theme: PrismTheme) =>
  createStyles(theme, ["content"], {
    "login-page": {
      background:
        "linear-gradient(135deg, rgb(124, 77, 255) 0%, rgb(24, 169, 230) 50%, rgb(1, 201, 234) 100%)",
      backgroundRepeat: "no-repeat",
      boxSizing: "border-box",
      height: "100%",
      paddingTop: 60, // magic number - same as height of header
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: "url('/background-pattern.svg')",
        filter: "opacity(30%)",
      },
    },
    "login-page__container": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
    },
    "login-page__title": {
      color: theme.palette.background.default,
      fontSize: "1.75rem",
      letterSpacing: 1.4,
      lineHeight: "40px",
      margin: theme.spacing(5, 0),
    },
  });

export default styles;
