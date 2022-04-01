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

import React, { useContext, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { PropTypes } from "prop-types";
import {
  Avatar,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { useSession } from "@inrupt/solid-ui-react";
import { stringToColor } from "../../../../../src/stringHelpers";
import {
  PUBLIC_AGENT_NAME,
  PUBLIC_AGENT_PREDICATE,
} from "../../../../../src/models/contact/public";
import {
  AUTHENTICATED_AGENT_NAME,
  AUTHENTICATED_AGENT_PREDICATE,
} from "../../../../../src/models/contact/authenticated";
import ConsentDetailsModal from "../../agentAccess/agentAccessOptionsMenu/consentDetailsButton/consentDetailsModal";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import AlertContext from "../../../../../src/contexts/alertContext";
import ConfirmationDialogNew from "../../../../confirmationDialogNew";
import styles from "./styles";
import { useAllPermissions } from "../../../../../src/hooks/useAllPermissions";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";
export const TESTCAFE_ID_REMOVE_BUTTON = "remove-button";
export const CONFIRMATION_DIALOG_ID = "remove-agent";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function AgentPermissionSearch() {
  // add search functionality
  return <input name="search" type="search" />;
}

export function AgentPermissionsList({ permissions, resourceIri }) {
  const classes = useStyles();
  // need to add where if it's more than three you get cut off and there's a link from AgentAccessTable
  let id = 0;

  return (
    <ul className={classes.agentPermissionsList}>
      {permissions.map((p) => {
        id += 1;
        return (
          <AgentPermissionItem
            key={id}
            webId={p.webId}
            resourceIri={resourceIri}
            permissionType={p.alias}
            agentAccess={p.permissions}
          />
        );
      })}
    </ul>
  );
}

AgentPermissionsList.propTypes = {
  permissions: PropTypes.arrayOf(PropTypes.object).isRequired,
  resourceIri: PropTypes.string.isRequired,
};

function AgentPermissionItem({
  webId,
  resourceIri,
  permissionType,
  agentAccess,
}) {
  const classes = useStyles();
  // const { agent: webId } = agentInfo; // we no longer grab inherited. Is that a problem?
  const viewer = permissionType === "viewer"; // maybe unnecessary
  const resourceName = getResourceName(resourceIri);
  const [openModal, setOpenModal] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const { session } = useSession();
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const { setAgentPermissions } = useAllPermissions();

  const handleClosePopoverAndModal = () => {
    setPopoverAnchorEl(null);
    setOpenModal(false);
  };
  // debugger;

  let name = "";
  let anotherNameThatNeedsToBeUpdated = "";
  let publicResource = false;
  if (webId === PUBLIC_AGENT_PREDICATE) {
    // ask kyra why
    name = PUBLIC_AGENT_NAME;
    anotherNameThatNeedsToBeUpdated = "Anyone";
    publicResource = true;
  }
  if (webId === AUTHENTICATED_AGENT_PREDICATE) {
    name = AUTHENTICATED_AGENT_NAME;
    anotherNameThatNeedsToBeUpdated = "Anyone signed in";
    publicResource = true;
  }

  const handleOpenPopover = (event) => setPopoverAnchorEl(event.currentTarget);

  const removePermissions = (agentWebId) => {
    const removePermissionsAccessObject = {
      append: false,
      controlRead: false,
      controlWrite: false,
      read: false,
      write: false,
    };

    if (PUBLIC_AGENT_PREDICATE === agentWebId) {
      // confirm this function is what we want to be calling
      // setPublicPermissions(
      //   resourceIri,
      //   removePermissionsAccessObject,
      //   session.fetch
      // );
      return;
    }
    if (AUTHENTICATED_AGENT_PREDICATE === agentWebId) {
      // accessControl.setRuleAuthenticated(permissionType, false);
      return;
    }

    setAgentPermissions(
      resourceIri,
      agentWebId,
      removePermissionsAccessObject,
      session.fetch
    );
  };

  const handleConfirmRemove = () => {
    removePermissions(webId);
    setOpenConfirmationDialog(false);
    handleClosePopoverAndModal();
  };

  const handleOpenConfirmationDialog = () => {
    // if it's a public resource remove immediately, if it's not ask user for confirmation
    if (publicResource) {
      handleConfirmRemove();
    } else {
      setOpenConfirmationDialog(true);
    }
  };

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
      {/* {!inherited && ( */}
      <>
        <Button onClick={handleOpenPopover} variant="contained">
          <MoreVertIcon />
        </Button>
        <PermissionsPopoverMenu
          name={name}
          webId={webId}
          viewer={viewer}
          popoverAnchorEl={popoverAnchorEl}
          handleClosePopoverAndModal={handleClosePopoverAndModal}
          handleOpenConfirmationDialog={handleOpenConfirmationDialog}
          setOpenModal={setOpenModal}
          resourceIri={resourceIri}
        />
        <ConfirmationDialogNew
          openConfirmationDialog={openConfirmationDialog}
          title={`Remove ${webId}'s access from ${resourceName}`}
          confirmText="Remove"
          onConfirm={handleConfirmRemove}
          onCancel={() => {
            setOpenConfirmationDialog(false);
            setPopoverAnchorEl(null);
          }}
        />
      </>
      {/* )} */}
      {viewer && (
        <ConsentDetailsModal
          openModal={openModal}
          resourceIri={resourceIri}
          agentAccess={agentAccess}
          vc={viewer}
          handleCloseModal={handleClosePopoverAndModal}
          setOpenModal={setOpenModal}
        />
      )}
    </li>
  );
}

AgentPermissionItem.propTypes = {
  resourceIri: PropTypes.string.isRequired,
  webId: PropTypes.string.isRequired,
  permissionType: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  agentAccess: PropTypes.object.isRequired,
};

function PermissionsPopoverMenu({
  setOpenModal,
  popoverAnchorEl,
  handleClosePopoverAndModal,
  handleOpenConfirmationDialog,
  resourceIri,
  viewer,
  webId,
}) {
  const classes = useStyles();
  const popoverOpen = Boolean(popoverAnchorEl);
  const id = popoverOpen ? "agent-access-options-menu" : undefined;

  return (
    <Popover
      id={id}
      open={popoverOpen}
      anchorEl={popoverAnchorEl}
      onClose={handleClosePopoverAndModal}
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
        {viewer ? (
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
          <ListItem
            data-testid={TESTCAFE_ID_REMOVE_BUTTON}
            button
            onClick={handleOpenConfirmationDialog}
          >
            <ListItemText
              disableTypography
              classes={{ primary: classes.listItemText }}
            >
              Remove
            </ListItemText>
          </ListItem>
        )}
      </List>
    </Popover>
  );
}

PermissionsPopoverMenu.propTypes = {
  // name: PropTypes.string.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  // eslint-disable-next-line
  popoverAnchorEl: PropTypes.object, // keep this eslint above because it can be null and is required , don't force a default of null
  handleClosePopoverAndModal: PropTypes.func.isRequired,
  handleOpenConfirmationDialog: PropTypes.func.isRequired,
};
