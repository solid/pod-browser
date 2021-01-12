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

import React, { useContext, useState } from "react";
import T from "prop-types";
import {
  Avatar,
  Button,
  CircularProgress,
  createStyles,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import { Form, Button as PrismButton } from "@inrupt/prism-react-components";
import { Alert, Skeleton } from "@material-ui/lab";
import PermissionsForm from "../../../permissionsForm";
import styles from "./styles";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import {
  displayProfileName,
  fetchProfile,
} from "../../../../src/solidClientHelpers/profile";
import AlertContext from "../../../../src/contexts/alertContext";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import useFetchProfile from "../../../../src/hooks/useFetchProfile";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-web-id";
const TESTCAFE_ID_TRY_AGAIN_BUTTON = "try-again-button";
const TESTCAFE_ID_TRY_AGAIN_SPINNER = "try-again-spinner";

export function submitHandler(
  authenticatedWebId,
  webId,
  setOpen,
  dialogId,
  savePermissions,
  tempAccess
) {
  return async (event) => {
    event.preventDefault();
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

    if (!accessControl) return;

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
  let { data: profile, error: profileError } = useFetchProfile(webId);
  const classes = useStyles();
  const {
    session: {
      info: { webId: authenticatedWebId },
      fetch,
    },
  } = useSession();
  const bem = useBem(useStyles());
  const [access, setAccess] = useState(acl);
  const [tempAccess, setTempAccess] = useState(acl);
  const { dataset } = useContext(DatasetContext);
  const { accessControl } = useContext(AccessControlContext);
  const [isLoading, setIsLoading] = useState(false);

  const { setOpen } = useContext(ConfirmationDialogContext);

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

  const onSubmit = submitHandler(
    authenticatedWebId,
    webId,
    setOpen,
    dialogId,
    savePermissions,
    tempAccess
  );

  const handleRetryClick = async () => {
    try {
      profile = await fetchProfile(webId, fetch);
      setIsLoading(false);
    } catch (error) {
      profileError = error;
      setIsLoading(false);
    }
  };

  if (profileError) {
    const message = "Unable to load this profile";
    return (
      <div className={bem("alert-container")}>
        <Alert
          classes={{
            root: classes.alertBox,
            message: classes.alertMessage,
            action: classes.action,
          }}
          severity="warning"
          action={
            // eslint-disable-next-line react/jsx-wrap-multilines
            isLoading ? (
              <CircularProgress
                data-testid={TESTCAFE_ID_TRY_AGAIN_SPINNER}
                size={20}
                className={bem("spinner")}
                color="inherit"
              />
            ) : (
              <Button
                data-testid={TESTCAFE_ID_TRY_AGAIN_BUTTON}
                className={bem("bold-button")}
                color="inherit"
                size="small"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(handleRetryClick, 750);
                }}
              >
                Try again
              </Button>
            )
          }
        >
          {message}
        </Alert>
        <div className={classes.separator} />
        <div className={bem("avatar-container")}>
          <Avatar className={classes.avatar} alt={webId} src={null} />
          <Typography
            data-testid={TESTCAFE_ID_AGENT_WEB_ID}
            className={classes.detailText}
          >
            {webId}
          </Typography>
          <Form onSubmit={onSubmit}>
            <PermissionsForm
              key={webId}
              webId={webId}
              acl={access}
              onChange={setTempAccess}
            >
              <PrismButton onClick={onSubmit} type="submit">
                Save
              </PrismButton>
            </PermissionsForm>
          </Form>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <Skeleton
          className={classes.avatar}
          variant="circle"
          width={40}
          height={40}
        />
        <div className={classes.detailText}>
          <Skeleton variant="text" width={100} />
        </div>
      </>
    );
  }

  const { avatar } = profile;
  const name = displayProfileName(profile);

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
          <PrismButton onClick={onSubmit} type="submit">
            Save
          </PrismButton>
        </PermissionsForm>
      </Form>
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
