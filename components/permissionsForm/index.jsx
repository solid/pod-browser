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

/* eslint-disable camelcase */
import React, { useState } from "react";
import T from "prop-types";
import { Button, createStyles, List, makeStyles } from "@material-ui/core";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import { useSession } from "@inrupt/solid-ui-react";
import PermissionCheckbox from "./permissionCheckbox";
import {
  displayPermissions,
  ACL,
} from "../../src/solidClientHelpers/permissions";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_PERMISSIONS_DROPDOWN_BUTTON = "permissions-dropdown-button";

export function toggleOpen(open, setOpen) {
  return () => setOpen(!open);
}

export function arrowIcon(open) {
  return open ? <KeyboardArrowUp /> : <KeyboardArrowDown />;
}

export function permissionHandler(access, setAccess, onChange) {
  return (key) => () => {
    const value = !access[key];
    const newAccess = {
      ...access,
      [key]: value,
    };
    setAccess(newAccess);
    onChange(newAccess);
  };
}

export default function PermissionsForm({
  acl,
  children,
  disabled: propsDisabled,
  onChange,
  webId,
}) {
  const classes = useStyles();
  const { session } = useSession();
  const [access, setAccess] = useState(acl);
  const [formOpen, setFormOpen] = useState(false);
  const disabled = propsDisabled ?? session.info.webId === webId;

  const setPermissionHandler = permissionHandler(access, setAccess, onChange);

  return (
    <div className={classes.container}>
      <Button
        data-testid={TESTCAFE_ID_PERMISSIONS_DROPDOWN_BUTTON}
        className={classes.summary}
        onClick={toggleOpen(formOpen, setFormOpen)}
        endIcon={arrowIcon(formOpen)}
      >
        <span>{displayPermissions(access)}</span>
      </Button>
      <section
        className={formOpen ? classes.selectionOpen : classes.selectionClosed}
      >
        <List>
          <PermissionCheckbox
            value={access.read}
            classes={classes}
            label={ACL.READ.alias}
            onChange={setPermissionHandler(ACL.READ.key)}
            disabled={disabled}
          />
          <PermissionCheckbox
            value={access.write}
            classes={classes}
            label={ACL.WRITE.alias}
            disabled={disabled}
            onChange={setPermissionHandler(ACL.WRITE.key)}
          />
          <PermissionCheckbox
            value={access.append}
            classes={classes}
            label={ACL.APPEND.alias}
            disabled={disabled}
            onChange={setPermissionHandler(ACL.APPEND.key)}
          />
          <PermissionCheckbox
            value={access.control}
            classes={classes}
            label={ACL.CONTROL.alias}
            disabled={disabled}
            onChange={setPermissionHandler(ACL.CONTROL.key)}
          />
        </List>
        {children}
      </section>
    </div>
  );
}

PermissionsForm.propTypes = {
  acl: T.shape({
    read: T.bool.isRequired,
    write: T.bool.isRequired,
    append: T.bool.isRequired,
    control: T.bool.isRequired,
  }),
  webId: T.string,
  children: T.node,
  disabled: T.bool,
  onChange: T.func,
};

PermissionsForm.defaultProps = {
  acl: {
    read: false,
    write: false,
    append: false,
    control: false,
  },
  children: null,
  disabled: null,
  webId: null,
  onChange: () => {},
};
