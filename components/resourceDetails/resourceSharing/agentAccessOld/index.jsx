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

// TODO: this component is kept here to keep the old Permissions accordion working.
// It can be removed after the old permissions accordion is gone.

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { Avatar, createStyles, Typography } from "@mui/core";
import { makeStyles } from "mui/styles";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import { Form, Button as PrismButton } from "@inrupt/prism-react-components";
import PermissionsForm from "../../../permissionsForm";
import styles from "./styles";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import ConfirmationDialog from "../../../confirmationDialog";
import { displayProfileName } from "../../../../src/solidClientHelpers/profile";
import AlertContext from "../../../../src/contexts/alertContext";
import useFullProfile from "../../../../src/hooks/useFullProfile";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import { permission } from "../../../../constants/propTypes";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-web-id";
export const TESTCAFE_ID_PERMISSIONS_FORM_SUBMIT_BUTTON =
  "permissions-form-submit-button";
export const OWN_PERMISSIONS_WARNING_PERMISSION =
  "You are about to change your own permissions. Are you sure?";

export function submitHandler(
  authenticatedWebId,
  webId,
  setOpen,
  dialogId,
  savePermissions,
  tempAccess,
  setContent
) {
  return async (event) => {
    event.preventDefault();
    if (authenticatedWebId === webId) {
      setContent(OWN_PERMISSIONS_WARNING_PERMISSION);
      setOpen(dialogId);
    } else {
      await savePermissions(tempAccess);
    }
  };
}

export function saveHandler(
  accessControl,
  onLoading,
  setAccess,
  webId,
  setTempAccess,
  setSeverity,
  setMessage,
  setAlertOpen
) {
  return async (newAccess) => {
    onLoading(true);
    setAccess(newAccess);

    if (!accessControl) {
      return;
    }

    const { error } = await accessControl.savePermissionsForAgent(
      webId,
      newAccess
    );

    if (error) throw error;

    setTempAccess(null);
    setSeverity("success");
    setMessage("Permissions have been updated!");
    setAlertOpen(true);
    onLoading(false);
  };
}

export function getDialogId(datasetIri) {
  return `change-agent-access-${datasetIri}`;
}

export default function AgentAccess({ onLoading, permission: { acl, webId } }) {
  const profile = useFullProfile(webId);
  const classes = useStyles();
  const { session } = useSession();
  const { webId: authenticatedWebId } = session.info;
  const [access, setAccess] = useState(acl);
  const [tempAccess, setTempAccess] = useState(acl);
  const { solidDataset: dataset } = useContext(DatasetContext);
  const { accessControl } = useContext(AccessControlContext);

  const { open, confirmed, setContent, setOpen } = useContext(
    ConfirmationDialogContext
  );

  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const dialogId = getDialogId(getSourceUrl(dataset));

  const savePermissions = saveHandler(
    accessControl,
    onLoading,
    setAccess,
    webId,
    setTempAccess,
    setSeverity,
    setMessage,
    setAlertOpen
  );

  useEffect(() => {
    if (open !== dialogId || !confirmed || authenticatedWebId !== webId) return;
    // this triggers when a visitor changes their own permissions
    savePermissions(tempAccess);
  }, [
    authenticatedWebId,
    confirmed,
    savePermissions,
    tempAccess,
    webId,
    dialogId,
    open,
  ]);

  const onSubmit = submitHandler(
    authenticatedWebId,
    webId,
    setOpen,
    dialogId,
    savePermissions,
    tempAccess,
    setContent
  );

  const avatar = profile?.avatars[0];
  const name = displayProfileName(profile) || webId;

  return (
    <>
      <Avatar className={classes.avatar} alt={name} src={avatar} />
      <Typography
        data-testid={TESTCAFE_ID_AGENT_WEB_ID}
        className={classes.detailText}
      >
        {name}
      </Typography>
      <Form onSubmit={onSubmit}>
        <PermissionsForm
          key={webId}
          webId={webId}
          acl={access}
          onChange={setTempAccess}
        >
          <PrismButton
            onClick={onSubmit}
            type="submit"
            variant="secondary"
            data-testid={TESTCAFE_ID_PERMISSIONS_FORM_SUBMIT_BUTTON}
          >
            Save
          </PrismButton>
        </PermissionsForm>
      </Form>
      <ConfirmationDialog />
    </>
  );
}

AgentAccess.propTypes = {
  permission: permission.isRequired,
  onLoading: T.func,
};

AgentAccess.defaultProps = {
  onLoading: () => {},
};
