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
import { PrismTheme } from "@solid/lit-prism-patterns";
import {
  unstable_Access,
  unstable_AclDataset,
  unstable_fetchLitDatasetWithAcl,
  unstable_getResourceAcl,
  unstable_setAgentResourceAccess,
} from "@solid/lit-pod";
import Alert, { AlertProps } from "@material-ui/lab/Alert";
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
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import { NormalizedPermission } from "../../src/lit-solid-helpers";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface ISavePermissionHandler {
  access: unstable_Access;
  closeConfirmation: () => void;
  iri: string;
  setSnackbarMessage: (message: string) => void;
  setSnackbarOpen: (open: boolean) => void;
  setSnackbarType: (type: AlertProps["severity"]) => void;
  webId: string;
}

export function savePermissionsHandler({
  access,
  closeConfirmation,
  iri,
  setSnackbarMessage,
  setSnackbarOpen,
  setSnackbarType,
  webId,
}: ISavePermissionHandler): () => void {
  return async (): Promise<void> => {
    closeConfirmation();
    const dataset = await unstable_fetchLitDatasetWithAcl(iri);
    const aclDataset = unstable_getResourceAcl(dataset);

    try {
      await unstable_setAgentResourceAccess(
        aclDataset as unstable_AclDataset,
        webId,
        access as unstable_Access
      );
      setSnackbarMessage("Your permissions have been saved!");
    } catch (e) {
      setSnackbarType("error");
      setSnackbarMessage("There was an error saving permissions!");
    }

    setSnackbarOpen(true);
  };
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackBarType, setSnackbarType] = useState(
    "success" as AlertProps["severity"]
  );
  const [snackBarMessage, setSnackbarMessage] = useState("");

  if (!permission) return null;
  if (!access.control) return null;

  const closeSnackBar = () => setSnackbarOpen(false);
  const openConfirmation = () => setDialogOpen(true);
  const closeConfirmation = () => setDialogOpen(false);

  const savePermissions = savePermissionsHandler({
    access,
    closeConfirmation,
    iri,
    setSnackbarMessage,
    setSnackbarOpen,
    setSnackbarType,
    webId,
  });

  const handleSaveClick = async () => {
    if (warnOnSubmit) {
      openConfirmation();
    } else {
      await savePermissions();
    }
  };

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
        <ListItem className={classes.listItem}>
          <FormControlLabel
            classes={{ label: classes.label }}
            label="Read"
            control={(
              <Checkbox
                classes={{ root: classes.checkbox }}
                checked={access.read}
                name="read"
                onChange={setPermissionHandler(
                  access,
                  "read",
                  setAccess
                )}
              />
            )}
          />
        </ListItem>

        <ListItem className={classes.listItem}>
          <FormControlLabel
            classes={{ label: classes.label }}
            label="Write"
            control={(
              <Checkbox
                classes={{ root: classes.checkbox }}
                checked={access.write}
                name="write"
                onChange={setPermissionHandler(
                  access,
                  "write",
                  setAccess
                )}
              />
            )}
          />
        </ListItem>

        <ListItem className={classes.listItem}>
          <FormControlLabel
            classes={{ label: classes.label }}
            label="Append"
            control={(
              <Checkbox
                classes={{ root: classes.checkbox }}
                checked={access.append}
                name="append"
                onChange={setPermissionHandler(
                  access,
                  "append",
                  setAccess
                )}
              />
            )}
          />
        </ListItem>

        <ListItem className={classes.listItem}>
          <FormControlLabel
            classes={{ label: classes.label }}
            label="Control"
            control={(
              <Checkbox
                classes={{ root: classes.checkbox }}
                checked={access.control}
                name="control"
                onChange={setPermissionHandler(
                  access,
                  "control",
                  setAccess
                )}
              />
            )}
          />
        </ListItem>
      </List>

      <Button id="save-button" onClick={handleSaveClick} variant="contained">
        Save
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={closeSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackBar} severity={snackBarType}>
          {snackBarMessage}
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
            You are about to edit your own access to this resource. Are you sure
            you wish to continue?
          </p>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={closeConfirmation} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary" onClick={savePermissions}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </details>
  );
}
