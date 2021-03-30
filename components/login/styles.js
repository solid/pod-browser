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
  return createStyles(theme, ["button"], {
    separator__wrap: {
      height: "2rem",
      margin: theme.spacing(2.4, 1.2),
      position: "relative",
      boxSizing: "border-box",
      marginBottom: theme.spacing(3.2),
    },
    "separator__centre-line": {
      textAlign: "center",
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "100%",
      transform: "translate(-50%, -50%)",
      "&:before": {
        content: '""',
        position: "absolute",
        width: "100%",
        height: 1,
        top: "50%",
        left: 0,
        zIndex: -1,
        background: theme.palette.grey.A100,
      },
      "& span": {
        fontSize: "0.75rem",
        fontFamily: theme.typography.body1.fontFamily,
        color: theme.palette.grey[700],
        textTransform: "uppercase",
        backgroundColor: theme.palette.background.default,
        padding: "0.5rem 1rem",
        display: "inline-block",
      },
    },
    "provider-login-container": {
      display: "none",
      paddingTop: theme.spacing(1.6),
    },
    "provider-login-container--visible": {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    "info-button": {
      fontSize: theme.typography.button.fontSize,
    },
    "login-form": {
      [theme.breakpoints.up("sm")]: {
        maxWidth: 400,
        padding: theme.spacing(3.2),
      },
      textAlign: "center",
      fontStyle: "normal",
      marginBottom: theme.spacing(2.4),
      background: theme.palette.background.default,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2.4),
      boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.3)",
      "& h3": {
        fontFamily: theme.typography.h3.fontFamily,
        textTransform: "uppercase",
        fontSize: "0.75rem",
      },
    },
    "login-form__button": {
      width: "100%",
    },
    "login-form__logo": {
      marginBottom: theme.spacing(2.4),
    },
  });
}
