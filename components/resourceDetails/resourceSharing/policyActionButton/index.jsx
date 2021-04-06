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

/* eslint react/require-default-props:off */

import React, { useContext, useEffect, useState } from "react";
import { ActionButton, Button } from "@inrupt/prism-react-components";
import T from "prop-types";
import { DatasetContext } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import { getPolicyType, isNamedPolicy } from "../../../../src/models/policy";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import ErrorMessage from "../../../errorMessage";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../src/models/contact/authenticated";
import { PUBLIC_AGENT_PREDICATE } from "../../../../src/models/contact/public";
import { serializePromises } from "../../../../src/solidClientHelpers/utils";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import { getResourceName } from "../../../../src/solidClientHelpers/resource";
import { POLICIES_TYPE_MAP } from "../../../../constants/policies";
import ResourceInfoContext from "../../../../src/contexts/resourceInfoContext";

export const handleConfirmation = ({
  open,
  dialogId,
  setConfirmationSetup,
  setOpen,
  setConfirmed,
  setContent,
  setTitle,
  removeAllAgents,
  webIds,
}) => {
  return (confirmationSetup, confirmed) => {
    setConfirmationSetup(true);
    if (open !== dialogId) return;
    if (confirmationSetup && confirmed === null) return;
    if (confirmationSetup && confirmed) {
      removeAllAgents(webIds);
    }

    if (confirmationSetup && confirmed !== null) {
      setConfirmed(null);
      setOpen(null);
      setConfirmationSetup(false);
      setContent(null);
      setTitle(null);
    }
  };
};

export const TEXT_POLICY_ACTION_BUTTON_DISABLED_REMOVE_BUTTON =
  "There's no one to remove";

export const TESTCAFE_ID_REMOVE_POLICY_BUTTON = "remove-policy-button";

export const handleRemoveAllAgents = ({
  webIds,
  setLoading,
  accessControl,
  policyToDelete,
  mutateResourceInfo,
}) => {
  return async () => {
    if (!policyToDelete) return;
    setLoading(true);
    const removePermissionsPromiseFactories = webIds?.map(
      (agentWebId) => () => {
        if (PUBLIC_AGENT_PREDICATE === agentWebId) {
          return accessControl.setRulePublic(policyToDelete, false);
        }
        if (AUTHENTICATED_AGENT_PREDICATE === agentWebId) {
          return accessControl.setRuleAuthenticated(policyToDelete, false);
        }
        return accessControl.removeAgentFromPolicy(agentWebId, policyToDelete);
      }
    );
    const args = await serializePromises(removePermissionsPromiseFactories);
    const responses = args.filter((res) => typeof res !== "undefined");
    const { response: latestAcr } = responses[responses.length - 1];
    await mutateResourceInfo(latestAcr, false);
    setLoading(false);
  };
};

export default function PolicyActionButton({ permissions, setLoading, type }) {
  const { accessControl } = useContext(AccessControlContext);
  const disableRemoveButton = permissions.length === 0 && isNamedPolicy(type);
  const policyType = getPolicyType(type);
  const dialogId = "remove-policy";
  const [policyToDelete, setPolicyToDelete] = useState();
  const { dataset } = useContext(DatasetContext);
  const resourceIri = getSourceUrl(dataset);
  const resourceName = resourceIri
    ? getResourceName(resourceIri)
    : "this resource";
  const policyTitle = POLICIES_TYPE_MAP[type]?.title;

  const {
    open,
    confirmed,
    setConfirmed,
    setContent,
    setOpen,
    setTitle,
  } = useContext(ConfirmationDialogContext);
  const { mutate: mutateResourceInfo } = useContext(ResourceInfoContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);

  const handleClickOpenDialog = () => {
    setPolicyToDelete(type);
    const confirmationTitle = `Remove ${policyTitle} access from ${resourceName}?`;
    const confirmationContent = `Everyone will be removed from the ${policyTitle} list.`;
    setTitle(confirmationTitle);
    setContent(confirmationContent);
    setOpen(dialogId);
  };

  const webIds = permissions
    .filter(({ alias }) => alias === policyToDelete)
    .map(({ webId }) => webId);

  const removeAllAgents = handleRemoveAllAgents({
    webIds,
    setLoading,
    accessControl,
    policyToDelete,
    mutateResourceInfo,
  });

  const onConfirmation = handleConfirmation({
    open,
    dialogId,
    setConfirmationSetup,
    setOpen,
    setConfirmed,
    setContent,
    setTitle,
    removeAllAgents,
    webIds,
  });

  useEffect(() => {
    onConfirmation(confirmationSetup, confirmed);
  }, [confirmationSetup, confirmed, onConfirmation]);

  if (!policyType)
    return <ErrorMessage error={new Error("Type of policy not recognized")} />;

  return (
    <ActionButton label="Show menu for policy">
      <Button
        data-testid={TESTCAFE_ID_REMOVE_POLICY_BUTTON}
        onClick={handleClickOpenDialog}
        variant="in-menu"
        disabled={disableRemoveButton}
        disabledText={
          disableRemoveButton
            ? TEXT_POLICY_ACTION_BUTTON_DISABLED_REMOVE_BUTTON
            : ""
        }
      >
        {policyType.removeButtonLabel}
      </Button>
    </ActionButton>
  );
}

PolicyActionButton.propTypes = {
  permissions: T.arrayOf(T.object),
  setLoading: T.func,
  type: T.string.isRequired,
};

PolicyActionButton.defaultPtops = {
  permissions: [],
  setLoading: () => {},
};
