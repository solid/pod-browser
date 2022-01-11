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

const styles = (theme) => {
  return createStyles(theme, ["back-to-nav", "input"], {
    avatar: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
    },
    avatarText: {
      fontFamily: theme.typography.h1.fontFamily,
      fontSize: "1.5rem",
      color: theme.palette.secondary.contrastText,
    },
    headerLink: {
      display: "block",
      fontFamily: theme.typography.body2.fontFamily,
      fontSize: "1rem",
      fontWeight: theme.typography.body2.fontWeight,
      color: theme.palette.secondary.contrastText,
    },
    avatarInput: {
      width: "0%",
      opacity: "0%",
    },
    inputLabelUpload: {
      color: theme.palette.primary.main,
      fontWeight: "bold",
      textTransform: "uppercase",
      width: "100%",
      margin: "5px",
    },
    uploadIcon: {
      color: theme.palette.primary.main,
      marginRight: "5px",
    },
    inputLabelRemove: {
      marginRight: "5px",
      color: theme.palette.error.main,
      fontWeight: "bold",
      textTransform: "uppercase",
      margin: "5px",
    },
    removeIcon: {
      color: theme.palette.error.main,
      marginRight: "5px",
    },
    labelContainer: {
      alignItems: "center",
      display: "flex",
    },
  });
};

export default styles;
