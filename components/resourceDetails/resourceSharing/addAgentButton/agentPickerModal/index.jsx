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
import {
  Checkbox,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
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
} from "../../../../../src/addressBook";
import useAddressBook from "../../../../../src/hooks/useAddressBook";
import useContacts from "../../../../../src/hooks/useContacts";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import PolicyHeader from "../../policyHeader";
import AgentsTableTabs from "../../agentsTableTabs";
import AgentsSearchBar from "../../agentsSearchBar";
import AddAgentRow from "../addAgentRow";
import AgentPickerEmptyState from "../agentPickerEmptyState";
import CanShareInfoTooltip from "../../canShareInfoTooltip";
import styles from "./styles";
import CanShareToggleSwitch from "../../canShareToggleSwitch";
import AddWebIdButton from "./addWebIdButton";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const VCARD_WEBID_PREDICATE = "https://www.w3.org/2006/vcard/ns#WebId";
const TESTCAFE_ID_ADD_AGENT_PICKER_MODAL = "agent-picker-modal";
const TESTCAFE_CONFIRM_BUTTON = "confirm-button";
const TESTCAFE_SUBMIT_WEBIDS_BUTTON = "submit-webids-button";
const TESTCAFE_CONFIRMATION_CANCEL_BUTTON = "confirmation-cancel-button";
const TESTCAFE_CONFIRMATION_DIALOG = "confirmation-dialog";

export default function AgentPickerModal({
  type,
  text,
  onClose,
  mutatePermissions,
  permissions,
}) {
  const [addressBook] = useAddressBook();
  const {
    data: people,
    error: peopleError,
    mutate: peopleMutate,
  } = useContacts(addressBook, foaf.Person);

  const classes = useStyles();
  const { session } = useSession();
  const { dataset } = useContext(DatasetContext);
  const resourceIri = getSourceUrl(dataset);
  const resourceName = getResourceName(resourceIri);
  const [selectedTabValue, setSelectedTabValue] = useState("");
  const { accessControl } = useContext(AccessControlContext);
  const [canShareWebIds, setCanShareWebIds] = useState([]);
  const [newAgentsWebIds, setNewAgentsWebIds] = useState([]);
  const [contactError, setContactError] = useState();
  const [contactsArray, setContactsArray] = useState([]);
  const [addingWebId, setAddingWebId] = useState(false);
  const [placeholderDataset, setPlaceholderDataset] = useState(
    createSolidDataset()
  );
  const [noAgentsAlert, setNoAgentsAlert] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [emptyRowCanShare, setEmptyRowCanShare] = useState(false);

  const handleClickOpenDialog = () => {
    if (!newAgentsWebIds.length) {
      setNoAgentsAlert(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleTabChange = (e, newValue) => {
    setSelectedTabValue(newValue);
    // todo: this will set the filter for the react SDK table once we have the multiselect agent picker
  };

  const toggleCanShare = (webId) => {
    if (!webId) {
      setEmptyRowCanShare(!emptyRowCanShare);
    } else if (canShareWebIds.includes(webId)) {
      setCanShareWebIds(
        newAgentsWebIds.filter((agentWebId) => agentWebId !== webId)
      );
    } else {
      setCanShareWebIds([webId, ...canShareWebIds]);
    }
  };

  const handleSaveContact = async (iri, fetch) => {
    let response;
    let error;

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
        response = await saveContact(addressBook, contact, types, fetch);
      }
    } catch (e) {
      error = e; // setting the error in case we want to do something with it later (like displaying a notification to the user)
    }
    // eslint-disable-next-line consistent-return
    return { response, error };
  };

  const handleFilterChange = (e) => {
    const { value } = e.target;
    setGlobalFilter(value || undefined);
  };

  const handleSubmit = () => {
    if (!newAgentsWebIds.length) {
      setNoAgentsAlert(true);
      return;
    }
    newAgentsWebIds.forEach(async (agentWebId) => {
      await accessControl.addAgentToNamedPolicy(agentWebId, type);
      if (canShareWebIds.includes(agentWebId)) {
        await accessControl.addAgentToNamedPolicy(agentWebId, "canShare");
      }

      const { response, error } = handleSaveContact(agentWebId, session.fetch);
      if (error) {
        setContactError(error); // setting the error in case we want to notify the user
      }
      mutatePermissions();
      onClose();
    });
  };

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
          <Table things={contactsArray} className={classes.table}>
            <TableColumn
              property={VCARD_WEBID_PREDICATE}
              dataType="url"
              header={<span className={classes.tableHeader}>Editor</span>}
              body={({ value, row: { index } }) => (
                <Checkbox
                  type="checkbox"
                  color="primary"
                  size="medium"
                  checked={index === 0 || newAgentsWebIds.includes(value)}
                  onChange={(e) => {
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
              body={({ row: { index } }) => {
                return (
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
                );
              }}
            />
            {/* Hiding the toggle until we have the new canShare policy */}
            {/* <TableColumn
              header={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <CanShareInfoTooltip
                  className={classes.canShareTableHeader}
                  resourceName={resourceName}
                />
              }
              dataType="url"
              property={VCARD_WEBID_PREDICATE}
              body={({ value }) => {
                return (
                  <CanShareToggleSwitch
                    toggleShare={() => toggleCanShare(value)}
                    canShare={
                      value ? canShareWebIds.includes(value) : emptyRowCanShare
                    }
                  />
                );
              }}
            /> */}
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
        <Dialog
          data-testid={TESTCAFE_CONFIRMATION_DIALOG}
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="Confirmation dialog"
          aria-describedby="Confirm change in permissions"
        >
          <DialogTitle
            id="alert-dialog-title"
            classes={{ root: classes.dialogTitle }}
            disableTypography
          >
            Change permissions for
            {newAgentsWebIds.length === 1
              ? " 1 person"
              : ` ${newAgentsWebIds.length} people`}
            {/* this will change when we have groups */}
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              classes={{ root: classes.dialogText }}
              id="alert-confirmation-dialog"
            >
              Continuing will change
              {newAgentsWebIds.length === 1
                ? " 1 person "
                : ` ${newAgentsWebIds.length} people `}
              permissions to
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              data-testid={TESTCAFE_CONFIRMATION_CANCEL_BUTTON}
              variant="action"
              className={classes.cancelButton}
              onClick={handleCloseDialog}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              data-testid={TESTCAFE_CONFIRM_BUTTON}
              className={classes.submitAgentsButton}
              onClick={handleSubmit}
              color="primary"
              autoFocus
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

AgentPickerModal.propTypes = {
  onClose: PropTypes.func,
  mutatePermissions: PropTypes.func,
  permissions: PropTypes.arrayOf(PropTypes.shape).isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

AgentPickerModal.defaultProps = {
  onClose: () => {},
  mutatePermissions: () => {},
};
