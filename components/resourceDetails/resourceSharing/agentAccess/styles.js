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
  const WARNING_BACKGROUND_COLOR = "#FFF4E5";
  const SEPARATOR_COLOR = "#E1CAAA";
  return {
    "alert-container": {
      maxWidth: "100%",
      backgroundColor: WARNING_BACKGROUND_COLOR,
      padding: 0,
    },
    action: {
      padding: 0,
      paddingRight: theme.spacing(0.5),
    },
    alertBox: {
      width: "100%",
      overflowWrap: "break-word",
      padding: theme.spacing(0.7, 1.4),
    },
    alertMessage: {
      overflowWrap: "break-word",
      fontSize: "14px",
    },
    "bold-button": {
      fontWeight: "bold",
      alignSelf: "right",
    },
    icon: {
      marginLeft: "0.25em",
    },
    spinnerContainer: {
      width: "100%",
      textAlign: "center",
    },
    spinner: {
      justifySelf: "center",
      margin: theme.spacing(2),
    },
    separator: {
      boxSizing: "border-box",
      backgroundColor: SEPARATOR_COLOR,
      margin: theme.spacing(0, 1.6),
      marginBottom: theme.spacing(0.8),
      height: "1px",
    },
    loadingStateContainer: {
      display: "flex",
      alignItems: "center",
    },
  };
}
