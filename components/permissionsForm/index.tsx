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
import { ReactElement, useState } from "react";
import { useForm } from "react-hook-form";
import { PrismTheme } from "@solid/lit-prism-patterns";
import {
  unstable_AccessModes,
  unstable_fetchLitDatasetWithAcl,
  unstable_getResourceAcl,
  unstable_setAgentResourceAccess,
} from "@solid/lit-pod";
import Alert from '@material-ui/lab/Alert';
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
  Snackbar,
  StyleRules,
} from "@material-ui/core";
import { NormalizedPermission } from "../../src/lit-solid-helpers";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

export function setPermissionHandler(
  permissionValue: boolean,
  setPermission: (value: boolean) => void
): () => void {
  return () => {
    setPermission(!permissionValue);
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
  const { webId, acl } = permission;
  const { read, write, append, control } = acl;

  const classes = useStyles();
  const [readPermission, setReadPermission] = useState(read);
  const [writePermission, setWritePermission] = useState(write);
  const [appendPermission, setAppendPermission] = useState(append);
  const [controlPermission, setControlPermission] = useState(control);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!permission) return null;
  if (!control) return null;

  const closeSnackBar = () => setSnackbarOpen(false);
  const openConfirmation = () => setDialogOpen(true);
  const closeConfirmation = () => setDialogOpen(false);
  const savePermissions = async () => {
    closeConfirmation();
    const dataset = await unstable_fetchLitDatasetWithAcl(iri);
    const aclDataset = unstable_getResourceAcl(dataset);

    const resourceAccess = {
      aclDataset,
      agent: webId,
      access: {
        read: readPermission,
        write: writePermission,
        append: appendPermission,
        control: controlPermission,
      },
    };

    setSnackbarOpen(true);
    // const response = await unstable_setAgentResourceAccess(resourceAccess);
  }
  const handleSaveClick = () => {
    if (warnOnSubmit) {
      openConfirmation();
    } else {
      savePermissions();
    }
  };

  return (
    <>
      <List>
        <ListItem className={classes.listItem}>
          <FormControlLabel
            label="Read"
            control={(
              <Checkbox
                checked={readPermission}
                name="read"
                onChange={setPermissionHandler(
                  readPermission,
                  setReadPermission
                )}
              />
            )}
          />
        </ListItem>

        <ListItem className={classes.listItem}>
          <FormControlLabel
            label="Write"
            control={(
              <Checkbox
                checked={writePermission}
                name="write"
                onChange={setPermissionHandler(
                  writePermission,
                  setWritePermission
                )}
              />
            )}
          />
        </ListItem>

        <ListItem className={classes.listItem}>
          <FormControlLabel
            label="Append"
            control={(
              <Checkbox
                checked={appendPermission}
                name="append"
                onChange={setPermissionHandler(
                  appendPermission,
                  setAppendPermission
                )}
              />
            )}
          />
        </ListItem>

        <ListItem className={classes.listItem}>
          <FormControlLabel
            label="Control"
            control={(
              <Checkbox
                checked={controlPermission}
                name="control"
                onChange={setPermissionHandler(
                  controlPermission,
                  setControlPermission
                )}
              />
            )}
          />
        </ListItem>
      </List>

      <Button id="save-button" onClick={handleSaveClick} variant="contained">Save</Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackBar} severity="success">
          Your permissions have been saved!
        </Alert>
      </Snackbar>

      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"
        aria-labelledby="permission-edit-confirmation"
        open={dialogOpen}
        onClose={closeConfirmation}
      >
        <DialogTitle>Change Personal Access</DialogTitle>
        <DialogContent dividers>
          <p>
            You are about to edit your own access to this resource. Are you sure you wish to continue?
          </p>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={closeConfirmation} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" onClick={savePermissions}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
