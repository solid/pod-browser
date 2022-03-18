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
import clsx from "clsx";
import T from "prop-types";
import { getResourceInfo } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Button } from "@inrupt/prism-react-components";
import { getPolicyDetailFromAccess } from "../../../../../src/accessControl/acp";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import styles from "./styles";
import AlertContext from "../../../../../src/contexts/alertContext";
import ConfirmationDialogContext from "../../../../../src/contexts/confirmationDialogContext";
import useAgentProfile from "../../../../../src/hooks/useAgentProfile";
import { isHTTPError } from "../../../../../src/error";
import { getAccessControl } from "../../../../../src/accessControl";
import usePodRootUri from "../../../../../src/hooks/usePodRootUri";
import { getPoliciesContainerUrl } from "../../../../../src/models/policy";

export const TESTCAFE_ID_ACCESS_DETAILS_REMOVE_BUTTON =
  "access-details-remove-button";

export const TESTCAFE_ID_REVOKE_ACCESS_BUTTON = "revoke-access-button";

export const REMOVE_ACCESS_CONFIRMATION_DIALOG =
  "remove-access-confirmation-dialog";

export const SINGLE_ACCESS_MESSAGE = "Revoke Access";
export const ALL_ACCESS_MESSAGE = "Revoke All Access";
export const ACCESS_TO_POD_MESSAGE = "anything in your Pod.";

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

export const handleRemoveAccess = ({
  resources,
  policiesContainer,
  accessList,
  agentWebId,
  setShouldUpdate,
  alertError,
  alertSuccess,
  onClose,
  fetch,
}) => {
  return () => {
    if (!resources) return;
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
    resources.map(async (url) => {
      const resource = await getResourceInfo(url, { fetch });
      const accessControl = await getAccessControl(
        resource,
        policiesContainer,
        fetch
      );
      policyNames.map(async (policy) => {
        try {
          await accessControl.removeAgentFromPolicy(agentWebId, policy);
          setShouldUpdate(true);
        } catch (e) {
          if (!isHTTPError(e, 404)) {
            alertError(e.toString());
          }
        } finally {
          alertSuccess(`${agentWebId}'s access succesfully revoked`);
          onClose();
        }
      });
    });
  };
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function RevokeAccessButton({
  variant,
  resources,
  onClose,
  accessList,
  setShouldUpdate,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  const { alertError, alertSuccess } = useContext(AlertContext);
  const [agentWebId, setAgentWebId] = useState(
    accessList && accessList[0]?.agent
  );
  const { session } = useSession();
  const { fetch } = session;
  const { data: agentProfile } = useAgentProfile(agentWebId);
  const agentName = agentProfile?.name || agentWebId;
  const {
    confirmed,
    openConfirmationDialog,
    setContent,
    setOpen,
    setTitle,
    closeDialog,
    setConfirmText,
    setIsDangerousAction,
  } = useContext(ConfirmationDialogContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const podRoot = usePodRootUri(session.info.webId);
  const policiesContainer = podRoot && getPoliciesContainerUrl(podRoot);
  const resourceName =
    resources.length === 1
      ? getResourceName(resources[0])
      : ACCESS_TO_POD_MESSAGE;

  const removeAccess = handleRemoveAccess({
    resources,
    policiesContainer,
    accessList,
    agentWebId,
    setShouldUpdate,
    alertError,
    alertSuccess,
    onClose,
    fetch,
  });

  useEffect(() => {
    if (!accessList || !accessList.length) return;
    setAgentWebId(accessList[0]?.agent);
  }, [accessList]);

  const handleConfirmation = () => {
    setConfirmationSetup(true);
    setOpen(REMOVE_ACCESS_CONFIRMATION_DIALOG);
    setIsDangerousAction(true);
    setTitle(
      resources.length === 1
        ? `Revoke access to ${resourceName}?`
        : `Revoke access from ${agentName}?`
    );
    setConfirmText(
      resources.length === 1 ? SINGLE_ACCESS_MESSAGE : ALL_ACCESS_MESSAGE
    );
    setContent(`${agentName} will not be able to access ${resourceName}`);
  };

  useEffect(() => {
    if (
      confirmationSetup &&
      confirmed === null &&
      openConfirmationDialog === REMOVE_ACCESS_CONFIRMATION_DIALOG
    )
      return;

    if (
      confirmationSetup &&
      confirmed &&
      openConfirmationDialog === REMOVE_ACCESS_CONFIRMATION_DIALOG
    ) {
      removeAccess();
    }

    if (confirmed !== null) {
      closeDialog();
      setConfirmationSetup(false);
    }
  }, [
    confirmationSetup,
    confirmed,
    closeDialog,
    openConfirmationDialog,
    removeAccess,
  ]);

  if (variant === "in-menu") {
    return (
      <Button
        type="button"
        variant={variant}
        className={clsx(bem(`revoke-button`))}
        data-testid={TESTCAFE_ID_ACCESS_DETAILS_REMOVE_BUTTON}
        onClick={handleConfirmation}
      >
        Revoke access
      </Button>
    );
  }
  return (
    <button
      type="button"
      className={bem("revoke-button")}
      data-testid={TESTCAFE_ID_REVOKE_ACCESS_BUTTON}
      onClick={handleConfirmation}
    >
      {resources.length > 1
        ? ALL_ACCESS_MESSAGE
        : `Remove Access to ${resourceName}?`}
    </button>
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
  resources: T.arrayOf(T.string).isRequired,
  variant: T.string,
  setShouldUpdate: T.func,
};

RevokeAccessButton.defaultProps = {
  accessList: [],
  variant: null,
  setShouldUpdate: () => {},
};
