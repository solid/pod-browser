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

const lightPrimaryBackgroundColor = "#F1EDFF";

const styles = (theme) => {
  return createStyles(theme, [], {
    avatar: {
      width: "30px",
      height: "30px",
    },
    appAvatar: {
      textAlign: "center",
      width: "30px",
      height: "30px",
      padding: theme.spacing(1),
      borderRadius: "50%",
      marginRight: theme.spacing(0.4),
      fontSize: theme.typography.h6.fontSize,
      color: theme.palette.primary.main,
      backgroundColor: lightPrimaryBackgroundColor,
    },
  });
};

export default styles;
