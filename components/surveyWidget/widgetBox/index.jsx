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
import { Popover } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";
import { Icons } from "@inrupt/prism-react-components";
import { useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";

export const TESTCAFE_ID_CLOSE_WIDGET_BUTTON = "widget-closebutton";
export const TESTCAFE_ID_WIDGET_BOX = "widget-box";
export const RESEARCH_SURVEY_URL = "https://www.research.net/r/podbrowser";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function WidgetBox({ id, open, anchorEl, onClose }) {
  const classes = useStyles();
  const bem = useBem(useStyles());

  return (
    <Popover
      data-testid={TESTCAFE_ID_WIDGET_BOX}
      classes={{ paper: classes["survey-widget-box"] }}
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <span className={bem("survey-widget-close-button-wrapper")}>
        <button
          type="button"
          className={bem("survey-widget-close-button")}
          onClick={onClose}
          data-testid={TESTCAFE_ID_CLOSE_WIDGET_BUTTON}
        >
          <Icons name="cancel" />
        </button>
      </span>
      Take our 5 minute survey to tell us about your experience using
      PodBrowser!
      <a
        className={clsx(bem("button"), bem("survey-link"))}
        href={RESEARCH_SURVEY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={bem("survey-link-text")}>Take Survey</span>
        <Icons name="external-link" className={bem("survey-link-icon")} />
      </a>
    </Popover>
  );
}

WidgetBox.propTypes = {
  id: T.string,
  open: T.bool,
  // eslint-disable-next-line react/forbid-prop-types
  anchorEl: T.any,
  onClose: T.func.isRequired,
};

WidgetBox.defaultProps = {
  id: undefined,
  open: false,
  anchorEl: null,
};
