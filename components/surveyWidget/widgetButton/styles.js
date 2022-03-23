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

const BORDER_GRADIENT = "linear-gradient(to right, #7C4DFD, #16A0DD)";
const BORDER_WIDTH = "3px";

export default function styles(theme) {
  return createStyles(theme, ["button"], {
    "widget-button-wrap": {
      padding: BORDER_WIDTH,
      position: "absolute",
      bottom: theme.spacing(2),
      background: BORDER_GRADIENT,
      borderRadius: 30,
      "&:hover, &:focus": {
        transform: "translate(0, -3px)",
        transition: "0.2s ease-in",
      },
      [theme.breakpoints.up("lg")]: {
        bottom: theme.spacing(12.8),
        right: theme.spacing(2),
      },
    },
    "widget-button": {
      borderRadius: 30,
      backgroundClip: "padding-box",
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.primary.main,
      whiteSpace: "nowrap",

      "&:hover": {
        background: theme.palette.background.paper,
      },
    },
    "widget-button-active-state": {
      transform: "translate(0, -3px)",
      transition: "0.2s ease-in",
    },
  });
}
