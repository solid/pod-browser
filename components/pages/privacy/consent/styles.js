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

export default function styles(theme) {
  return {
    "request-container": {
      flexGrow: 1,
      flexDirection: "column",
      margin: theme.spacing(1, 0),
      alignItems: "center",
      [theme.breakpoints.up("sm")]: {
        display: "flex",
        gap: "1rem",
      },
    },
    "request-container__content": {
      border: "solid 1px",
      borderColor: theme.palette.grey["200"],
      borderRadius: 8,
      boxShadow: "0 4px 12px 1px rgba(208,208,208,0.22)",
      display: "block",
      padding: theme.spacing(1.6, 2.4, 1.2, 2.4),
      width: 600,
      minHeight: 50,
    },

    "request-container__content--main": {
      flexGrow: 1,
    },

    "request-container__section--box": {
      border: "solid 1px",
      borderColor: theme.palette.grey["200"],
      borderRadius: 4,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(0.6, 1.2, 0.6, 1.2),
    },

    "request-container__section-header": {
      display: "flex",
    },

    "request-container__button--small": {
      fontSize: "0.8rem",
      textTransform: "capitalize",
    },

    "request-container__header-text": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      fontSize: "1.4rem",
      margin: "0",
    },

    "request-container__header-text--small": {
      fontSize: "1rem",
      fontWeight: "normal",
    },

    "request-container__header-text--center": {
      textAlign: "center",
    },

    "icon-small": {
      ...theme.icons.iconColor(theme.palette.info.main),
      fontSize: 16,
      marginRight: "0.5rem",
    },
  };
}
