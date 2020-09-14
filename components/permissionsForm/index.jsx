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
import { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { Button, createStyles, List, makeStyles } from "@material-ui/core";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import AlertContext from "../../src/contexts/alertContext";
import PermissionCheckbox from "./permissionCheckbox";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import {
  displayPermissions,
  ACL,
} from "../../src/solidClientHelpers/permissions";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_PERMISSIONS_DROPDOWN_BUTTON = "permissions-dropdown-button";

export function setPermissionHandler(access, key, setAccess) {
  return () => {
    const value = !access[key];
    setAccess({
      ...access,
      [key]: value,
    });
  };
}

export function savePermissionsHandler({
  access,
  onSave,
  setAlertOpen,
  setDialogOpen,
  setMessage,
  setSeverity,
}) {
  return async () => {
    const { response, error } = await onSave(access);

    if (response) {
      setDialogOpen(false);
      setSeverity("success");
      setMessage("Your permissions have been saved!");
      setAlertOpen(true);
    } else {
      setDialogOpen(false);
      setSeverity("error");
      setMessage(error);
      setAlertOpen(true);
    }
  };
}

export function saveHandler({ setDialogOpen, warnOnSubmit, savePermissions }) {
  return async () => {
    if (warnOnSubmit) {
      setDialogOpen(true);
    } else {
      await savePermissions();
    }
  };
}

export function toggleOpen(open, setOpen) {
  return () => setOpen(!open);
}

export function arrowIcon(open) {
  return open ? <KeyboardArrowUp /> : <KeyboardArrowDown />;
}

function PermissionsForm({ permission, warnOnSubmit, onSave }) {
  const { acl } = permission;

  const classes = useStyles();
  const [access, setAccess] = useState(acl);
  const [formOpen, setFormOpen] = useState(false);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const { setTitle, setOpen, setContent, confirmed, setConfirmed } = useContext(
    ConfirmationDialogContext
  );
  const savePermissions = savePermissionsHandler({
    access,
    onSave,
    setAlertOpen,
    setDialogOpen: setOpen,
    setMessage,
    setSeverity,
  });

  useEffect(() => {
    if (confirmationSetup && !confirmed) return;

    setTitle("Confirm Access Permissions");
    setContent(
      <p>
        You are about to change your own access to this resource, are you sure
        you wish to continue?
      </p>
    );
    setConfirmationSetup(true);

    if (confirmed) {
      setOpen(false);
      setConfirmed(false);
      savePermissions();
    }
  }, [
    setTitle,
    setContent,
    confirmed,
    setOpen,
    setConfirmed,
    savePermissions,
    confirmationSetup,
    setConfirmationSetup,
  ]);

  return (
    // prettier-ignore
    // This chooses typescript rules over prettier in a battle over adding parenthesis to JSX
    <div className={classes.container}>
      <Button
        data-testid={TESTCAFE_ID_PERMISSIONS_DROPDOWN_BUTTON}
        className={classes.summary}
        onClick={toggleOpen(formOpen, setFormOpen)}
        endIcon={arrowIcon(formOpen)}
      >
        <span>{displayPermissions(access)}</span>
      </Button>
      <section className={formOpen ? classes.selectionOpen : classes.selectionClosed}>
        <List>
          <PermissionCheckbox
            value={access.read}
            classes={classes}
            label={ACL.READ.alias}
            onChange={setPermissionHandler(
              access,
              ACL.READ.key,
              setAccess
            )}
          />
          <PermissionCheckbox
            value={access.write}
            classes={classes}
            label={ACL.WRITE.alias}
            onChange={setPermissionHandler(
              access,
              ACL.WRITE.key,
              setAccess
            )}
          />
          <PermissionCheckbox
            value={access.append}
            classes={classes}
            label={ACL.APPEND.alias}
            onChange={setPermissionHandler(
              access,
              ACL.APPEND.key,
              setAccess
            )}
          />
          <PermissionCheckbox
            value={access.control}
            classes={classes}
            label={ACL.CONTROL.alias}
            onChange={setPermissionHandler(
              access,
              ACL.CONTROL.key,
              setAccess
            )}
          />
        </List>

        <Button
          onClick={saveHandler({
            savePermissions,
            setDialogOpen: setOpen,
            setAlertOpen,
            warnOnSubmit,
          })}
          variant="contained"
        >
          Save
        </Button>
      </section>
    </div>
  );
}

PermissionsForm.propTypes = {
  permission: T.shape({
    alias: T.string.isRequired,
    profile: T.shape({
      webId: T.string.isRequired,
      firstname: T.string,
      lastname: T.string,
      avatar: T.string,
    }).isRequired,
    acl: T.shape({
      read: T.bool.isRequired,
      write: T.bool.isRequired,
      append: T.bool.isRequired,
      control: T.bool.isRequired,
    }).isRequired,
  }).isRequired,
  warnOnSubmit: T.bool,
  onSave: T.func,
};

PermissionsForm.defaultProps = {
  warnOnSubmit: false,
  onSave: () => {},
};

export default PermissionsForm;
