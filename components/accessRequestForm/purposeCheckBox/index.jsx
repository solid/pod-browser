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

import React, { useState } from "react";
import T from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { createStyles, Checkbox } from "@mui/core";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT = "purpose-checkbox-input";

export default function PurposeCheckBox({
  handleSelectPurpose,
  url,
  description,
  disabled,
}) {
  const [checked, setChecked] = useState(false);

  const classes = useStyles();
  const handleCheck = (e) => {
    handleSelectPurpose(e);
    setChecked(e.target.checked);
  };
  return (
    <Checkbox
      className={classes.root}
      // temporarily disabling until we have functionality for this
      disabled={disabled}
      disableRipple
      checked={checked}
      checkedIcon={
        // eslint-disable-next-line react/jsx-wrap-multilines
        <span className={clsx(classes.icon, classes.checkedIcon)} />
      }
      icon={<span className={classes.icon} />}
      value={url}
      name={description}
      color="primary"
      onChange={handleCheck}
      inputProps={{
        "data-testid": TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT,
        checked,
      }}
    />
  );
}

PurposeCheckBox.defaultProps = {
  disabled: false,
};

PurposeCheckBox.propTypes = {
  handleSelectPurpose: T.func.isRequired,
  url: T.string.isRequired,
  description: T.string.isRequired,
  disabled: T.bool,
};
