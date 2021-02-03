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
import { Checkbox, createStyles } from "@material-ui/core";
import { Button } from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import {
  DatasetContext,
  Table,
  TableColumn,
  useSession,
} from "@inrupt/solid-ui-react";
import { Alert } from "@material-ui/lab";
import {
  createSolidDataset,
  createThing,
  getSourceUrl,
  getThingAll,
  setThing,
} from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import AccessControlContext from "../../../../../src/contexts/accessControlContext";
import { fetchProfile } from "../../../../../src/solidClientHelpers/profile";
import {
  findContactInAddressBook,
  saveContact,
  vcardExtras,
} from "../../../../../src/addressBook";
import useAddressBook from "../../../../../src/hooks/useAddressBook";
import useContactsOld from "../../../../../src/hooks/useContactsOld";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import PolicyHeader from "../../policyHeader";
import AgentsTableTabs from "../../agentsTableTabs";
import AgentsSearchBar from "../../agentsSearchBar";
import AddAgentRow from "../addAgentRow";
import AgentPickerEmptyState from "../agentPickerEmptyState";
import styles from "./styles";
import AddWebIdButton from "./addWebIdButton";
import ConfirmationDialogContext from "../../../../../src/contexts/confirmationDialogContext";
import useNamedPolicyPermissions from "../../../../../src/hooks/useNamedPolicyPermissions";
import usePermissionsWithProfiles from "../../../../../src/hooks/usePermissionsWithProfiles";

export const handleSubmit = ({
  newAgentsWebIds,
  setNoAgentsAlert,
  accessControl,
  people,
  addressBook,
  mutatePermissions,
  saveAgentToContacts,
  onClose,
  type,
  fetch,
}) => {
  return () => {
    if (!newAgentsWebIds.length) {
      setNoAgentsAlert(true);
      return;
    }
    newAgentsWebIds.forEach(async (agentWebId) => {
      await accessControl.addAgentToNamedPolicy(agentWebId, type);
      saveAgentToContacts(agentWebId, people, addressBook, fetch);
      mutatePermissions();
      onClose();
    });
  };
};

export const handleConfirmation = ({
  open,
  dialogId,
  setConfirmationSetup,
  setOpen,
  setConfirmed,
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
    }
  };
};

export const handleSaveContact = async (iri, people, addressBook, fetch) => {
  if (!iri) {
    return;
  }

  try {
    const { name, webId, types } = await fetchProfile(iri, fetch);
    const existingContact = await findContactInAddressBook(
      people,
      webId,
      fetch
    );

    if (existingContact.length) {
      return;
    }

    if (name) {
      const contact = { webId, fn: name };
      await saveContact(addressBook, contact, types, fetch);
    }
  } catch (e) {
    // ignoring any errors during contact save
  }
};

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const VCARD_WEBID_PREDICATE = vcardExtras("WebId");
const TESTCAFE_ID_ADD_AGENT_PICKER_MODAL = "agent-picker-modal";
const TESTCAFE_SUBMIT_WEBIDS_BUTTON = "submit-webids-button";

export default function AgentPickerModal({ type, text, onClose }) {
  const {
    data: namedPermissions,
    mutate: mutatePermissions,
  } = useNamedPolicyPermissions(type);
  const { permissionsWithProfiles: permissions } = usePermissionsWithProfiles(
    namedPermissions
  );

  const [addressBook] = useAddressBook();
  const { data: people } = useContactsOld(addressBook, foaf.Person);

  const classes = useStyles();
  const { session } = useSession();
  const { fetch } = session;
  const { dataset } = useContext(DatasetContext);
  const resourceIri = getSourceUrl(dataset);
  const resourceName = getResourceName(resourceIri);
  const [selectedTabValue, setSelectedTabValue] = useState("");
  const { accessControl } = useContext(AccessControlContext);
  const [newAgentsWebIds, setNewAgentsWebIds] = useState([]);
  const [contactsArray, setContactsArray] = useState([]);
  const [addingWebId, setAddingWebId] = useState(false);
  const [placeholderDataset, setPlaceholderDataset] = useState(
    createSolidDataset()
  );
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
    // todo: this will set the filter for the react SDK table once we have the multiselect agent picker
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setGlobalFilter(value || undefined);
  };

  const handleSubmitNewWebIds = handleSubmit({
    newAgentsWebIds,
    setNoAgentsAlert,
    accessControl,
    people,
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
      newAgentsWebIds.length === 1
        ? "1 person"
        : `${newAgentsWebIds.length} people`
    }`;
    const confirmationContent = `Continuing will change ${
      newAgentsWebIds.length === 1
        ? "1 person "
        : `${newAgentsWebIds.length} people `
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
    handleSubmitNewWebIds,
  });

  const updateThing = (newThing) => {
    const updatedDataset = setThing(placeholderDataset, newThing);
    setPlaceholderDataset(updatedDataset);
  };

  useEffect(() => {
    const contacts = getThingAll(placeholderDataset).map((t) => {
      return {
        dataset: placeholderDataset,
        thing: t,
      };
    });
    setContactsArray(contacts);
  }, [placeholderDataset]);

  useEffect(() => {
    onConfirmation(confirmationSetup, confirmed);
  }, [confirmationSetup, confirmed, onConfirmation]);

  const handleAddRow = () => {
    setNoAgentsAlert(false);
    setAddingWebId(true);
    const emptyThing = createThing();
    const newItem = {
      dataset: placeholderDataset,
      thing: emptyThing,
    };
    setContactsArray([newItem, ...contactsArray]);
  };

  if (!contactsArray) return null;

  return (
    <div
      className={classes.paper}
      data-testid={TESTCAFE_ID_ADD_AGENT_PICKER_MODAL}
    >
      <div className={classes.title}>{`${text} for ${resourceName}`}</div>
      <PolicyHeader type={type} />
      <div className={classes.tableContainer}>
        <div className={classes.tabsAndAddButtonContainer}>
          <AgentsTableTabs
            handleTabChange={handleTabChange}
            selectedTabValue={selectedTabValue}
            className={classes.modalTabsContainer}
          />
          <AddWebIdButton onClick={handleAddRow} disabled={addingWebId} />
        </div>
        <AgentsSearchBar handleFilterChange={handleFilterChange} />
        {contactsArray.length ? (
          <Table
            things={contactsArray}
            className={classes.table}
            filter={globalFilter}
          >
            <TableColumn
              property={VCARD_WEBID_PREDICATE}
              dataType="url"
              header={<span className={classes.tableHeader}>Editor</span>}
              body={({ value, row: { index } }) => (
                <Checkbox
                  type="checkbox"
                  color="primary"
                  size="medium"
                  checked={
                    (index === 0 && addingWebId) ||
                    newAgentsWebIds.includes(value)
                  }
                  onChange={(e) => {
                    if (index === 0 && addingWebId) return null;
                    return e.target.checked
                      ? setNewAgentsWebIds([value, ...newAgentsWebIds])
                      : setNewAgentsWebIds(
                          newAgentsWebIds.filter((webId) => webId !== value)
                        );
                  }}
                />
              )}
            />
            <TableColumn
              header={<span className={classes.tableHeader}>Name</span>}
              property={foaf.name}
              body={({ row: { index } }) => (
                <AddAgentRow
                  type={type}
                  index={index}
                  setNewAgentsWebIds={setNewAgentsWebIds}
                  newAgentsWebIds={newAgentsWebIds}
                  setAddingWebId={setAddingWebId}
                  addingWebId={addingWebId}
                  setNoAgentsAlert={setNoAgentsAlert}
                  updateThing={updateThing}
                  permissions={permissions}
                />
              )}
            />
          </Table>
        ) : (
          <AgentPickerEmptyState onClick={handleAddRow} />
        )}
      </div>
      {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
      {noAgentsAlert && <Alert severity="error">Please select {type}</Alert>}
      <div className={classes.buttonsContainer}>
        <Button
          variant="action"
          className={classes.cancelButton}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          data-testid={TESTCAFE_SUBMIT_WEBIDS_BUTTON}
          className={classes.submitAgentsButton}
          type="button"
          onClick={handleClickOpenDialog}
        >
          {text}
        </Button>
      </div>
    </div>
  );
}

AgentPickerModal.propTypes = {
  onClose: PropTypes.func,
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

AgentPickerModal.defaultProps = {
  onClose: () => {},
};
