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

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-one-expression-per-line */

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useBem } from "@solid/lit-prism-patterns";
import { Icons } from "@inrupt/prism-react-components";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import clsx from "clsx";
import {
  createStyles,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { customPolicies } from "../../../../constants/policies";
import styles from "./styles";

export const TESTCAFE_ID_CUSTOM_POLICY_DROPDOWN = "custom-policy-dropdown";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function CustomPolicyDropdown({
  setCustomPolicy,
  defaultValue,
}) {
  const bem = useBem(useStyles());
  const classes = useStyles();

  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const handleSelectPolicy = (e) => {
    const { value } = e.target;
    setSelectedValue(value);
  };

  useEffect(() => {
    setCustomPolicy(selectedValue);
  }, [selectedValue, setCustomPolicy]);

  return (
    <Select
      data-testid={TESTCAFE_ID_CUSTOM_POLICY_DROPDOWN}
      value={selectedValue}
      onChange={handleSelectPolicy}
      classes={{ root: classes.dropdown }}
      disableUnderline
      IconComponent={({ className }) => (
        <ExpandMoreIcon
          className={clsx(classes.iconCaret, className)}
          fontSize="inherit"
        />
      )}
    >
      {customPolicies.map(({ name, title, DescriptionComponent }) => {
        return (
          <MenuItem value={name} classes={{ root: classes.menuItem }}>
            <ListItemIcon>
              <Icons name="settings" className={bem("icon-custom-policies")} />
            </ListItemIcon>
            <ListItemText
              disableTypography
              classes={{ root: classes.menuItemText }}
            >
              <div className={bem("title")}>{title}</div>
              <div className={bem("description")}>
                <DescriptionComponent />
              </div>
            </ListItemText>
          </MenuItem>
        );
      })}
    </Select>
  );
}

CustomPolicyDropdown.propTypes = {
  setCustomPolicy: PropTypes.func,
  defaultValue: PropTypes.string,
};

CustomPolicyDropdown.defaultProps = {
  setCustomPolicy: () => {},
  defaultValue: "viewAndAdd",
};
