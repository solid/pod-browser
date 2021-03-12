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

import React, { useCallback, useEffect, useRef, useState } from "react";
import T from "prop-types";
import { Container } from "@inrupt/prism-react-components";
import { CircularProgress, createStyles } from "@material-ui/core";
import { Table, TableColumn, useSession } from "@inrupt/solid-ui-react";
import clsx from "clsx";
import { vcard } from "rdf-namespaces";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { getSolidDataset, getThing } from "@inrupt/solid-client";
import { Pagination } from "@material-ui/lab";
import AgentsTableTabs from "../resourceDetails/resourceSharing/agentsTableTabs";
import { PERSON_CONTACT } from "../../src/models/contact/person";
import { GROUP_CONTACT } from "../../src/models/contact/group";
import MobileAgentsSearchBar from "../resourceDetails/resourceSharing/mobileAgentsSearchBar";
import AddWebIdButton from "../resourceDetails/resourceSharing/addAgentButton/agentPickerModal/addWebIdButton";
import AgentsSearchBar from "../resourceDetails/resourceSharing/agentsSearchBar";
import AgentPickerEmptyState from "../resourceDetails/resourceSharing/addAgentButton/agentPickerEmptyState";
import styles from "./styles";
import { vcardExtras } from "../../src/addressBook";
import MemberCheckbox from "./memberCheckbox";
import MemberRow from "./memberRow";
import { createTempContact, TEMP_CONTACT } from "../../src/models/contact/temp";
import { getBaseUrl } from "../../src/solidClientHelpers/resource";
import {
  createUnregisteredContact,
  UNREGISTERED_CONTACT,
} from "../../src/models/contact/unregistered";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const VCARD_WEBID_PREDICATE = vcardExtras("WebId");
const NUM_CONTACTS_PER_PAGE = 2;

function getNumPages(contacts) {
  return Math.ceil(contacts.length / NUM_CONTACTS_PER_PAGE);
}

function getExtraItems(contacts) {
  const tempItems = contacts.filter((contact) =>
    TEMP_CONTACT.isOfType(contact.thing)
  );
  const unregisteredItems = contacts.filter((contact) =>
    UNREGISTERED_CONTACT.isOfType(contact.thing)
  );
  return tempItems.concat(unregisteredItems);
}

export default function AgentMultiSelectPicker({
  contacts,
  onChange,
  selected,
  disabled,
  checkboxHeadLabel,
}) {
  const { fetch } = useSession();
  const bem = useBem(useStyles());
  const [tab, setTab] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedFake, setSelectedFake] = useState([]);
  const [pages, setPages] = useState(getNumPages(contacts));
  const [page, setPage] = useState(1);
  const [showPagination, setShowPagination] = useState(pages > 1);
  const [contactsToShow, setContactsToShow] = useState(
    contacts.slice(0, NUM_CONTACTS_PER_PAGE)
  );

  const initialSelected = selected.reduce(
    (memo, url) => Object.assign(memo, { [url]: null }),
    {}
  );
  const selectedContacts = useRef(initialSelected);
  const unselectedContacts = useRef({});

  const getSelection = useCallback(() => {
    const extraItems = getExtraItems(contactsToShow);
    return extraItems.concat(
      tab ? contacts.filter(({ thing }) => tab.isOfType(thing)) : contacts
    );
  }, [contacts, contactsToShow, tab]);

  useEffect(() => {
    const selection = getSelection();
    const end = globalFilter ? selection.length : NUM_CONTACTS_PER_PAGE;
    setContactsToShow(selection.slice(0, end));
    setPage(1);
    setPages(getNumPages(selection));
  }, [getSelection, globalFilter]);

  const getFinalChangeMap = (changeMap, shouldInclude) => {
    const entries = Object.entries(changeMap);
    return entries.length
      ? entries.reduce((memo, [key, value]) => {
          if (selected.includes(key) === shouldInclude) {
            return Object.assign(memo, { [key]: value });
          }
          return memo;
        }, {})
      : {};
  };

  const getChangedSelection = (model, checked) => {
    const originalUrl = model.type.getOriginalUrl(model);
    if (checked) {
      const selectedChange = {
        [originalUrl]: model,
        ...selectedContacts.current,
      };
      const {
        [originalUrl]: urlToRemove,
        ...unselectedChange
      } = unselectedContacts.current;
      return [selectedChange, unselectedChange, selectedFake];
    }
    const unselectedChange = {
      [originalUrl]: model,
      ...unselectedContacts.current,
    };
    const {
      [originalUrl]: urlToRemove,
      ...selectedChange
    } = selectedContacts.current;
    if (selectedFake.includes(originalUrl)) {
      const index = selectedFake.indexOf(originalUrl);
      const newSelectedFake = selectedFake
        .slice(0, index)
        .concat(selectedFake.slice(index + 1));
      return [selectedChange, unselectedChange, newSelectedFake];
    }
    return [selectedChange, unselectedChange, selectedFake];
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleFilterChange = (event) => {
    const filter = event.target.value || "";
    const selection = getSelection();
    setShowPagination(!filter);
    setGlobalFilter(filter);
    if (filter) {
      setContactsToShow(selection);
      return;
    }
    setContactsToShow(selection.slice(0, NUM_CONTACTS_PER_PAGE));
    setPages(getNumPages(selection));
    setPage(1);
  };

  const handleAddRow = () => {
    if (
      contactsToShow[0] &&
      UNREGISTERED_CONTACT.isOfType(contactsToShow[0].thing)
    ) {
      return;
    }
    const newItem = createUnregisteredContact();
    const newContacts = [newItem, ...getSelection()];
    setPages(getNumPages(newContacts));
    setPage(1);
    setContactsToShow(newContacts.slice(0, NUM_CONTACTS_PER_PAGE));
  };

  const toggleCheckbox = (event, model) => {
    const [
      selectedChange,
      unselectedChange,
      selectionFakeChange,
    ] = getChangedSelection(model, event.target.checked);
    selectedContacts.current = selectedChange;
    unselectedContacts.current = unselectedChange;
    onChange(
      getFinalChangeMap(selectedChange, false),
      getFinalChangeMap(unselectedChange, true)
    );
    setSelectedFake(selectionFakeChange);
  };

  const handleNewAgentSubmit = async (agentUrl) => {
    const agentDatasetUrl = getBaseUrl(agentUrl);
    const agentDataset = await getSolidDataset(agentDatasetUrl, { fetch });
    const agentThing = getThing(agentDataset, agentUrl);
    const tempAgent = createTempContact(agentThing, agentDataset);
    const newContacts = [tempAgent, ...contactsToShow.slice(1)];
    setPages(getNumPages(newContacts));
    setPage(1);
    setContactsToShow(newContacts.slice(0, NUM_CONTACTS_PER_PAGE));
    const [selectedChange, unselectedChange] = getChangedSelection(
      tempAgent,
      true
    );
    selectedContacts.current = selectedChange;
    unselectedContacts.current = unselectedChange;
    setSelectedFake(selectedFake.concat(agentUrl));
    onChange(
      getFinalChangeMap(selectedChange, false),
      getFinalChangeMap(unselectedChange, true)
    );
  };

  const handlePaginationChange = (event, value) => {
    const start = NUM_CONTACTS_PER_PAGE * (value - 1);
    const end = NUM_CONTACTS_PER_PAGE * value;
    const selection = getSelection();
    setContactsToShow(selection.slice(start, end));
    setPages(getNumPages(selection));
    setPage(value);
  };

  return (
    <>
      <div className={bem("agent-multi-select-picker")}>
        <div
          className={bem(
            "agent-multi-select-picker__tabs-and-button-container"
          )}
        >
          <AgentsTableTabs
            handleTabChange={handleTabChange}
            selectedTabValue={tab}
            className={bem("agent-multi-select-picker__tabs")}
            tabsValues={{
              all: "",
              people: PERSON_CONTACT,
              groups: GROUP_CONTACT,
            }}
          />
          <MobileAgentsSearchBar handleFilterChange={handleFilterChange} />
          <AddWebIdButton
            onClick={handleAddRow}
            className={bem("agent-multi-select-picker__desktop-only")}
          />
        </div>
        <AgentsSearchBar handleFilterChange={handleFilterChange} />

        <AddWebIdButton
          onClick={handleAddRow}
          className={bem("agent-multi-select-picker__mobile-only")}
        />
        {!contactsToShow && (
          <Container variant="empty">
            <CircularProgress />
          </Container>
        )}
        {!!contactsToShow && contactsToShow?.length > 0 && (
          <Table
            things={contactsToShow}
            className={clsx(
              bem("table"),
              bem("agent-multi-select-picker__agent-table")
            )}
            filter={globalFilter}
          >
            <TableColumn
              property={VCARD_WEBID_PREDICATE}
              dataType="url"
              header={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <span
                  className={bem("agent-multi-select-picker__table-header")}
                >
                  {checkboxHeadLabel}
                </span>
              }
              body={() => (
                <MemberCheckbox
                  selected={selectedContacts.current}
                  disabled={disabled}
                  onChange={toggleCheckbox}
                />
              )}
            />
            <TableColumn
              header={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <span
                  className={bem("agent-multi-select-picker__table-header")}
                >
                  Name
                </span>
              }
              property={vcard.fn}
              filterable
              body={() => <MemberRow onNewAgentSubmit={handleNewAgentSubmit} />}
            />
          </Table>
        )}
        {contactsToShow.length === 0 &&
          (tab.searchNoResult ? (
            <span className={bem("agent-multi-select-picker__empty")}>
              <p>{tab.searchNoResult}</p>
            </span>
          ) : (
            <AgentPickerEmptyState onClick={handleAddRow} />
          ))}
      </div>
      {showPagination && (
        <Pagination
          count={pages}
          page={page}
          shape="rounded"
          onChange={handlePaginationChange}
        />
      )}
    </>
  );
}

AgentMultiSelectPicker.propTypes = {
  contacts: T.arrayOf(T.object),
  disabled: T.arrayOf(T.string),
  onChange: T.func.isRequired,
  selected: T.arrayOf(T.string).isRequired,
  checkboxHeadLabel: T.string,
};

AgentMultiSelectPicker.defaultProps = {
  contacts: [],
  disabled: [],
  checkboxHeadLabel: "Select",
};
