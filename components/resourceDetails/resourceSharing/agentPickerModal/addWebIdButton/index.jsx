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

/* eslint-disable react/forbid-prop-types */

import React from "react";
import PropTypes from "prop-types";
import { createStyles } from "@material-ui/core";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Button } from "@inrupt/prism-react-components";
import styles from "./styles";

export const TESTCAFE_ADD_WEBID_BUTTON = "add-webid-button";
const TESTCAFE_ADD_WEBID_BUTTON_MOBILE = "add-web-id-button-mobile";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function AddWebIdButton({ onClick, disabled, className }) {
  const classes = useStyles();
  return (
    <Button
      variant="secondary"
      /* istanbul ignore next */
      data-testid={
        className?.includes("mobileOnly")
          ? TESTCAFE_ADD_WEBID_BUTTON_MOBILE
          : TESTCAFE_ADD_WEBID_BUTTON
      }
      className={clsx(classes.button, className)}
      disabled={disabled}
      onClick={onClick}
      iconBefore="add"
    >
      Add WebId
    </Button>
  );
}

AddWebIdButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

AddWebIdButton.defaultProps = {
  disabled: false,
  className: null,
};
