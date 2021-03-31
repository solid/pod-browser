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
import PropTypes from "prop-types";
import { Button, createStyles, Tooltip } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_INFO_BUTTON_LABEL = "info-button-label";

export default function InfoTooltip({ tooltipText, label, className }) {
  const classes = useStyles();
  const bem = useBem(useStyles());
  return (
    <div className={clsx(classes.infoTooltipContainer, className)}>
      {label && (
        <span data-testid={TESTCAFE_ID_INFO_BUTTON_LABEL}>{label}</span>
      )}
      <Tooltip title={tooltipText} arrow>
        <Button classes={{ root: classes.infoButton }}>
          <i
            className={clsx(bem("icon-info"), bem("icon"), classes.infoIcon)}
            aria-label="Info"
          />
        </Button>
      </Tooltip>
    </div>
  );
}

InfoTooltip.propTypes = {
  tooltipText: PropTypes.string.isRequired,
  className: PropTypes.string,
  label: PropTypes.string,
};

InfoTooltip.defaultProps = {
  className: null,
  label: null,
};
