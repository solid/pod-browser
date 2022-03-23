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

const BOTTOM_POSITION_CLOSE_BUTTON = "88%";
const LEFT_POSITION_CLOSE_BUTTON = "81%";
const SHADOW = "0 6px 23px 0 rgba(149, 149, 149, 0.2)";
const DARK_TEAL_TEXT_COLOR = "073D6C";

export default function styles(theme) {
  return createStyles(theme, ["button"], {
    "survey-widget-box": {
      padding: "2rem",
      width: "19rem",
      borderRadius: 30,
      transform: "translateY(-1rem) !important",
      boxShadow: SHADOW,
      textAlign: "center",
      fontWeight: theme.typography.fontWeightBold,
      color: DARK_TEAL_TEXT_COLOR,
      zIndex: -1,
      overflow: "initial",
    },
    "survey-link": {
      display: "flex",
      width: "100%",
      marginTop: "1rem",
      justifyContent: "center",
      textAlign: "center",
    },
    "survey-link-text": {
      flexGrow: 1,
    },
    "survey-link-icon": {
      flexGrow: 1,
      width: "max-content",
      display: "flex",
      color: theme.palette.primary.contrastText,
      alignSelf: "center",
      justifyContent: "flex-end",
    },
    "survey-widget-close-button": {
      border: "none",
      borderRadius: "50%",
      width: "2rem",
      height: "2rem",
      background: theme.palette.background.paper,
      boxShadow: SHADOW,
      marginLeft: "1rem",
      cursor: "pointer",
      color: theme.palette.grey[700],
    },
    "survey-widget-close-button-wrapper": {
      paddingLeft: "1rem",
      position: "absolute",
      bottom: BOTTOM_POSITION_CLOSE_BUTTON,
      left: LEFT_POSITION_CLOSE_BUTTON,
      zIndex: 1,
    },
  });
}
