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
import {
  Card,
  Avatar,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
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
import AgentProfileDetails from "../agentAccess/agentProfileDetails";
// import { displayProfileName } from "../../../../../src/solidClientHelpers/profile";

import {
  PUBLIC_AGENT_NAME,
  PUBLIC_AGENT_PREDICATE,
} from "../../../../src/models/contact/public";
import {
  AUTHENTICATED_AGENT_NAME,
  AUTHENTICATED_AGENT_PREDICATE,
} from "../../../../src/models/contact/authenticated";
import ConsentDetailsModal from "../agentAccess/agentAccessOptionsMenu/consentDetailsButton/consentDetailsModal";
import RemoveButton from "../agentAccess/agentAccessOptionsMenu/removeButton";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function AgentPermissionSearch() {
  return <input name="search" type="search" />;
}

function AgentPermissionsList({ permissions, resourceIri }) {
  console.log({ permissions, resourceIri });
  // const { permissions, resourceIri } = props;
  const classes = useStyles();
  console.log("permissions list render");

  return (
    <ul className={classes.agentPermissionsList}>
      {permissions.map((p) => (
        <AgentPermissionItem permission={p} resourceIri={resourceIri} />
      ))}
    </ul>
  );
}

AgentPermissionsList.propTypes = {
  permissions: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/require-default-props
  resourceIri: PropTypes.string,
};

function AgentPermissionItem({ permission, resourceIri }) {
  const classes = useStyles();
  const { webId, inherited, type, vc } = permission;
  const [openModal, setOpenModal] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  let name = "";
  if (webId === PUBLIC_AGENT_PREDICATE) name = PUBLIC_AGENT_NAME;
  if (webId === AUTHENTICATED_AGENT_PREDICATE) name = AUTHENTICATED_AGENT_NAME;
  let anotherNameThatNeedsToBeUpdated = "";
  if (webId === PUBLIC_AGENT_PREDICATE)
    anotherNameThatNeedsToBeUpdated = "Anyone";
  if (webId === AUTHENTICATED_AGENT_PREDICATE)
    anotherNameThatNeedsToBeUpdated = "Anyone signed in";

  console.log("permissions item render");
  const handleClick = (event) => setPopoverAnchorEl(event.currentTarget);
  const handleClose = () => {
    setPopoverAnchorEl(null);
    setOpenModal(false);
  };

  const popoverOpen = Boolean(popoverAnchorEl);
  const id = popoverOpen ? "agent-access-options-menu" : undefined;

  return (
    <li className={classes.agentPermissionItem}>
      <Avatar // there is an avatar somewhere that grabs the image from profile
        className={classes.agentPermissionAvatar}
        style={{ background: stringToColor(webId) }}
      >
        <AccountCircleIcon />
      </Avatar>
      <Typography noWrap title={name || webId}>
        {name || webId}
      </Typography>
      {!inherited && (
        <>
          <Button onClick={handleClick} variant="in-menu" aria-describedby={id}>
            <MoreVertIcon />
          </Button>
          <Popover
            id={id}
            open={popoverOpen}
            anchorEl={popoverAnchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <List classes={{ root: classes.listRoot }}>
              <ListItem
                classes={{
                  root: classes.webIdContainerRoot,
                  gutters: classes.webIdContainerGutters,
                }}
              >
                <ListItemText
                  disableTypography
                  classes={{ root: classes.webIdContainer }}
                >
                  <b>WebID: </b>
                  <p className={classes.webId}>{webId}</p>
                </ListItemText>
              </ListItem>
              {vc ? (
                <>
                  <ListItem
                    data-testid={TESTCAFE_ID_VIEW_DETAILS_BUTTON}
                    button
                    onClick={() => setOpenModal(true)}
                  >
                    <ListItemText
                      disableTypography
                      classes={{ primary: classes.listItemText }}
                    >
                      View Details
                    </ListItemText>
                  </ListItem>
                </>
              ) : (
                // <RemoveButton
                //   resourceIri={resourceIri}
                //   profile={profile}
                //   permission={permission}
                //   setLoading={setLoading}
                //   setLocalAccess={setLocalAccess}
                // />
                <></>
              )}
            </List>
          </Popover>
        </>
      )}
      {/* <AgentProfileDetails /> this is replaced! */}
      {vc && (
        <ConsentDetailsModal
          openModal={openModal}
          resourceIri={resourceIri}
          permission={permission}
          handleCloseModal={handleClose}
        />
      )}
    </li>
  );
}

AgentPermissionItem.propTypes = {
  // eslint-disable-next-line
  permission: PropTypes.object.isRequired,
  // eslint-disable-next-line react/require-default-props
  resourceIri: PropTypes.string,
};

function renderCardBody(permissions, resourceIri) {
  if (!permissions.length) return <Skeleton />;

  return (
    <>
      <AgentPermissionSearch />
      <AgentPermissionsList
        permissions={permissions}
        resourceIri={resourceIri}
      />
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

export default function PermissionsPanel({ type, permissions, resourceIri }) {
  const classes = useStyles();
  const editButtonText = type === "editors" ? "Editors" : "Viewers";

  if (!permissions.length) return <AgentPermissionListSkeleton />; // should be a loading var instead of []
  console.log("permissions panel render");
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
        {renderCardBody(permissions, resourceIri, classes)}
        {/* <AgentPickerModal/> */}
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
