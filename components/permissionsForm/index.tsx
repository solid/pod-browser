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
import { Dispatch, ReactElement, useContext, useEffect, useState } from "react";
import { PrismTheme } from "@solid/lit-prism-patterns";
import { StyleRules } from "@material-ui/styles";
import { AlertProps } from "@material-ui/lab/Alert";
import { unstable_Access } from "@inrupt/solid-client";
import {
  Button,
  Checkbox,
  createStyles,
  FormControlLabel,
  List,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import AlertContext from "../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import {
  displayPermissions,
  NormalizedPermission,
  ACL,
  IResponse,
} from "../../src/solidClientHelpers";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface IConfirmDialog {
  warn: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export function setPermissionHandler(
  access: Record<string, boolean>,
  key: string,
  setAccess: (access: unstable_Access) => void
): () => void {
  return () => {
    const value = !access[key];
    setAccess({
      ...access,
      [key]: value,
    } as unstable_Access);
  };
}

interface IPermissionCheckbox {
  label: string;
  classes: Record<string, string>;
  onChange: () => void;
  value: boolean;
}

export function PermissionCheckbox({
  value,
  label,
  classes,
  onChange,
}: IPermissionCheckbox): ReactElement {
  const name = label.toLowerCase();

  return (
    // prettier-ignore
    <ListItem className={classes.listItem}>
      <FormControlLabel
        classes={{ label: classes.label }}
        label={label}
        control={(
          <Checkbox
            classes={{ root: classes.checkbox }}
            checked={value}
            name={name}
            onChange={onChange}
          />
        )}
      />
    </ListItem>
  );
}

interface ISavePermissionHandler {
  access: unstable_Access;
  setMessage: Dispatch<string>;
  setSeverity: Dispatch<AlertProps["severity"]>;
  setDialogOpen: Dispatch<boolean>;
  setAlertOpen: Dispatch<boolean>;
  onSave: (access: unstable_Access) => Promise<IResponse>;
}

export function savePermissionsHandler({
  access,
  onSave,
  setAlertOpen,
  setDialogOpen,
  setMessage,
  setSeverity,
}: ISavePermissionHandler): () => void {
  return async (): Promise<void> => {
    const { response, error } = await onSave(access);

    if (response) {
      setDialogOpen(false);
      setSeverity("success" as AlertProps["severity"]);
      setMessage("Your permissions have been saved!");
      setAlertOpen(true);
    } else {
      setDialogOpen(false);
      setSeverity("error" as AlertProps["severity"]);
      setMessage(error as string);
      setAlertOpen(true);
    }
  };
}

interface ISaveHandler {
  warnOnSubmit: boolean;
  setDialogOpen: Dispatch<boolean>;
  savePermissions: () => void;
  setAlertOpen: Dispatch<boolean>;
}

export function saveHandler({
  setDialogOpen,
  warnOnSubmit,
  savePermissions,
}: ISaveHandler) {
  return async (): Promise<void> => {
    if (warnOnSubmit) {
      setDialogOpen(true);
    } else {
      await savePermissions();
    }
  };
}

export function toggleOpen(
  open: boolean,
  setOpen: Dispatch<boolean>
): () => void {
  return () => setOpen(!open);
}

interface IPermissionForm {
  permission: Partial<NormalizedPermission>;
  warnOnSubmit: boolean;
  onSave: (access: unstable_Access) => Promise<IResponse>;
}

export default function PermissionsForm({
  permission,
  warnOnSubmit,
  onSave,
}: IPermissionForm): ReactElement | null {
  const { acl } = permission;

  const classes = useStyles();
  const [access, setAccess] = useState(acl);
  const [formOpen, setFormOpen] = useState(false);
  const icon = formOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />;
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const { setTitle, setOpen, setContent, confirmed, setConfirmed } = useContext(
    ConfirmationDialogContext
  );
  const unstableAccess = access as unstable_Access;

  const savePermissions = savePermissionsHandler({
    access: unstableAccess,
    onSave,
    setAlertOpen,
    setDialogOpen: setOpen,
    setMessage,
    setSeverity,
  });

  const handleSaveClick = saveHandler({
    savePermissions,
    setDialogOpen: setOpen,
    setAlertOpen,
    warnOnSubmit,
  });

  const readChange = setPermissionHandler(
    unstableAccess,
    ACL.READ.key,
    setAccess
  );
  const writeChange = setPermissionHandler(
    unstableAccess,
    ACL.WRITE.key,
    setAccess
  );
  const appendChange = setPermissionHandler(
    unstableAccess,
    ACL.APPEND.key,
    setAccess
  );
  const controlChange = setPermissionHandler(
    unstableAccess,
    ACL.CONTROL.key,
    setAccess
  );
  const handleToggleClick = toggleOpen(formOpen, setFormOpen);

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
        className={classes.summary}
        onClick={handleToggleClick}
        endIcon={icon}
      >
        <span>{displayPermissions(unstableAccess)}</span>
      </Button>
      <section className={formOpen ? classes.selectionOpen : classes.selectionClosed}>
        <List>
          <PermissionCheckbox value={unstableAccess.read} classes={classes} label={ACL.READ.alias} onChange={readChange} />
          <PermissionCheckbox value={unstableAccess.write} classes={classes} label={ACL.WRITE.alias} onChange={writeChange} />
          <PermissionCheckbox value={unstableAccess.append} classes={classes} label={ACL.APPEND.alias} onChange={appendChange} />
          <PermissionCheckbox value={unstableAccess.control} classes={classes} label={ACL.CONTROL.alias} onChange={controlChange} />
        </List>

        <Button onClick={handleSaveClick} variant="contained">
          Save
        </Button>
      </section>
    </div>
  );
}
