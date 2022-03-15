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

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-one-expression-per-line */

import React, { useContext, useEffect, useMemo, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import { Card, Avatar, Typography } from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Skeleton from "@material-ui/lab/Skeleton";
import { Button } from "@inrupt/prism-react-components";
import PolicyHeader from "../policyHeader";
import AddAgentButton from "../addAgentButton";
import { isCustomPolicy } from "../../../../src/models/policy";
import { stringToColor } from "../../../../src/stringHelpers";
import AgentPickerModal from "../agentPickerModal";
import styles from "./styles";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function AgentPermissionSearch() {
  return <input name="search" type="search" />;
}

function AgentPermissionsList({ permissions }) {
  const classes = useStyles();

  return (
    <ul className={classes.agentPermissionsList}>
      {permissions.map((p) => (
        <AgentPermissionItem {...p} />
      ))}
    </ul>
  );
}

AgentPermissionsList.propTypes = {
  permissions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function AgentPermissionItem({ webId }) {
  const classes = useStyles();

  return (
    <li className={classes.agentPermissionItem}>
      <Avatar
        className={classes.agentPermissionAvatar}
        style={{ background: stringToColor(webId) }}
      >
        <AccountCircleIcon />
      </Avatar>
      <Typography noWrap title={webId}>
        {webId}
      </Typography>
      <Button onClick={() => {}} variant="in-menu">
        <MoreVertIcon />
      </Button>
    </li>
  );
}

AgentPermissionItem.propTypes = {
  webId: PropTypes.string.isRequired,
};

function renderCardBody(permissions) {
  if (!permissions.length) return <Skeleton />;

  return (
    <>
      <AgentPermissionSearch />
      <AgentPermissionsList permissions={permissions} />
    </>
  );
}

function AgentPermissionListSkeleton() {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </Card>
  );
}

export default function PermissionsPanel({ type, permissions }) {
  const classes = useStyles();
  const editButtonText = type === "editors" ? "Editors" : "Viewers";

  if (!permissions.length) return <AgentPermissionListSkeleton />;

  return (
    <>
      <Card className={classes.card}>
        <PolicyHeader type={type} pluralTitle>
          <Button variant="text" onClick={() => {}} iconBefore="edit">
            {editButtonText}
          </Button>
          <Button type="button" variant="in-menu">
            <MoreVertIcon />
          </Button>
        </PolicyHeader>
        {renderCardBody(permissions, classes)}
      </Card>
    </>
  );
}

PermissionsPanel.propTypes = {
  type: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.object),
};

PermissionsPanel.defaultProps = {
  permissions: [],
};
