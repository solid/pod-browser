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

/* eslint-disable react/forbid-prop-types */

import React, { useContext, useState, useEffect, forwardRef } from "react";
import PropTypes from "prop-types";
import { CircularProgress, createStyles } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { Button, Container } from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import {
  DatasetContext,
  Table,
  TableColumn,
  useSession,
} from "@inrupt/solid-ui-react";
import { createThing, getSourceUrl } from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import { serializePromises } from "../../../../src/solidClientHelpers/utils";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import { fetchProfile } from "../../../../src/solidClientHelpers/profile";
import { getResourceName } from "../../../../src/solidClientHelpers/resource";
import PolicyHeader from "../policyHeader";
import AgentsSearchBar from "../agentsSearchBar";
import AddAgentRow from "../addAgentRow";
import AgentPickerEmptyState from "../agentPickerEmptyState";
import CustomPolicyDropdown from "../customPolicyDropdown";
import styles from "./styles";
import AddWebIdButton from "./addWebIdButton";
import WebIdCheckbox from "./webIdCheckbox";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import ConfirmationDialog from "../../../confirmationDialog";
import useContacts from "../../../../src/hooks/useContacts";
import { GROUP_CONTACT } from "../../../../src/models/contact/group";
import {
  PERSON_CONTACT,
  findPersonContactInAddressBook,
  savePerson,
} from "../../../../src/models/contact/person";
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
import { getWebIdsFromPermissions } from "../../../../src/accessControl/acp";
import PermissionsContext from "../../../../src/contexts/permissionsContext";

const AGENT_PREDICATE = "http://www.w3.org/ns/solid/acp#agent";
const TESTCAFE_ID_ADD_AGENT_PICKER_MODAL = "agent-picker-modal";
export const TESTCAFE_SUBMIT_WEBIDS_BUTTON = "submit-webids-button";
const TESTCAFE_CANCEL_WEBIDS_BUTTON = "cancel-webids-button";
export const DIALOG_ID = "add-new-permissions";

export const removeExistingAgentFromOtherPolicies = ({
  permissions,
  newPolicy,
  agentWebId,
  accessControl,
}) => {
  const existingPermission = permissions.filter(
    (p) => p.webId === agentWebId && p.alias !== newPolicy
  );
  if (existingPermission.length) {
    existingPermission.map((ep) =>
      accessControl.removeAgentFromPolicy(ep.webId, ep.alias)
    );
  }
};

export const handleSubmit = ({
  permissions,
  newAgentsWebIds,
  webIdsToDelete,
  accessControl,
  addressBook,
  mutateResourceInfo,
  saveAgentToContacts,
  onClose,
  setLoading,
  policyName,
  fetch,
}) => {
  return async () => {
    onClose();
    if (!newAgentsWebIds.length && !webIdsToDelete.length) {
      return;
    }
    setLoading(true);
    const existingPoliciesPromiseFactories = newAgentsWebIds?.map(
      (agentWebId) => () => {
        removeExistingAgentFromOtherPolicies({
          permissions,
          newPolicy: policyName,
          agentWebId,
          accessControl,
        });
      }
    );
    const addPermissionsPromiseFactories = newAgentsWebIds?.map(
      (agentWebId) => () => {
        if (PUBLIC_AGENT_PREDICATE === agentWebId) {
          return accessControl.setRulePublic(policyName, true);
        }
        if (AUTHENTICATED_AGENT_PREDICATE === agentWebId) {
          return accessControl.setRuleAuthenticated(policyName, true);
        }
        return accessControl.addAgentToPolicy(agentWebId, policyName);
      }
    );

    const removePermissionsPromiseFactories = webIdsToDelete?.map(
      (agentWebId) => () => {
        if (PUBLIC_AGENT_PREDICATE === agentWebId) {
          return accessControl.setRulePublic(policyName, false);
        }
        if (AUTHENTICATED_AGENT_PREDICATE === agentWebId) {
          return accessControl.setRuleAuthenticated(policyName, false);
        }
        return accessControl.removeAgentFromPolicy(agentWebId, policyName);
      }
    );

    const addAgentsToContactsPromiseFactories = newAgentsWebIds
      ?.filter(
        (webId) =>
          webId !== PUBLIC_AGENT_PREDICATE &&
          webId !== AUTHENTICATED_AGENT_PREDICATE
      )
      .map((agentWebId) => () =>
        saveAgentToContacts(agentWebId, addressBook, fetch)
      );
    const args = await serializePromises([
      ...existingPoliciesPromiseFactories,
      ...addPermissionsPromiseFactories,
      ...removePermissionsPromiseFactories,
      ...addAgentsToContactsPromiseFactories,
    ]);
    const responses = args.filter((res) => typeof res !== "undefined");
    const { response: latestAcr } = responses[responses.length - 1];
    await mutateResourceInfo(latestAcr, false);
    setLoading(false);
  };
};

export const handleSaveContact = async (iri, addressBook, fetch) => {
  let error;
  if (!iri) {
    return;
  }

  try {
    const { name, webId } = await fetchProfile(iri, fetch);
    // TODO: we will likely need to change this if we want to save groups on the fly as well
    const existingContact = await findPersonContactInAddressBook(
      addressBook,
      webId,
      fetch
    );
    if (existingContact.length) {
      return;
    }

    if (name) {
      const contact = { webId, fn: name };
      // TODO: we will likely need to update this if we also want to create and save groups
      await savePerson(addressBook, contact, fetch);
    }
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error = e; // need to do something with the error otherwise the function exits at any point a webId fails and does not continue processing the rest
  }
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function AgentPickerModal(
  { type, onClose, setLoading, advancedSharing, editing },
  ref
) {
  const [customPolicy, setCustomPolicy] = useState(
    advancedSharing ? type : null
  );
  const policyName = advancedSharing ? customPolicy : type;
  const { header, saveText, titleSingular } = POLICIES_TYPE_MAP[policyName];

  const {
    permissions: allPermissions,
    newAgentsWebIds,
    setNewAgentsWebIds,
    webIdsToDelete,
    setWebIdsToDelete,
    setAddingWebId,
    addingWebId,
  } = useContext(PermissionsContext);
  const permissions = allPermissions?.filter((p) => p.alias === type);
  const { mutate: mutateResourceInfo } = useContext(ResourceInfoContext);

  const { data: addressBook } = useAddressBook();
  const { data: contacts, error } = useContacts([
    GROUP_CONTACT,
    PERSON_CONTACT,
  ]);

  const webIdsInPermissions = getWebIdsFromPermissions(permissions);

  const bem = useBem(useStyles());

  const classes = useStyles();

  const { session } = useSession();
  const { fetch } = session;
  const { solidDataset: dataset } = useContext(DatasetContext);
  const resourceIri = getSourceUrl(dataset);
  const resourceName = getResourceName(resourceIri);
  // TODO: Uncomment to reintroduce tabs
  // const [selectedTabValue, setSelectedTabValue] = useState("");
  const { accessControl } = useContext(AccessControlContext);

  const [bypassDialog, setBypassDialog] = useState(false);
  const [contactsArray, setContactsArray] = useState([]);
  // TODO: Uncomment to reintroduce tabs
  // const [filteredContacts, setFilteredContacts] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const {
    open,
    confirmed,
    setConfirmed,
    setContent,
    setOpen,
    setTitle,
    closeDialog,
  } = useContext(ConfirmationDialogContext);

  // TODO: Uncomment to reintroduce tabs
  // const handleTabChange = (e, newValue) => {
  //   setSelectedTabValue(newValue);
  // };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setGlobalFilter(value || undefined);
  };
  const handleSubmitNewWebIds = handleSubmit({
    permissions: allPermissions,
    newAgentsWebIds,
    webIdsToDelete,
    accessControl,
    addressBook,
    mutateResourceInfo,
    saveAgentToContacts: handleSaveContact,
    onClose,
    setLoading,
    policyName,
    advancedSharing,
    fetch,
  });

  const handleClickOpenDialog = () => {
    if (!newAgentsWebIds.length && !webIdsToDelete.length) {
      onClose();
      setConfirmed(false);
      return;
    }
    const filteredNewWebIds = newAgentsWebIds.filter(
      (webId) =>
        webId !== PUBLIC_AGENT_PREDICATE &&
        webId !== AUTHENTICATED_AGENT_PREDICATE
    );
    const filteredWebIdsToDelete = webIdsToDelete.filter(
      (webId) =>
        webId !== PUBLIC_AGENT_PREDICATE &&
        webId !== AUTHENTICATED_AGENT_PREDICATE
    );
    if (!filteredNewWebIds.length && !filteredWebIdsToDelete.length) {
      setTitle(null);
      setContent(null);
      setOpen(null);
      setBypassDialog(true);
    }
    const confirmationTitle = `Change permissions for ${
      filteredNewWebIds.length + filteredWebIdsToDelete.length === 1
        ? "1 person"
        : `${newAgentsWebIds.length + filteredWebIdsToDelete.length} people`
    }`;
    const confirmationContent = `Continuing will change ${
      filteredNewWebIds.length + filteredWebIdsToDelete.length === 1
        ? "1 person "
        : `${filteredNewWebIds.length + filteredWebIdsToDelete.length} people `
    } permissions to ${header}`;
    setTitle(confirmationTitle);
    setContent(confirmationContent);
    setOpen(DIALOG_ID);
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

  // TODO: Uncomment to reintroduce tabs
  // useEffect(() => {
  //   if (selectedTabValue) {
  //     const filtered = contactsArray.filter(({ thing }) =>
  //       selectedTabValue.isOfType(thing)
  //     );
  //     setFilteredContacts(filtered);
  //   }
  // }, [contactsArray, selectedTabValue, globalFilter]);

  useEffect(() => {
    setConfirmationSetup(true);
    if (bypassDialog) {
      setConfirmed(true);
      handleSubmitNewWebIds();
    }
    if (open !== DIALOG_ID) return;
    if (confirmationSetup && confirmed === null) return;
    if (confirmationSetup && confirmed) {
      handleSubmitNewWebIds();
    }

    if (confirmationSetup && confirmed !== null) {
      closeDialog();
      setConfirmationSetup(false);
    }
  }, [
    open,
    bypassDialog,
    setConfirmationSetup,
    confirmationSetup,
    setConfirmed,
    confirmed,
    handleSubmitNewWebIds,
    closeDialog,
  ]);

  const handleAddRow = () => {
    setAddingWebId(true);
    const emptyThing = createThing();
    const { dataset: addressBookDataset } = addressBook;
    const newItem = {
      thing: emptyThing,
      dataset: addressBookDataset,
    };
    // TODO: Uncomment to reintroduce tabs
    // if (selectedTabValue) {
    //   setFilteredContacts([newItem, ...filteredContacts]);
    // }
    setContactsArray([newItem, ...contactsArray]);
  };

  const contactsForTable = contactsArray;
  // TODO: Uncomment to reintroduce tabs
  // const contactsForTable = selectedTabValue ? filteredContacts : contactsArray;
  const toggleCheckbox = (e, index, value) => {
    if (index === 0 && addingWebId) return null;
    if (
      !webIdsToDelete.includes(value) &&
      webIdsInPermissions.includes(value)
    ) {
      setWebIdsToDelete([value, ...webIdsToDelete]);
    } else if (
      webIdsToDelete.includes(value) &&
      webIdsInPermissions.includes(value)
    ) {
      setWebIdsToDelete(webIdsToDelete.filter((webId) => webId !== value));
    }
    return e.target.checked
      ? setNewAgentsWebIds([value, ...newAgentsWebIds])
      : setNewAgentsWebIds(newAgentsWebIds.filter((webId) => webId !== value));
  };
  return (
    <div
      className={classes.paper}
      data-testid={TESTCAFE_ID_ADD_AGENT_PICKER_MODAL}
      ref={ref}
    >
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
        {!contacts && !error && (
          <Container variant="empty">
            <CircularProgress />
          </Container>
        )}
        {!!contacts && !!contactsForTable.length && (
          <Table
            things={contactsForTable}
            className={clsx(bem("table"), bem("agentPickerTable"))}
            filter={globalFilter}
          >
            <TableColumn
              property={AGENT_PREDICATE}
              dataType="url"
              header={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <span className={classes.tableHeader}>{titleSingular}</span>
              }
              body={({ value, row: { index } }) => (
                <WebIdCheckbox
                  value={value}
                  index={index}
                  toggleCheckbox={toggleCheckbox}
                  type={type}
                />
              )}
            />
            <TableColumn
              header={<span className={classes.tableHeader}>Name</span>}
              property={foaf.name}
              filterable
              body={({ row: { index } }) => (
                <AddAgentRow
                  type={policyName}
                  index={index}
                  contactsArrayLength={contactsArray.length}
                  updateTemporaryRowThing={updateTemporaryRowThing}
                />
              )}
            />
          </Table>
        )}
        {/* TODO: Uncomment to reintroduce tabs */}
        {/* {!!contacts && !contactsForTable.length && !selectedTabValue && ( */}
        {!!contacts && !contactsForTable.length && (
          <AgentPickerEmptyState onClick={handleAddRow} />
        )}
        {/* TODO: Uncomment to reintroduce tabs */}
        {/* {!!contacts && !contactsForTable.length && !!selectedTabValue && ( */}
        {/*  <span className={classes.emptyStateTextContainer}> */}
        {/*    <p> */}
        {/*      {`No ${ */}
        {/*        selectedTabValue === PERSON_CONTACT ? "people " : "groups " */}
        {/*      } found`} */}
        {/*    </p> */}
        {/*  </span> */}
        {/* )} */}
      </div>
      <div className={classes.buttonsContainer}>
        <Button
          variant="secondary"
          data-testid={TESTCAFE_CANCEL_WEBIDS_BUTTON}
          className={classes.cancelButton}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          data-testid={TESTCAFE_SUBMIT_WEBIDS_BUTTON}
          onClick={handleClickOpenDialog}
        >
          {saveText}
        </Button>
        <ConfirmationDialog />
      </div>
    </div>
  );
}

const AgentPickerModalRef = forwardRef(AgentPickerModal);
export default AgentPickerModalRef;

AgentPickerModal.propTypes = {
  onClose: PropTypes.func,
  setLoading: PropTypes.func,
  type: PropTypes.string.isRequired,
  advancedSharing: PropTypes.bool,
  editing: PropTypes.bool,
};

AgentPickerModal.defaultProps = {
  onClose: () => {},
  setLoading: () => {},
  advancedSharing: false,
  editing: false,
};
