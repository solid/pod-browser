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

import React, { useContext, useState, useEffect } from "react";
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
import { Alert } from "@material-ui/lab";
import { createThing, getSourceUrl } from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces";
import AccessControlContext from "../../../../../src/contexts/accessControlContext";
import { fetchProfile } from "../../../../../src/solidClientHelpers/profile";
import {
  findPersonContactInAddressBook,
  saveContact,
  vcardExtras,
} from "../../../../../src/addressBook";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import PolicyHeader from "../../policyHeader";
import AgentsTableTabs from "../../agentsTableTabs";
import AgentsSearchBar from "../../agentsSearchBar";
import AddAgentRow from "../addAgentRow";
import AgentPickerEmptyState from "../agentPickerEmptyState";
import styles from "./styles";
import AddWebIdButton from "./addWebIdButton";
import WebIdCheckbox from "./webIdCheckbox";
import ConfirmationDialogContext from "../../../../../src/contexts/confirmationDialogContext";
import useNamedPolicyPermissions from "../../../../../src/hooks/useNamedPolicyPermissions";
import usePermissionsWithProfiles from "../../../../../src/hooks/usePermissionsWithProfiles";
import useContacts from "../../../../../src/hooks/useContacts";
import { GROUP_CONTACT } from "../../../../../src/models/contact/group";
import { PERSON_CONTACT } from "../../../../../src/models/contact/person";
import useAddressBook from "../../../../../src/hooks/useAddressBook";

export const handleSubmit = ({
  newAgentsWebIds,
  webIdsToDelete,
  setNoAgentsAlert,
  accessControl,
  contacts,
  addressBook,
  mutatePermissions,
  saveAgentToContacts,
  onClose,
  type,
  fetch,
}) => {
  return () => {
    if (!newAgentsWebIds.length && !webIdsToDelete.length) {
      setNoAgentsAlert(true);
      return;
    }
    Promise.allSettled([
      ...webIdsToDelete?.map(async (agentWebId) =>
        accessControl.removeAgentFromNamedPolicy(agentWebId, type)
      ),
      ...newAgentsWebIds?.map(async (agentWebId) =>
        accessControl.addAgentToNamedPolicy(agentWebId, type)
      ),
      ...newAgentsWebIds?.map(async (agentWebId) =>
        saveAgentToContacts(agentWebId, contacts, addressBook, fetch)
      ),
    ]).then(() => mutatePermissions());
    onClose();
  };
};

export const handleConfirmation = ({
  open,
  dialogId,
  setConfirmationSetup,
  setOpen,
  setConfirmed,
  setContent,
  setTitle,
  handleSubmitNewWebIds,
}) => {
  return (confirmationSetup, confirmed) => {
    if (open !== dialogId) return;
    if (confirmationSetup && confirmed === null) return;
    setConfirmationSetup(true);

    if (confirmationSetup && confirmed) {
      handleSubmitNewWebIds();
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

export const handleSaveContact = async (iri, contacts, addressBook, fetch) => {
  const {
    dataset: addressBookDataset,
    containerUrl: addressBookContainerUrl,
  } = addressBook;
  let error;
  if (!iri) {
    return;
  }

  try {
    const { name, webId, types } = await fetchProfile(iri, fetch);
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
      await saveContact(
        addressBookDataset,
        addressBookContainerUrl,
        contact,
        types,
        fetch
      );
    }
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error = e; // need to do something with the error otherwise the function exits at any point a webId fails and does not continue processing the rest
  }
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const VCARD_WEBID_PREDICATE = vcardExtras("WebId");

const TESTCAFE_ID_ADD_AGENT_PICKER_MODAL = "agent-picker-modal";
const TESTCAFE_SUBMIT_WEBIDS_BUTTON = "submit-webids-button";
const TESTCAFE_CANCEL_WEBIDS_BUTTON = "cancel-webids-button";

export default function AgentPickerModal({ type, text, onClose }) {
  const { editText, saveText } = text;
  const {
    data: namedPermissions,
    mutate: mutatePermissions,
  } = useNamedPolicyPermissions(type);
  const { permissionsWithProfiles: permissions } = usePermissionsWithProfiles(
    namedPermissions
  );

  const { data: addressBook } = useAddressBook();
  const { data: contacts, error } = useContacts([
    GROUP_CONTACT,
    PERSON_CONTACT,
  ]);
  const webIdsInPermissions = permissions.map((p) => p.webId);

  const bem = useBem(useStyles());

  const classes = useStyles();

  const { session } = useSession();
  const { fetch } = session;
  const { dataset } = useContext(DatasetContext);
  const resourceIri = getSourceUrl(dataset);
  const resourceName = getResourceName(resourceIri);
  const [selectedTabValue, setSelectedTabValue] = useState("");
  const { accessControl } = useContext(AccessControlContext);
  const [newAgentsWebIds, setNewAgentsWebIds] = useState([]);
  const [webIdsToDelete, setWebIdsToDelete] = useState([]);
  const [contactsArray, setContactsArray] = useState([]);
  const [addingWebId, setAddingWebId] = useState(false);
  const [noAgentsAlert, setNoAgentsAlert] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const dialogId = "add-new-permissions";
  const [confirmationSetup, setConfirmationSetup] = useState(false);
  const {
    open,
    confirmed,
    setConfirmed,
    setContent,
    setOpen,
    setTitle,
  } = useContext(ConfirmationDialogContext);

  const handleTabChange = (e, newValue) => {
    setSelectedTabValue(newValue);
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setGlobalFilter(value || undefined);
  };

  const handleSubmitNewWebIds = handleSubmit({
    newAgentsWebIds,
    webIdsToDelete,
    setNoAgentsAlert,
    accessControl,
    contacts,
    addressBook,
    mutatePermissions,
    saveAgentToContacts: handleSaveContact,
    onClose,
    type,
    fetch,
  });

  const handleClickOpenDialog = () => {
    if (!newAgentsWebIds.length) {
      setNoAgentsAlert(true);
      return;
    }
    const confirmationTitle = `Change permissions for ${
      newAgentsWebIds.length + webIdsToDelete.length === 1
        ? "1 person"
        : `${newAgentsWebIds.length + webIdsToDelete.length} people`
    }`;
    const confirmationContent = `Continuing will change ${
      newAgentsWebIds.length + webIdsToDelete.length === 1
        ? "1 person "
        : `${newAgentsWebIds.length + webIdsToDelete.length} people `
    } permissions to ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    setTitle(confirmationTitle);
    setContent(confirmationContent);
    setOpen(dialogId);
  };

  const onConfirmation = handleConfirmation({
    open,
    dialogId,
    setConfirmationSetup,
    setOpen,
    setConfirmed,
    setContent,
    setTitle,
    handleSubmitNewWebIds,
  });

  const updateThing = (newThing) => {
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
    if (!contacts) return;
    const { dataset: addressBookDataset } = addressBook;
    const contactsArrayForTable = contacts.map(({ thing }) => {
      return {
        thing,
        dataset: addressBookDataset,
      };
    });
    setContactsArray(contactsArrayForTable);
    if (selectedTabValue) {
      const filteredContacts = contactsArrayForTable.filter(({ thing }) =>
        selectedTabValue.isOfType(thing)
      );
      setContactsArray(filteredContacts);
    }
  }, [contacts, addressBook, selectedTabValue]);

  useEffect(() => {
    onConfirmation(confirmationSetup, confirmed);
  }, [confirmationSetup, confirmed, onConfirmation]);

  const handleAddRow = () => {
    setNoAgentsAlert(false);
    setAddingWebId(true);
    const emptyThing = createThing();
    const { dataset: addressBookDataset } = addressBook;
    const newItem = {
      thing: emptyThing,
      dataset: addressBookDataset,
    };
    setContactsArray([newItem, ...contactsArray]);
  };

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
    >
      <div className={classes.title}>{`${editText} for ${resourceName}`}</div>
      <PolicyHeader type={type} />
      <div className={classes.tableContainer}>
        <div className={classes.tabsAndAddButtonContainer}>
          <AgentsTableTabs
            handleTabChange={handleTabChange}
            selectedTabValue={selectedTabValue}
            className={classes.modalTabsContainer}
            tabsValues={{
              all: "",
              people: PERSON_CONTACT,
              groups: GROUP_CONTACT,
            }}
          />
          <AddWebIdButton onClick={handleAddRow} disabled={addingWebId} />
        </div>
        <AgentsSearchBar handleFilterChange={handleFilterChange} />
        {!contacts && !error && (
          <Container variant="empty">
            <CircularProgress />
          </Container>
        )}
        {!!contacts && !!contactsArray.length && (
          <Table
            things={contactsArray}
            className={clsx(bem("table"), bem("agentPickerTable"))}
            filter={globalFilter}
          >
            <TableColumn
              property={VCARD_WEBID_PREDICATE}
              dataType="url"
              header={<span className={classes.tableHeader}>Editor</span>}
              body={({ value, row: { index } }) => (
                <WebIdCheckbox
                  value={value}
                  index={index}
                  addingWebId={addingWebId}
                  toggleCheckbox={toggleCheckbox}
                  newAgentsWebIds={newAgentsWebIds}
                  webIdsInPermissions={webIdsInPermissions}
                  webIdsToDelete={webIdsToDelete}
                />
              )}
            />
            <TableColumn
              header={<span className={classes.tableHeader}>Name</span>}
              property={vcard.fn}
              filterable
              body={({ row: { index } }) => (
                <AddAgentRow
                  type={type}
                  index={index}
                  setNewAgentsWebIds={setNewAgentsWebIds}
                  newAgentsWebIds={newAgentsWebIds}
                  contactsArrayLength={contactsArray.length}
                  setAddingWebId={setAddingWebId}
                  addingWebId={addingWebId}
                  setNoAgentsAlert={setNoAgentsAlert}
                  updateThing={updateThing}
                  permissions={permissions}
                />
              )}
            />
          </Table>
        )}
        {!!contacts && !contactsArray.length && !selectedTabValue && (
          <AgentPickerEmptyState onClick={handleAddRow} />
        )}
        {!!contacts && !contactsArray.length && selectedTabValue && (
          <span className={classes.emptyStateTextContainer}>
            <p>
              {`No ${
                selectedTabValue === PERSON_CONTACT ? "people " : "groups "
              } found`}
            </p>
          </span>
        )}
      </div>
      {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
      {noAgentsAlert && <Alert severity="error">Please select {type}</Alert>}
      <div className={classes.buttonsContainer}>
        <Button
          variant="secondary"
          onClick={onClose}
          data-testid={TESTCAFE_CANCEL_WEBIDS_BUTTON}
        >
          Cancel
        </Button>
        <Button
          data-testid={TESTCAFE_SUBMIT_WEBIDS_BUTTON}
          onClick={handleClickOpenDialog}
        >
          {saveText}
        </Button>
      </div>
    </div>
  );
}

AgentPickerModal.propTypes = {
  onClose: PropTypes.func,
  text: PropTypes.shape().isRequired,
  type: PropTypes.string.isRequired,
};

AgentPickerModal.defaultProps = {
  onClose: () => {},
};
