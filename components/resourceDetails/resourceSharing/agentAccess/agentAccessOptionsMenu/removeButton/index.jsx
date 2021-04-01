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
import PropTypes from "prop-types";
import { createStyles, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { getResourceName } from "../../../../../../src/solidClientHelpers/resource";
import AccessControlContext from "../../../../../../src/contexts/accessControlContext";
import ConfirmationDialogContext from "../../../../../../src/contexts/confirmationDialogContext";
import styles from "./styles";
import { PUBLIC_AGENT_PREDICATE } from "../../../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../../../src/models/contact/authenticated";

export const handleConfirmation = ({
  open,
  dialogId,
  bypassDialog,
  setConfirmationSetup,
  setOpen,
  setConfirmed,
  handleRemoveAgent,
  setConfirmText,
}) => {
  return (webId, alias, confirmationSetup, confirmed) => {
    setConfirmationSetup(true);
    if (bypassDialog) {
      setConfirmed(true);
      handleRemoveAgent(webId, alias);
    }
    if (open !== dialogId) return;
    if (confirmationSetup && confirmed === null) return;

    if (confirmationSetup && confirmed) {
      handleRemoveAgent(webId, alias);
    }

    if (confirmationSetup && confirmed !== null) {
      setConfirmed(null);
      setOpen(null);
      setConfirmationSetup(false);
    }
    setConfirmText(null);
  };
};

export const handleRemovePermissions = ({
  setLoading,
  accessControl,
  mutatePermissions,
  setLocalAccess,
}) => {
  return async (agentWebId, policyName) => {
    setLoading(true);
    if (PUBLIC_AGENT_PREDICATE === agentWebId) {
      accessControl.setRulePublic(policyName, false);
    }
    if (AUTHENTICATED_AGENT_PREDICATE === agentWebId) {
      accessControl.setRuleAuthenticated(policyName, false);
    }
    await accessControl.removeAgentFromNamedPolicy(agentWebId, policyName);
    setLoading(false);
    await mutatePermissions();
    setLocalAccess(null);
  };
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_REMOVE_BUTTON = "remove-button";

export default function RemoveButton({
  resourceIri,
  permission: { webId, alias },
  profile,
  setLoading,
  setLocalAccess,
  mutatePermissions,
}) {
  const { accessControl } = useContext(AccessControlContext);
  const resourceName = getResourceName(resourceIri);
  const classes = useStyles();
  const dialogId = "remove-agent";
  const [bypassDialog, setBypassDialog] = useState(false);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const handleRemoveAgent = handleRemovePermissions({
    setLoading,
    accessControl,
    mutatePermissions,
    setLocalAccess,
  });

  const {
    confirmed,
    open,
    setConfirmed,
    setOpen,
    title,
    setTitle,
    setConfirmText,
  } = useContext(ConfirmationDialogContext);

  const handleOpenDialog = () => {
    setConfirmText("Remove");
    // eslint-disable-next-line prettier/prettier
    if (
      PUBLIC_AGENT_PREDICATE === webId ||
      AUTHENTICATED_AGENT_PREDICATE === webId
    ) {
      setBypassDialog(true);
    }
    const text = `Remove ${
      profile?.name || webId
    }'s access from ${resourceName}`;
    setTitle(text);
    setOpen(dialogId);
  };

  const onConfirmation = handleConfirmation({
    open,
    dialogId,
    bypassDialog,
    confirmationSetup,
    confirmed,
    setConfirmationSetup,
    setOpen,
    setConfirmed,
    handleRemoveAgent,
    setConfirmText,
  });

  useEffect(() => {
    onConfirmation(webId, alias, confirmationSetup, confirmed);
  }, [confirmationSetup, confirmed, onConfirmation, title, webId, alias]);

  return (
    <ListItem
      data-testid={TESTCAFE_ID_REMOVE_BUTTON}
      button
      onClick={handleOpenDialog}
    >
      <ListItemText
        disableTypography
        classes={{ primary: classes.listItemText }}
      >
        Remove
      </ListItemText>
    </ListItem>
  );
}

RemoveButton.propTypes = {
  resourceIri: PropTypes.string.isRequired,
  permission: PropTypes.shape({
    type: PropTypes.string,
    acl: PropTypes.shape({
      read: PropTypes.bool,
      write: PropTypes.bool,
      append: PropTypes.bool,
      control: PropTypes.bool,
    }),
    webId: PropTypes.string.isRequired,
    alias: PropTypes.string,
  }).isRequired,
  profile: PropTypes.shape({
    avatar: PropTypes.string,
    name: PropTypes.string,
    nickname: PropTypes.string,
    webId: PropTypes.string,
    types: PropTypes.arrayOf(PropTypes.string),
  }),
  setLoading: PropTypes.func,
  setLocalAccess: PropTypes.func,
  mutatePermissions: PropTypes.func,
};

RemoveButton.defaultProps = {
  setLoading: () => {},
  setLocalAccess: () => {},
  profile: null,
  mutatePermissions: () => {},
};
