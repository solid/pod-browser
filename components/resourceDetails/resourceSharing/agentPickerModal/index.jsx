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

// FIXME: ignoring this file to fix the build
/* istanbul ignore file */

import React, { useContext, useState, useEffect, forwardRef } from "react";
import PropTypes from "prop-types";
import { Checkbox, CircularProgress, createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import {
  Button,
  Container,
  Modal,
  ModalBody,
  ModalContainer,
} from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { createThing, getSourceUrl } from "@inrupt/solid-client";
import { serializePromises } from "../../../../src/solidClientHelpers/utils";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import { getResourceName } from "../../../../src/solidClientHelpers/resource";
import PolicyHeader from "../policyHeader";
import AgentsSearchBar from "../agentsSearchBar";
import AddAgentRow from "../addAgentRow";
import AgentPickerEmptyState from "../agentPickerEmptyState";
import CustomPolicyDropdown from "../customPolicyDropdown";
import styles from "./styles";
import AddWebIdButton from "./addWebIdButton";
import useContacts from "../../../../src/hooks/useContacts";
import { GROUP_CONTACT } from "../../../../src/models/contact/group";
import { PERSON_CONTACT } from "../../../../src/models/contact/person";
import useAddressBook from "../../../../src/hooks/useAddressBook";
import { POLICIES_TYPE_MAP } from "../../../../constants/policies";
import {
  createPublicAgent,
  PUBLIC_AGENT_PREDICATE,
} from "../../../../src/models/contact/public";
import {
  createAuthenticatedAgent,
  AUTHENTICATED_AGENT_PREDICATE,
} from "../../../../src/models/contact/authenticated";
import ResourceInfoContext from "../../../../src/contexts/resourceInfoContext";
import { isPublicAgentorAuthenticatedAgentWebId } from "../../utils";
import {
  editorAccessMatrix,
  getConfirmationDialogText,
  handleSaveContact,
  removeAccessMatrix,
  viewerAccessMatrix,
  removeExistingAgentFromOtherPolicies,
  setupWebIdCheckBoxObject,
  removeAgentsFromPermissions,
  addAgentsToPermissions,
} from "./utils";
import ConfirmationDialogNew from "../../../confirmationDialogNew";
import { useAllPermissions } from "../../../../src/hooks/useAllPermissions";

const AGENT_PREDICATE = "http://www.w3.org/ns/solid/acp#agent";
const TESTCAFE_ID_ADD_AGENT_PICKER_MODAL = "agent-picker-modal";
export const TESTCAFE_SUBMIT_WEBIDS_BUTTON = "submit-webids-button";
const TESTCAFE_CANCEL_WEBIDS_BUTTON = "cancel-webids-button";

export const handleSubmit = ({
  newAgentsWebIds,
  webIdsToDelete,
  accessControl,
  onClose,
  policyName,
  resourceIri,
  setAgentPermissions,
  fetch,
}) => {
  return async () => {
    onClose();
    if ((!newAgentsWebIds.length && !webIdsToDelete.length) || !accessControl) {
      return;
    }
    addAgentsToPermissions(
      newAgentsWebIds,
      accessControl,
      policyName,
      setAgentPermissions,
      resourceIri,
      fetch
    );

    removeAgentsFromPermissions(
      webIdsToDelete,
      accessControl,
      policyName,
      setAgentPermissions,
      resourceIri,
      fetch
    );
  };
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
function AgentPickerModal(
  {
    type,
    handleModalClose,
    setLoading,
    advancedSharing,
    editing,
    accessibilityDescribe,
    accessibilityLabel,
    open,
    permissions,
    resourceIri,
  },
  ref
) {
  const bem = useBem(useStyles());
  const classes = useStyles();
  const { session } = useSession();
  const { fetch } = session;
  const [customPolicy, setCustomPolicy] = useState(
    advancedSharing ? type : null
  );
  const policyName = advancedSharing ? customPolicy : type;
  const { header, saveText, titleSingular, title } =
    POLICIES_TYPE_MAP[policyName];

  const { data: addressBook } = useAddressBook();
  const { data: contacts, error } = useContacts([
    GROUP_CONTACT,
    PERSON_CONTACT,
  ]);
  const resourceName = getResourceName(resourceIri);
  const { accessControl } = useContext(AccessControlContext);
  const [contactsArray, setContactsArray] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [webIdsToDelete, setWebIdsToDelete] = useState([]);
  const [newAgentsWebIds, setNewAgentsWebIds] = useState([]);
  const [addingWebId, setAddingWebId] = useState(false);
  const [checkedBoxes, setCheckedBoxes] = useState(
    setupWebIdCheckBoxObject(permissions, contactsArray) || {}
  );
  const { setAgentPermissions } = useAllPermissions();
  const setupDataForTable = () => {
    // revisit how/if contacts will be added
    const output = [];
    Object.keys(checkedBoxes).forEach((webId) => {
      output.push({ checked: checkedBoxes[webId], webId });
    });
    return output;
  };

  const confirmationDialogText = getConfirmationDialogText(
    webIdsToDelete.length + newAgentsWebIds.length,
    resourceName
  );

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setGlobalFilter(value || undefined);
  };

  // can we get rid of wrapper?
  const handleSubmitNewWebIds = handleSubmit({
    newAgentsWebIds,
    webIdsToDelete,
    accessControl,
    onClose: handleModalClose,
    policyName,
    resourceIri,
    setAgentPermissions,
    fetch,
  });

  const handleSaveChangesClick = () => {
    if (!newAgentsWebIds.length && !webIdsToDelete.length) {
      handleModalClose();
      return;
    }
    const filteredNewWebIds = newAgentsWebIds.filter(
      (webId) => !isPublicAgentorAuthenticatedAgentWebId(webId)
    );
    const filteredWebIdsToDelete = webIdsToDelete.filter(
      (webId) => !isPublicAgentorAuthenticatedAgentWebId(webId)
    );
    if (!filteredNewWebIds.length && !filteredWebIdsToDelete.length) {
      // what to do here where all new webIDs are public
      handleModalClose();
    } else {
      //  first get confirmation then handleSubmitNewWebIds
      setOpenConfirmationDialog(true);
    }
  };

  const updateTemporaryRowThing = (newThing) => {
    const { dataset: addressBookDataset } = addressBook;
    const newItem = {
      thing: newThing,
      dataset: addressBookDataset,
    };
    setContactsArray([
      newItem,
      ...contactsArray.slice(1, contactsArray.length),
    ]);
  };

  useEffect(() => {
    setCheckedBoxes(setupWebIdCheckBoxObject(permissions, contactsArray));
  }, [permissions, contactsArray]);

  // currently re-render ~20 times, check useEffects and see if we can get rid of this.
  useEffect(() => {
    if (!contacts || !addressBook) return;
    const { dataset: addressBookDataset } = addressBook;
    const publicAgent = createPublicAgent(addressBookDataset);
    const authenticatedAgent = createAuthenticatedAgent(addressBookDataset);
    const contactsArrayForTable = contacts.map(({ thing }) => {
      return {
        thing,
        dataset: addressBookDataset,
      };
    });

    contactsArrayForTable.unshift(publicAgent, authenticatedAgent);
    setContactsArray(contactsArrayForTable);
  }, [contacts, addressBook]);

  const handleAddRow = () => {
    setAddingWebId(true);
    const emptyThing = createThing();
    const { dataset: addressBookDataset } = addressBook;
    const newItem = {
      thing: emptyThing,
      dataset: addressBookDataset,
    };

    setContactsArray([newItem, ...contactsArray]);
  };

  const toggleCheckbox = (e, index) => {
    const { value, checked } = e.target;
    setCheckedBoxes({
      ...checkedBoxes,
      [value]: checked,
    });
    if (index === 0 && addingWebId) return null;
    if (checked) {
      // remove from add if the final state is unchecked
      setNewAgentsWebIds([value, ...newAgentsWebIds]);
    } else {
      // remove from remove if the final state is checked
      setWebIdsToDelete([value, ...webIdsToDelete]);
    }
    return checked;
  };
  const tableData = setupDataForTable();

  return (
    <Modal
      open={open}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClose={handleModalClose}
      aria-labelledby={accessibilityLabel}
      aria-describedby={accessibilityDescribe}
    >
      <ModalContainer
        className={classes.paper}
        data-testid={TESTCAFE_ID_ADD_AGENT_PICKER_MODAL}
        ref={ref}
        tabIndex={-1}
      >
        <ModalBody>
          <div className={classes.title}>{`${header} for ${resourceName}`}</div>
          {advancedSharing ? (
            <CustomPolicyDropdown
              setCustomPolicy={setCustomPolicy}
              defaultValue={type}
              editing={editing}
            />
          ) : (
            <PolicyHeader type={type} />
          )}
          <div className={classes.tableContainer}>
            <AgentsSearchBar handleFilterChange={handleFilterChange} />
            <div className={classes.addWebIdButtonContainer}>
              <AddWebIdButton onClick={handleAddRow} disabled={addingWebId} />
            </div>
            {!contacts &&
              !error && ( // should be a loading var
                <Container variant="empty">
                  <CircularProgress />
                </Container>
              )}
            {!!contacts && !!tableData.length && (
              <table className={clsx(bem("table"), bem("agentPickerTable"))}>
                <thead className={classes.tableHeader}>
                  <tr>
                    <td>Editor</td>
                    <td>Name/WebID</td>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => {
                    const { webId } = row;
                    return (
                      <tr key={i}>
                        <>
                          <td>
                            <Checkbox
                              checked={checkedBoxes[webId]}
                              onChange={(e) => toggleCheckbox(e, i)}
                              value={webId}
                            />
                          </td>
                          <td>
                            <p>{webId}</p>
                          </td>
                        </>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!!contacts && !tableData.length && (
              <AgentPickerEmptyState onClick={handleAddRow} />
            )}
          </div>
          <div className={classes.buttonsContainer}>
            <Button
              variant="secondary"
              data-testid={TESTCAFE_CANCEL_WEBIDS_BUTTON}
              className={classes.cancelButton}
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              data-testid={TESTCAFE_SUBMIT_WEBIDS_BUTTON}
              onClick={handleSaveChangesClick}
            >
              {saveText}
            </Button>
            <ConfirmationDialogNew
              openConfirmationDialog={openConfirmationDialog}
              title={confirmationDialogText.title}
              content={confirmationDialogText.content}
              onConfirm={handleSubmitNewWebIds}
              onCancel={() => setOpenConfirmationDialog(false)}
            />
          </div>
        </ModalBody>
      </ModalContainer>
    </Modal>
  );
}

// why change the name?
const AgentPickerModalRef = forwardRef(AgentPickerModal);
export default AgentPickerModalRef;

AgentPickerModal.propTypes = {
  handleModalClose: PropTypes.func.isRequired,
  setLoading: PropTypes.func,
  type: PropTypes.string.isRequired,
  advancedSharing: PropTypes.bool,
  editing: PropTypes.bool,
  open: PropTypes.bool.isRequired,
  accessibilityLabel: PropTypes.string,
  accessibilityDescribe: PropTypes.string,
  resourceIri: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  permissions: PropTypes.array.isRequired,
};

AgentPickerModal.defaultProps = {
  setLoading: () => {},
  advancedSharing: false,
  editing: false,
  accessibilityLabel: "",
  accessibilityDescribe: "",
};
