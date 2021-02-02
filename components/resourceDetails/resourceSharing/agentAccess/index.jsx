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
import { Button, CircularProgress, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import { Alert, Skeleton } from "@material-ui/lab";
import styles from "./styles";
import { fetchProfile } from "../../../../src/solidClientHelpers/profile";
import AgentProfileDetails from "./agentProfileDetails";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_TRY_AGAIN_BUTTON = "try-again-button";
const TESTCAFE_ID_TRY_AGAIN_SPINNER = "try-again-spinner";

export default function AgentAccess({ permission, mutatePermissions }) {
  const classes = useStyles();
  const {
    session: { fetch },
  } = useSession();
  const bem = useBem(useStyles());
  const { webId, acl, profile, profileError } = permission;
  const { dataset } = useContext(DatasetContext);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const resourceIri = getSourceUrl(dataset);

  const [localAccess, setLocalAccess] = useState(acl);
  const [localProfile, setLocalProfile] = useState(profile);
  const [localProfileError, setLocalProfileError] = useState(profileError);

  const handleRetryClick = async () => {
    try {
      setLocalProfile(await fetchProfile(webId, fetch));
      setIsLoadingProfile(false);
      setLocalProfileError(null);
    } catch (error) {
      setLocalProfileError(error);
      setIsLoadingProfile(false);
    }
  };

  if (!localAccess) return null;

  if (loading)
    return (
      <div className={classes.spinnerContainer}>
        <CircularProgress
          size={20}
          className={bem("spinner")}
          color="primary"
        />
      </div>
    );

  if (profileError && localProfileError) {
    const message = "Unable to load this profile";
    return (
      <div className={bem("alert-container")}>
        <Alert
          classes={{
            root: classes.alertBox,
            message: classes.alertMessage,
            action: classes.action,
            icon: classes.icon,
          }}
          severity="warning"
          action={
            // eslint-disable-next-line react/jsx-wrap-multilines
            isLoadingProfile ? (
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
                  setIsLoadingProfile(true);
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
        <AgentProfileDetails
          resourceIri={resourceIri}
          permission={permission}
          setLoading={setLoading}
          setLocalAccess={setLocalAccess}
          mutatePermissions={mutatePermissions}
        />
      </div>
    );
  }

  if (!localProfile) {
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

  return (
    <AgentProfileDetails
      resourceIri={resourceIri}
      permission={permission}
      setLoading={setLoading}
      setLocalAccess={setLocalAccess}
      mutatePermissions={mutatePermissions}
    />
  );
}

AgentAccess.propTypes = {
  permission: T.object.isRequired,
  mutatePermissions: T.func,
};

AgentAccess.defaultProps = {
  mutatePermissions: () => {},
};
