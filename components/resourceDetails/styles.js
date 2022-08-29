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

import { blue } from "@material-ui/core/colors";
import { content } from "@solid/lit-prism-patterns";

const rules = {
  accordionDetails: {
    display: "block",
    paddingBottom: "5rem",
  },
  centeredSection: {
    paddingLeft: "1rem",
    paddingRight: "1rem",
  },
  headerSection: {
    paddingLeft: "1rem",
    paddingRight: "1rem",
    display: "flex",
    alignItems: "flex-start",
    "& button": {
      marginLeft: "auto",
    },
  },
  downloadLink: {
    background: "none",
    border: "none",
    color: blue,
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: "inherit",
    fontSize: "inherit",
    textAlign: "left",
  },
  raw: {
    height: "100%",
    width: "100%",
    maxHeight: "200px",
    overflow: "auto",
  },
  formListItem: {
    display: "block",
  },
  detailText: {
    fontSize: "0.75rem",
  },
  typeValue: {
    marginLeft: "auto",
  },
  agentInput: {
    width: "100%",
    marginBottom: "1rem",
  },
};

export default function styles(theme) {
  return {
    ...rules,
    ...content.styles(theme),
  };
}
