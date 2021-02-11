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

const WIDTH_DIALOG = 640;

export default function styles(theme) {
  return createStyles(theme, ["icons", "button"], {
    cancelButton: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      padding: theme.spacing(1.4, 1.8),
      backgroundColor: "transparent",
    },
    submitAgentsButton: {
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      color: theme.palette.common.white,
      backgroundColor: theme.palette.primary.main,
      padding: theme.spacing(1.4, 1.8),
    },
    dialog: {
      width: WIDTH_DIALOG,
    },
    dialogActions: {
      padding: theme.spacing(2.4),
    },
    dialogTitle: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: theme.typography.h2.fontWeight,
    },
    dialogText: {
      fontWeight: theme.typography.body.fontWeight,
      fontFamily: theme.typography.body.fontFamily,
    },
  });
}
