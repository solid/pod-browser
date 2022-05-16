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

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { Button, CircularProgress, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import { Alert, Skeleton } from "@material-ui/lab";
import styles from "./styles";
import { getProfile } from "../../../../src/models/profile";
import AgentProfileDetails from "./agentProfileDetails";
import {
  PUBLIC_AGENT_NAME,
  PUBLIC_AGENT_PREDICATE,
} from "../../../../src/models/contact/public";
import {
  AUTHENTICATED_AGENT_NAME,
  AUTHENTICATED_AGENT_PREDICATE,
} from "../../../../src/models/contact/authenticated";
import { permission } from "../../../../constants/propTypes";
import useFullProfile from "../../../../src/hooks/useFullProfile";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_TRY_AGAIN_BUTTON = "try-again-button";
export const TESTCAFE_ID_TRY_AGAIN_SPINNER = "try-again-spinner";
export const TESTCAFE_ID_SKELETON_PLACEHOLDER = "skeleton-placeholder";
export const PROFILE_ERROR_MESSAGE = "Unable to load this profile";

export default function AgentAccess({
  permission,
  setLoadingTable,
  mutateAccessGrantBasedPermissions,
}) {
  const classes = useStyles();
  const bem = useBem(useStyles());
  const { solidDataset: dataset } = useContext(DatasetContext);
  const { webId, acl } = permission;
  const profile = useFullProfile(webId);
  const [localProfile, setLocalProfile] = useState(profile);
  const [loading, setLoading] = useState(false);
  const resourceIri = getSourceUrl(dataset);
  const [localAccess, setLocalAccess] = useState(acl);

  useEffect(() => {
    if (webId === PUBLIC_AGENT_PREDICATE) {
      setLocalProfile({ names: [PUBLIC_AGENT_NAME] });
    }
    if (webId === AUTHENTICATED_AGENT_PREDICATE) {
      setLocalProfile({ names: [AUTHENTICATED_AGENT_NAME] });
    }
  }, [webId]);

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

  return (
    <AgentProfileDetails
      resourceIri={resourceIri}
      permission={permission}
      profile={localProfile}
      setLoading={setLoading}
      setLocalAccess={setLocalAccess}
      mutateAccessGrantBasedPermissions={mutateAccessGrantBasedPermissions}
      setLoadingTable={setLoadingTable}
    />
  );
}

AgentAccess.propTypes = {
  permission: permission.isRequired,
  setLoadingTable: T.func,
  mutateAccessGrantBasedPermissions: T.func,
};

AgentAccess.defaultProps = {
  setLoadingTable: () => {},
  mutateAccessGrantBasedPermissions: () => {},
};
