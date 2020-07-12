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
import { ReactElement, useState, useContext } from "react";
import { PrismTheme } from "@solid/lit-prism-patterns";
import { StyleRules } from "@material-ui/styles";
import { AlertProps } from "@material-ui/lab/Alert";
import {
  unstable_Access,
  unstable_AclDataset,
  unstable_fetchLitDatasetWithAcl,
  unstable_getResourceAcl,
  unstable_setAgentResourceAccess,
} from "@solid/lit-pod";
import {
  Button,
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  makeStyles,
} from "@material-ui/core";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import AlertContext from "../../src/contexts/alertContext";
import { NormalizedPermission } from "../../src/lit-solid-helpers";
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

export function confirmationDialog({
  warn,
  open,
  setOpen,
  onConfirm,
}: IConfirmDialog): ReactElement | null {
  if (!warn) return null;

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="permission-edit-confirmation"
      open={open}
    >
      <DialogTitle>Change Personal Access</DialogTitle>
      <DialogContent dividers>
        <p>
          You are about to edit your own access to this resource. Are you sure
          you wish to continue?
        </p>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => setOpen(false)} color="primary">
          Cancel
        </Button>
        <Button type="submit" color="primary" onClick={onConfirm}>
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
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
  iri: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setSeverity: React.Dispatch<React.SetStateAction<AlertProps["severity"]>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  webId: string;
}

export function savePermissionsHandler({
  access,
  iri,
  setMessage,
  setSeverity,
  setDialogOpen,
  setAlertOpen,
  webId,
}: ISavePermissionHandler): () => void {
  return async (): Promise<void> => {
    const dataset = await unstable_fetchLitDatasetWithAcl(iri);
    const aclDataset = unstable_getResourceAcl(dataset);

    try {
      await unstable_setAgentResourceAccess(
        aclDataset as unstable_AclDataset,
        webId,
        access as unstable_Access
      );
      setDialogOpen(false);
      setMessage("Your permissions have been saved!");
      setAlertOpen(true);
    } catch (e) {
      setDialogOpen(false);
      setSeverity("error" as AlertProps["severity"]);
      setMessage("There was an error saving permissions!");
      setAlertOpen(true);
    }
  };
}

interface ISaveHandler {
  warnOnSubmit: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  savePermissions: () => void;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
      setDialogOpen(false);
      await savePermissions();
    }
  };
}

interface IPermissionForm {
  iri: string;
  permission: NormalizedPermission;
  warnOnSubmit: boolean;
}

export default function PermissionsForm({
  iri,
  permission,
  warnOnSubmit = false,
}: IPermissionForm): ReactElement | null {
  const { webId, acl, alias } = permission;

  const classes = useStyles();
  const [access, setAccess] = useState(acl);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);

  if (!permission) return null;
  if (!access.control) return null;

  const savePermissions = savePermissionsHandler({
    access,
    iri,
    setMessage,
    setSeverity,
    setDialogOpen,
    setAlertOpen,
    webId,
  });

  const handleSaveClick = saveHandler({
    savePermissions,
    setDialogOpen,
    setAlertOpen,
    warnOnSubmit,
  });
  const readChange = setPermissionHandler(access, "read", setAccess);
  const writeChange = setPermissionHandler(access, "write", setAccess);
  const appendChange = setPermissionHandler(access, "append", setAccess);
  const controlChange = setPermissionHandler(access, "control", setAccess);

  return (
    // prettier-ignore
    // This chooses typescript rules over prettier in a battle over adding parenthesis to JSX
    <details>
      <summary className={classes.summary}>
        <span>{alias}</span>
        <span className={classes.selectIcon}>
          <KeyboardArrowDown />
        </span>
      </summary>
      <List>
        <PermissionCheckbox value={access.read} classes={classes} label="read" onChange={readChange} />
        <PermissionCheckbox value={access.write} classes={classes} label="write" onChange={writeChange} />
        <PermissionCheckbox value={access.append} classes={classes} label="append" onChange={appendChange} />
        <PermissionCheckbox value={access.control} classes={classes} label="control" onChange={controlChange} />
      </List>

      <Button onClick={handleSaveClick} variant="contained">
        Save
      </Button>

      {confirmationDialog({warn: warnOnSubmit, open: dialogOpen, setOpen: setDialogOpen, onConfirm: savePermissions})}
    </details>
  );
}
