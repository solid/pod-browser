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

import React from "react";
import { makeStyles } from "@material-ui/styles";
import { createStyles } from "@material-ui/core";
import styles from "./styles";

export const TESTCAFE_ID_NO_POD_MESSAGE = "no-pod-message";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function NoPodFoundError() {
  const classes = useStyles();

  return (
    <div className={classes.container} data-testid={TESTCAFE_ID_NO_POD_MESSAGE}>
      <h1>Pod Not Found</h1>
      <p>It appears you do not have a Pod.</p>
      <a
        className={classes.podLink}
        href="https://id.inrupt.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Get a Pod
      </a>
    </div>
  );
}
