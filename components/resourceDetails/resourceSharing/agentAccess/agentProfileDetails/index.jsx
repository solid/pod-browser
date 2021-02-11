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

import React from "react";
import T from "prop-types";
import { Avatar, createStyles, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import styles from "./styles";
import { displayProfileName } from "../../../../../src/solidClientHelpers/profile";

import AgentAccessOptionsMenu from "../agentAccessOptionsMenu";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_AGENT_WEB_ID = "agent-web-id";

export default function AgentProfileDetails({
  resourceIri,
  permission,
  setLoading,
  setLocalAccess,
  mutatePermissions,
}) {
  const classes = useStyles();
  const { webId, profile } = permission;

  return (
    <div className={classes.nameAndAvatarContainer}>
      <Avatar
        className={classes.avatar}
        alt={webId}
        src={profile ? profile.avatar : null}
      />
      <Typography
        classes={{ body1: classes.detailText }}
        data-testid={TESTCAFE_ID_AGENT_WEB_ID}
        className={classes.detailText}
      >
        {profile ? displayProfileName(profile) : webId}
      </Typography>
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        permission={permission}
        setLoading={setLoading}
        setLocalAccess={setLocalAccess}
        mutatePermissions={mutatePermissions}
      />
    </div>
  );
}
AgentProfileDetails.propTypes = {
  resourceIri: T.string.isRequired,
  permission: T.shape().isRequired,
  setLoading: T.func,
  setLocalAccess: T.func,
  mutatePermissions: T.func,
};

AgentProfileDetails.defaultProps = {
  setLoading: () => {},
  setLocalAccess: () => {},
  mutatePermissions: () => {},
};
