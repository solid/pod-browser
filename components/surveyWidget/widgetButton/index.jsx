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
import clsx from "clsx";
import T from "prop-types";
import { createStyles, makeStyles } from "@mui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";

export const TESTCAFE_ID_WIDGET_BUTTON = "widget-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function WidgetButton({ onClick, id }) {
  const classes = useStyles();
  const bem = useBem(useStyles());

  return (
    <div
      className={clsx(
        bem("button"),
        bem("widget-button-wrap"),
        id && bem("widget-button-active-state")
      )}
    >
      <button
        aria-describedby={id}
        type="button"
        className={clsx(bem("button"), bem("widget-button"))}
        data-testid={TESTCAFE_ID_WIDGET_BUTTON}
        onClick={onClick}
      >
        Help improve PodBrowser!
      </button>
    </div>
  );
}

WidgetButton.propTypes = {
  id: T.string,
  onClick: T.func.isRequired,
};

WidgetButton.defaultProps = {
  id: undefined,
};
