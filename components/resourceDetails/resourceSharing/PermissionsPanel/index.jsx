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

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import ConfirmationDialog from "../../../confirmationDialog";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import { getResourceName } from "../../../../src/solidClientHelpers/resource";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import ResourceInfoContext from "../../../../src/contexts/resourceInfoContext";
import AlertContext from "../../../../src/contexts/alertContext";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";
export const TESTCAFE_ID_REMOVE_BUTTON = "remove-button";
export const CONFIRMATION_DIALOG_ID = "remove-agent";
const useStyles = makeStyles((theme) => createStyles(styles(theme)));
// handle loading states generally
// handle empty states? search for "Person" ? in agentaccess table
function AgentPermissionSearch() {
  // add search functionality
  return <input name="search" type="search" />;
}

function AgentPermissionsList({ permissions, resourceIri }) {
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
            permission={p}
            resourceIri={resourceIri}
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

function AgentPermissionItem({ permission, resourceIri }) {
  const classes = useStyles();
  const { webId, inherited, vc, alias } = permission;
  const resourceName = getResourceName(resourceIri);
  const [openModal, setOpenModal] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);

  const handleClosePopoverAndModal = () => {
    setPopoverAnchorEl(null);
    setOpenModal(false);
  };

  let name = "";
  let anotherNameThatNeedsToBeUpdated = "";
  let publicAKB = false;
  if (webId === PUBLIC_AGENT_PREDICATE) {
    // ask kyra why
    name = PUBLIC_AGENT_NAME;
    anotherNameThatNeedsToBeUpdated = "Anyone";
    publicAKB = true;
  }
  if (webId === AUTHENTICATED_AGENT_PREDICATE) {
    name = AUTHENTICATED_AGENT_NAME;
    anotherNameThatNeedsToBeUpdated = "Anyone signed in";
    publicAKB = true;
  }

  const handleOpenPopover = (event) => setPopoverAnchorEl(event.currentTarget);
  const { mutate: mutateResourceInfo } = useContext(ResourceInfoContext);

  const removePermissions = useCallback(async (agentWebId, permissionType) => {
    if (PUBLIC_AGENT_PREDICATE === agentWebId) {
      // accessControl.setRulePublic(permissionType, false);
    }
    if (AUTHENTICATED_AGENT_PREDICATE === agentWebId) {
      // accessControl.setRuleAuthenticated(permissionType, false);
    }
    // can we pull what's in acp directly here and then do try catch here or in hook- move it to a hook
    // const { response: updatedAcr } =
    // await accessControl.removeAgentFromPolicy(agentWebId, permissionType);

    // error handling happening two ways - look at     const { respond, error } = createResponder(); thing and try catch
    // await mutateResourceInfo(updatedAcr, false);
    // setLocalAccess(null); // what is local access?
  }, []);

  const {
    confirmed,
    openConfirmationDialog,
    setConfirmed,
    setOpenConfirmationDialog,
    title,
    setTitle,
    setConfirmText,
    closeDialog,
  } = useContext(ConfirmationDialogContext);

  useEffect(() => {
    console.log("does this re-render");
    // this use effect looks at confirmation dialog and removes agent if user clicked yes
    if (openConfirmationDialog !== CONFIRMATION_DIALOG_ID) return; // because confirmation dialog context is app wide we need to confirm we are dealing with the correct dialog

    // if (confirmationSetup && confirmed === null) return; // what does confirmation setup do?
    if (confirmed) {
      removePermissions(webId, permission.alias);
      closeDialog();
      handleClosePopoverAndModal();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed]);

  const handleOpenConfirmationDialog = () => {
    setConfirmText("Remove");
    if (publicAKB) {
      // what is this actually saying? that we can base the bool off of it. why doesn't it need conf dialog?
      // setBypassDialog(true);
      setConfirmed(true);
      removePermissions();
    }
    const text = `Remove ${webId}'s access from ${resourceName}`;
    setTitle(text);
    setOpenConfirmationDialog("remove-agent");
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
      {!inherited && (
        <>
          <Button onClick={handleOpenPopover} variant="in-menu">
            <MoreVertIcon />
          </Button>
          <PermissionsPopoverMenu
            name={name}
            permission={permission}
            popoverAnchorEl={popoverAnchorEl}
            handleClosePopoverAndModal={handleClosePopoverAndModal}
            handleOpenConfirmationDialog={handleOpenConfirmationDialog}
            setOpenModal={setOpenModal}
            resourceIri={resourceIri}
          />
        </>
      )}
      {/* <AgentProfileDetails />  REFACTOR REMOVE THIS LINE */}
      {vc && ( // confirm that this could also be type=viewer which I think would make more sense
        <ConsentDetailsModal
          openModal={openModal}
          resourceIri={resourceIri}
          permission={permission}
          handleCloseModal={handleClosePopoverAndModal}
          setOpenModal={setOpenModal}
        />
      )}
    </li>
  );
}

AgentPermissionItem.propTypes = {
  // eslint-disable-next-line
  permission: PropTypes.object.isRequired,
  resourceIri: PropTypes.string.isRequired,
};

function PermissionsPopoverMenu({
  name,
  setOpenModal,
  popoverAnchorEl,
  handleClosePopoverAndModal,
  permission,
  handleOpenConfirmationDialog,
  resourceIri,
}) {
  const { vc, type, webId, inherited } = permission;
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
          // <RemoveButton
          //   resourceIri={resourceIri}
          //   permission={permission}
          //   setLoading={() => {}}
          //   setLocalAccess={() => {}}
          //   profile={{}}
          // />
        )}
      </List>
    </Popover>
  );
}

PermissionsPopoverMenu.propTypes = {
  name: PropTypes.string.isRequired,
  setOpenModal: PropTypes.func.isRequired,
  // eslint-disable-next-line
  popoverAnchorEl: PropTypes.object, // keep this eslint above because it can be null and is required , don't force a default of null
  // eslint-disable-next-line
  permission: PropTypes.object, // keep this eslint above because it can be null and is required , don't force a default of null
  handleClosePopoverAndModal: PropTypes.func.isRequired,
  handleOpenConfirmationDialog: PropTypes.func.isRequired,
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

export default function PermissionsPanel({
  permissionType,
  permissions,
  resourceIri,
}) {
  const classes = useStyles();
  const editButtonText = permissionType === "editors" ? "Editors" : "Viewers";

  if (!permissions.length) return <AgentPermissionListSkeleton />; // should be a loading var instead of []
  console.log("permissions panel render", permissionType);
  return (
    <>
      <Card className={classes.card}>
        <PolicyHeader type={permissionType} pluralTitle>
          <Button variant="text" onClick={() => {}} iconBefore="edit">
            {editButtonText}
          </Button>
          <Button type="button" variant="in-menu">
            <MoreVertIcon />
          </Button>
        </PolicyHeader>
        {renderCardBody(permissions, resourceIri, classes)}
        {/* agentpicker is not REFACTOR yet and could cause rerenders */}
        {/* <AgentPickerModal /> */}
        <ConfirmationDialog />
      </Card>
    </>
  );
}

PermissionsPanel.propTypes = {
  permissionType: PropTypes.string.isRequired,
  resourceIri: PropTypes.string.isRequired,
  permissions: PropTypes.arrayOf(PropTypes.object),
};

PermissionsPanel.defaultProps = {
  permissions: [],
};
