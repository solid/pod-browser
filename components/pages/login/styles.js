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

// TODO: move these new colors to Prism
const LOGIN_BACKGROUND_COLOR = "#FCFEFF";
const TITLE_COLOR = "#0D6796";

const styles = (theme) =>
  createStyles(theme, ["content"], {
    "login-page": {
      textAlign: "center",
      flexGrow: 1,
      flexShrink: 0,
      backgroundColor: LOGIN_BACKGROUND_COLOR,
      color: theme.palette.grey[800],
      boxSizing: "border-box",
      height: "100%",
      paddingTop: 60, // magic number - same as height of header
      fontStyle: "italic",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      "& p": {
        marginBottom: theme.spacing(3),
      },
      [theme.breakpoints.up("sm")]: {
        padding: 0,
        paddingTop: 60, // magic number - same as height of header
      },
    },
    "login-page__title": {
      fontStyle: "normal",
      color: TITLE_COLOR,
      fontSize: "2.3125rem",
      letterSpacing: 1.4,
      lineHeight: "40px",
      margin: theme.spacing(0.7, 0),
    },
    "links-container": {
      fontStyle: "normal",
      padding: theme.spacing(5, 0),
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      [theme.breakpoints.up("sm")]: {
        minWidth: 420,
        maxWidth: 600,
      },
    },
    "links-container__text": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing(11.6),
    },
    "links-container__list": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    "links-container__button": {
      padding: theme.spacing(0, 1),
    },
  });

export default styles;
