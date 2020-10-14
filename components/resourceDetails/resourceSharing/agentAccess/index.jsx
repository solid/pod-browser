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

/* eslint-disable react/forbid-prop-types */

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { Avatar, createStyles, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import { Button } from "@inrupt/prism-react-components";
import PermissionsForm from "../../../permissionsForm";
import styles from "./styles";
import { displayProfileName } from "../../../../src/solidClientHelpers/profile";
import AlertContext from "../../../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import AccessControlContext from "../../../../src/contexts/accessControlContext";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-web-id";

export function submitHandler(
  authenticatedWebId,
  webId,
  setOpen,
  dialogId,
  savePermissions,
  tempAccess
) {
  return async () => {
    if (authenticatedWebId === webId) {
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

export default function AgentAccess({
  onLoading,
  permission: { acl, profile, webId },
}) {
  const classes = useStyles();
  const {
    session: {
      info: { webId: authenticatedWebId },
    },
  } = useSession();
  const [access, setAccess] = useState(acl);
  const [tempAccess, setTempAccess] = useState(null);
  const { avatar } = profile;
  const { dataset } = useContext(DatasetContext);
  const name = displayProfileName(profile);
  const { accessControl } = useContext(AccessControlContext);

  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const dialogId = getDialogId(getSourceUrl(dataset));
  const {
    setTitle,
    open,
    setOpen,
    setContent,
    confirmed,
    setConfirmed,
  } = useContext(ConfirmationDialogContext);

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

  const onClick = submitHandler(
    authenticatedWebId,
    webId,
    setOpen,
    dialogId,
    savePermissions,
    tempAccess
  );

  useEffect(() => {
    if (!open || open !== dialogId) return;

    setTitle("Confirm Access Permissions");
    setContent(
      <p>
        You are about to change your own access to this resource, are you sure
        you wish to continue?
      </p>
    );

    if (confirmed === null) return;

    (async () => {
      if (open && confirmed) {
        await savePermissions(tempAccess);
      }

      if (open && confirmed !== null) {
        setTempAccess(null);
        setOpen(null);
        setConfirmed(null);
      }
    })();
  }, [
    setTitle,
    setContent,
    confirmed,
    setOpen,
    setConfirmed,
    open,
    savePermissions,
    tempAccess,
    dialogId,
  ]);

  return (
    <>
      <Avatar className={classes.avatar} alt={name} src={avatar} />
      <Typography
        data-testid={TESTCAFE_ID_AGENT_WEB_ID}
        className={classes.detailText}
      >
        {name}
      </Typography>
      <PermissionsForm key={webId} acl={access} onChange={setTempAccess}>
        <Button onClick={onClick}>Save</Button>
      </PermissionsForm>
    </>
  );
}

AgentAccess.propTypes = {
  permission: T.object.isRequired,
  onLoading: T.func,
};

AgentAccess.defaultProps = {
  onLoading: () => {},
};
