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
import T from "prop-types";
import {
  Checkbox,
  FormControlLabel,
  ListItem,
  makeStyles,
  createStyles,
} from "@mui/core";
import styles from "../styles";

const TESTCAFE_ID_PERMISSION_LABEL = "permission-label-";
export const TESTCASE_ID_PERMISSION_CHECKBOX = "permission-checkbox-";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function PermissionCheckbox({ value, label, disabled, onChange }) {
  const classes = useStyles();
  const name = label.toLowerCase();

  return (
    // prettier-ignore
    <ListItem className={classes.listItem}>
      <FormControlLabel
        classes={{ label: classes.label }}
        data-testid={TESTCAFE_ID_PERMISSION_LABEL + name}
        label={label}
        control={(
          <Checkbox
            classes={{ root: classes.checkbox }}
            checked={value}
            name={name}
            onChange={onChange}
            disabled={disabled}
            inputProps={{"data-testid": TESTCASE_ID_PERMISSION_CHECKBOX + name}}
          />
        )}
      />
    </ListItem>
  );
}

PermissionCheckbox.propTypes = {
  disabled: T.bool,
  value: T.bool.isRequired,
  label: T.string.isRequired,
  onChange: T.func,
};

PermissionCheckbox.defaultProps = {
  disabled: false,
  onChange: () => {},
};

export default PermissionCheckbox;
