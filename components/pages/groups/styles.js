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
    "groups-container": {
      flexGrow: 1,
      margin: theme.spacing(1, 0),
      [theme.breakpoints.up("sm")]: {
        display: "flex",
        gap: "1rem",
      },
    },
    "groups-container__content": {
      display: "none",
      [theme.breakpoints.up("sm")]: {
        border: "solid 1px",
        borderColor: theme.palette.grey["200"],
        borderRadius: 8,
        boxShadow: "0 4px 12px 1px rgba(208,208,208,0.22)",
        display: "block",
      },
    },
    "groups-container__content--focus": {
      display: "block",
    },
    "groups-container__content--list": {
      [theme.breakpoints.up("sm")]: {
        maxWidth: 360,
        width: "50%",
      },
    },
    "groups-container__content--main": {
      [theme.breakpoints.up("sm")]: {
        flexGrow: 1,
      },
    },
  };
}
