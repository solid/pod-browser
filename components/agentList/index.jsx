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

import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  DrawerContainer,
  Table as PrismTable,
} from "@inrupt/prism-react-components";
import { getSourceUrl, getStringNoLocale, getUrl } from "@inrupt/solid-client";
import { Table, TableColumn, useSession } from "@inrupt/solid-ui-react";
import { vcard, foaf, schema, rdf } from "rdf-namespaces";
import SortedTableCarat from "../sortedTableCarat";
import Spinner from "../spinner";
import AgentAvatar from "../agentAvatar";
import styles from "./styles";

import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import useAddressBookOld from "../../src/hooks/useAddressBookOld";
import useContactsOld from "../../src/hooks/useContactsOld";
import { mockApp } from "../../__testUtils/mockApp";
import useProfiles from "../../src/hooks/useProfiles";
import ProfileLink from "../profileLink";
import SearchContext from "../../src/contexts/searchContext";
import { deleteContact, vcardExtras } from "../../src/addressBook";
import ContactsEmptyState from "../contactsList/contactsEmptyState";
import AgentsDrawer from "./agentsDrawer";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

// temporarily using mock data for apps for dev purposes until we have audit list
const app = mockApp();
export function handleClose(setSelectedContactIndex) {
  return () => setSelectedContactIndex(null);
}

const RowAvatar = ({ value, row }) => (
  <AgentAvatar altText={row.values.col1} imageUrl={value} />
);

export function handleDeleteContact({
  addressBook,
  closeDrawer,
  fetch,
  people,
  peopleMutate,
  selectedContactIndex,
}) {
  return async () => {
    const selectedContact = people[selectedContactIndex];

    await deleteContact(
      getSourceUrl(addressBook),
      selectedContact,
      foaf.Person,
      fetch
    );
    peopleMutate();
    closeDrawer();
  };
}

function AgentList({ contactType, setSearchValues }) {
  useRedirectIfLoggedOut();
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const [agentType, setAgentType] = useState(null);
  const classes = useStyles();
  const bem = useBem(classes);
  const { search } = useContext(SearchContext);

  const [addressBook, addressBookError] = useAddressBookOld();
  const {
    data: contacts,
    error: contactsError,
    mutate: contactsMutate,
  } = useContactsOld(addressBook, foaf.Person);
  const profiles = useProfiles(contacts);
  const [profilesForTable, setProfilesForTable] = useState([]);

  // FIXME: temporarily doing this manually for dev purposes until we have audit list
  useEffect(() => {
    if (profiles) {
      setProfilesForTable(profiles);
    }
    if (contactType === "all") {
      setProfilesForTable(profiles ? [...profiles, app] : [app]);
    }
    if (contactType === schema.SoftwareApplication) {
      setProfilesForTable([app]);
    }
  }, [profiles, contactType]);

  const formattedNamePredicate = vcard.fn;
  const hasPhotoPredicate = vcard.hasPhoto;

  const {
    session: { fetch },
  } = useSession();

  const [selectedContactIndex, setSelectedContactIndex] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState("");
  const [selectedContactWebId, setSelectedContactWebId] = useState("");

  useEffect(() => {
    if (!contacts) return;
    setSearchValues(contacts);
  }, [contacts, setSearchValues]);

  useEffect(() => {
    if (selectedContactIndex === null) return;
    const contactThing = profilesForTable[selectedContactIndex];
    const name = getStringNoLocale(contactThing, formattedNamePredicate);
    const type = getUrl(contactThing, rdf.type);
    setAgentType(type);
    setSelectedContactName(name);
    const webId = getUrl(contactThing, vcardExtras("WebId"));
    setSelectedContactWebId(webId);
  }, [selectedContactIndex, formattedNamePredicate, profilesForTable, fetch]);

  if (addressBookError) return addressBookError;
  if (contactsError) return contactsError;

  const isLoading = !addressBook;

  if (isLoading) return <Spinner />;

  // format things for the data table
  const contactsForTable = profilesForTable.map((p) => ({
    thing: p,
    dataset: addressBook,
    type: contactType,
  }));

  const closeDrawer = handleClose(setSelectedContactIndex);
  const deleteSelectedContact = handleDeleteContact({
    addressBook,
    closeDrawer,
    fetch,
    contacts,
    contactsMutate,
    selectedContactIndex,
  });

  const drawer = (
    <AgentsDrawer
      open={selectedContactIndex !== null}
      onClose={closeDrawer}
      onDelete={deleteSelectedContact}
      agentType={agentType}
      selectedContactName={selectedContactName}
      profileIri={selectedContactWebId}
    />
  );

  if (!contactsForTable.length) {
    return <ContactsEmptyState />;
  }
  return (
    <DrawerContainer drawer={drawer} open={selectedContactIndex !== null}>
      <Table
        things={contactsForTable}
        className={clsx(tableClass, bem("table"))}
        filter={search}
        ascIndicator={<SortedTableCarat sorted />}
        descIndicator={<SortedTableCarat sorted sortedDesc />}
        getRowProps={(row, contact) => {
          return {
            tabIndex: "0",
            className: clsx(
              bem(
                "table__body-row",
                "selectable",
                contact === profilesForTable[selectedContactIndex]
                  ? "selected"
                  : null
              )
            ),
            onKeyUp: (event) => {
              if (event.key === "Enter") setSelectedContactIndex(row.index);
            },
            onClick: () => {
              setSelectedContactIndex(row.index);
            },
          };
        }}
      >
        <TableColumn
          property={hasPhotoPredicate}
          header=""
          dataType="url"
          body={RowAvatar}
        />
        <TableColumn
          property={formattedNamePredicate}
          header="Name"
          filterable
          sortable
          body={ProfileLink}
        />
        <TableColumn
          property={vcardExtras("WebId")}
          header="WebID"
          dataType="url"
          filterable
          sortable
        />
      </Table>
    </DrawerContainer>
  );
}

AgentList.propTypes = {
  contactType: PropTypes.string,
  setSearchValues: PropTypes.func.isRequired,
};

AgentList.defaultProps = {
  contactType: "",
};

RowAvatar.propTypes = {
  value: PropTypes.string,
  row: PropTypes.shape({
    values: PropTypes.shape({
      col1: PropTypes.string,
    }),
  }),
};

RowAvatar.defaultProps = {
  value: null,
  row: null,
};

export default AgentList;
