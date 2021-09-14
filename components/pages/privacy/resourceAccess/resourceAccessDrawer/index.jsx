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

/* eslint-disable react/jsx-one-expression-per-line */

import React, { useContext, useEffect, useState } from "react";
import T from "prop-types";
import { Drawer, Icons } from "@inrupt/prism-react-components";
import {
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  getAcpAccessDetails,
  getPolicyDetailFromAccess,
} from "../../../../../src/accessControl/acp";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import styles from "./styles";
import { isContainerIri } from "../../../../../src/solidClientHelpers/utils";
import { getParentContainerUrl } from "../../../../../src/stringHelpers";
import useAccessControl from "../../../../../src/hooks/useAccessControl";
import useResourceInfo from "../../../../../src/hooks/useResourceInfo";
import AlertContext from "../../../../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../../../../src/contexts/confirmationDialogContext";
import useAgentProfile from "../../../../../src/hooks/useAgentProfile";
import ConfirmationDialog from "../../../../confirmationDialog";
import Spinner from "../../../../spinner";

export const TESTCAFE_ID_ACCESS_DETAILS_REMOVE_BUTTON =
  "access-details-remove-button";

export const REMOVE_ACCESS_CONFIRMATION_DIALOG =
  "remove-access-confirmation-dialog";

export const getAllowModes = (accessList) => {
  if (!accessList) return null;
  const accessModes = [
    ...new Set(
      [
        ...accessList.map(({ allow }) => {
          return allow.map((mode) => mode);
        }),
      ].reduce((acc, modes) => [...acc, ...modes], [])
    ),
  ];
  return accessModes;
};

const handleRemoveAccess = ({
  accessList,
  accessControl,
  agentWebId,
  setShouldUpdate,
  setSeverity,
  setMessage,
  setAlertOpen,
  onClose,
}) => {
  return () => {
    const acpMaps = accessList?.map(({ allow }) => {
      return {
        read: !!allow.includes("http://www.w3.org/ns/solid/acp#Read"),
        write: !!allow.includes("http://www.w3.org/ns/solid/acp#Write"),
        append: !!allow.includes("http://www.w3.org/ns/solid/acp#Append"),
        control: !!allow.includes("http://www.w3.org/ns/solid/acp#Control"),
      };
    });
    const policyNames = acpMaps.map((acpMap) =>
      getPolicyDetailFromAccess(acpMap, "name")
    );
    policyNames.map(async (policy) => {
      try {
        await accessControl.removeAgentFromPolicy(agentWebId, policy);
        setShouldUpdate(true);
        setSeverity("success");
        setMessage(`${agentWebId}'s access succesfully revoked`);
      } catch (e) {
        setSeverity("error");
        setMessage(e.toString());
        setAlertOpen(true);
      } finally {
        onClose();
      }
    });
  };
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ResourceAccessDrawer({
  open,
  onClose,
  accessList,
  resourceIri,
  podRoot,
  setShouldUpdate,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  const { data: resourceInfo } = useResourceInfo(resourceIri, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const { accessControl, accessControlError } = useAccessControl(resourceInfo);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const resourceName = resourceIri && getResourceName(resourceIri);
  const resourcePath =
    resourceIri && getParentContainerUrl(resourceIri)?.replace(podRoot, "");
  const [agentWebId, setAgentWebId] = useState(
    accessList && accessList[0]?.agent
  );
  const { data: agentProfile } = useAgentProfile(agentWebId);
  const agentName = agentProfile?.name || agentWebId;
  const {
    confirmed,
    open: dialogOpen,
    setContent,
    setOpen,
    setTitle,
    closeDialog,
    setConfirmText,
    setIsDangerousAction,
  } = useContext(ConfirmationDialogContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const allowModes = getAllowModes(accessList);
  const modes = allowModes?.map((mode) => {
    return {
      read: !!mode.includes("Read"),
      write: !!mode.includes("Write"),
      append: !!mode.includes("Append"),
      control: !!mode.includes("Control"),
    };
  });

  const removeAccess = handleRemoveAccess({
    accessList,
    accessControl,
    agentWebId,
    setShouldUpdate,
    setSeverity,
    setMessage,
    setAlertOpen,
    onClose,
  });

  useEffect(() => {
    if (!accessList || !accessList.length) return;
    setAgentWebId(accessList[0]?.agent);
  }, [accessList]);

  const handleConfirmation = () => {
    setConfirmationSetup(true);
    setOpen(REMOVE_ACCESS_CONFIRMATION_DIALOG);
    setIsDangerousAction(true);
    setTitle(`Revoke access to ${resourceName}`);
    setConfirmText("Revoke Access");
    setContent(`${agentName} will not be able to access ${resourceName}`);
  };

  const accessDetails = modes?.map((mode) => {
    return getAcpAccessDetails(mode);
  });
  const order = ["View", "Edit", "Add", "Share", "View Sharing"];
  const sortedAccessDetails = accessDetails?.sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  useEffect(() => {
    if (
      confirmationSetup &&
      confirmed === null &&
      dialogOpen === REMOVE_ACCESS_CONFIRMATION_DIALOG
    )
      return;

    if (
      confirmationSetup &&
      confirmed &&
      dialogOpen === REMOVE_ACCESS_CONFIRMATION_DIALOG
    ) {
      removeAccess();
    }

    if (confirmed !== null) {
      closeDialog();
      setConfirmationSetup(false);
    }
  }, [confirmationSetup, confirmed, closeDialog, dialogOpen, removeAccess]);

  return (
    <Drawer anchor="top" open={open} close={onClose}>
      {!accessControl && !accessControlError && <Spinner />}
      {accessControl && (
        <div className={bem("access-details", "wrapper")}>
          <span className={bem("access-details", "title")}>
            <span className={bem("access-details", "resource-info")}>
              <p>{resourcePath}</p>
              <h2>
                {" "}
                <Icons
                  name={
                    resourceIri && isContainerIri(resourceIri)
                      ? "folder"
                      : "file"
                  }
                  className={bem("access-details", "icon")}
                />
                {resourceName}
              </h2>
            </span>
          </span>
          <section className={bem("access-details", "section")}>
            <h3 className={bem("access-details", "section-header")}>Access</h3>
            <hr className={bem("access-details", "separator")} />
            <List>
              {sortedAccessDetails?.map(({ name, icon, description }) => {
                return (
                  <ListItem key={name}>
                    <ListItemIcon classes={{ root: classes.listItemIcon }}>
                      <Icons
                        name={icon}
                        className={bem("access-details", "section-icon")}
                      />
                    </ListItemIcon>
                    <ListItemText
                      classes={{
                        root: classes.listItemText,
                        primary: classes.listItemTitleText,
                        secondary: classes.listItemSecondaryText,
                      }}
                      key={name}
                      primary={name}
                      secondary={description}
                    />
                  </ListItem>
                );
              })}
            </List>
          </section>
          <button
            className={bem("access-details", "remove-access-button")}
            type="button"
            onClick={handleConfirmation}
            data-testid={TESTCAFE_ID_ACCESS_DETAILS_REMOVE_BUTTON}
          >
            Remove Access to {resourceName}
          </button>
          <ConfirmationDialog />
        </div>
      )}
    </Drawer>
  );
}

ResourceAccessDrawer.propTypes = {
  open: T.bool.isRequired,
  accessList: T.arrayOf(
    T.shape({
      agent: T.string,
      allow: T.arrayOf(T.string),
      deny: T.arrayOf(T.string),
      resource: T.string,
    })
  ),
  onClose: T.func.isRequired,
  resourceIri: T.string,
  podRoot: T.string,
  setShouldUpdate: T.func,
};

ResourceAccessDrawer.defaultProps = {
  accessList: [],
  resourceIri: null,
  podRoot: null,
  setShouldUpdate: () => {},
};
