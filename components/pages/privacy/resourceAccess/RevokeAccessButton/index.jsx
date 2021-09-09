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
import { createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Button } from "@inrupt/prism-react-components";
import { getPolicyDetailFromAccess } from "../../../../../src/accessControl/acp";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import styles from "./styles";
import useAccessControl from "../../../../../src/hooks/useAccessControl";
import useResourceInfo from "../../../../../src/hooks/useResourceInfo";
import AlertContext from "../../../../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../../../../src/contexts/confirmationDialogContext";
import useAgentProfile from "../../../../../src/hooks/useAgentProfile";

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

export default function RevokeAccessButton({
  variant,
  onClose,
  accessList,
  resourceIri,
  setShouldUpdate,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  const { data: resourceInfo } = useResourceInfo(resourceIri, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const { accessControl } = useAccessControl(resourceInfo);
  const { setMessage, setSeverity, setAlertOpen } = useContext(AlertContext);
  const resourceName = resourceIri && getResourceName(resourceIri);
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
    <Button
      variant={variant}
      className={bem("revoke-button")}
      data-testid={TESTCAFE_ID_ACCESS_DETAILS_REMOVE_BUTTON}
      onClick={() => handleConfirmation()}
    >
      Revoke Access
    </Button>
  );
}

RevokeAccessButton.propTypes = {
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
  variant: T.string,
  setShouldUpdate: T.func,
};

RevokeAccessButton.defaultProps = {
  accessList: [],
  resourceIri: null,
  variant: null,
  setShouldUpdate: () => {},
};
