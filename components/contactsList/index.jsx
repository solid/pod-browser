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

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import T from "prop-types";
import { createStyles } from "@mui/core";
import { makeStyles } from "@mui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  DrawerContainer,
  PageHeader,
  Table as PrismTable,
} from "@inrupt/prism-react-components";
import {
  getSourceUrl,
  getStringNoLocale,
  getThing,
} from "@inrupt/solid-client";
import { Table, TableColumn, useSession } from "@inrupt/solid-ui-react";
import { vcard, foaf } from "rdf-namespaces";
import SortedTableCarat from "../sortedTableCarat";
import Spinner from "../spinner";
import styles from "./styles";

import useAddressBookOld from "../../src/hooks/useAddressBookOld";
import useContactsOld from "../../src/hooks/useContactsOld";
import useProfiles from "../../src/hooks/useProfiles";
import ContactsListSearch from "./contactsListSearch";
import ProfileLink from "../profileLink";
import AgentAvatar from "../agentAvatar";
import { SearchProvider } from "../../src/contexts/searchContext";
import { deleteContact, getWebIdUrl } from "../../src/addressBook";
import ContactsDrawer from "./contactsDrawer";
import ContactsEmptyState from "./contactsEmptyState";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

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

function ContactsList() {
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const classes = useStyles();
  const bem = useBem(classes);
  const actionClass = PageHeader.usePageHeaderActionClassName();
  const [search, setSearch] = useState("");

  const [addressBook, addressBookError] = useAddressBookOld();
  const {
    data: people,
    error: peopleError,
    mutate: peopleMutate,
  } = useContactsOld(addressBook, foaf.Person);
  const profiles = useProfiles(people);
  const formattedNamePredicate = foaf.name;
  const hasPhotoPredicate = vcard.hasPhoto;
  const {
    session: { fetch },
  } = useSession();

  const [selectedContactIndex, setSelectedContactIndex] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState("");
  const [selectedContactWebId, setSelectedContactWebId] = useState("");

  useEffect(() => {
    if (selectedContactIndex === null) return;
    const contactDataset = people[selectedContactIndex]?.dataset;
    const contactThingUrl = people[selectedContactIndex]?.iri;
    const contactThing = getThing(contactDataset, contactThingUrl);
    const webId = getWebIdUrl(contactDataset, contactThingUrl);
    const name =
      getStringNoLocale(contactThing, formattedNamePredicate) ||
      getStringNoLocale(contactThing, vcard.fn) ||
      webId;
    setSelectedContactName(name);
    setSelectedContactWebId(webId);
  }, [selectedContactIndex, formattedNamePredicate, people, fetch]);

  if (addressBookError) return addressBookError;
  if (peopleError) return peopleError;

  const isLoading = !addressBook || !people || !profiles;

  if (isLoading) return <Spinner />;

  // format things for the data table
  const contacts = profiles.map((p) => ({
    thing: p,
    dataset: addressBook,
  }));

  const closeDrawer = handleClose(setSelectedContactIndex);
  const deleteSelectedContact = handleDeleteContact({
    addressBook,
    closeDrawer,
    fetch,
    people,
    peopleMutate,
    selectedContactIndex,
  });
  const drawer = (
    <ContactsDrawer
      open={selectedContactIndex !== null}
      onClose={closeDrawer}
      onDelete={deleteSelectedContact}
      selectedContactName={selectedContactName}
      profileIri={selectedContactWebId}
      selectedContactWebId={selectedContactWebId}
    />
  );

  return (
    <SearchProvider setSearch={setSearch}>
      <PageHeader
        title="Contacts"
        actions={[
          <Link href="/contacts/add">
            <a className={actionClass}>Add new contact</a>
          </Link>,
        ]}
      >
        <ContactsListSearch people={profiles} />
      </PageHeader>
      {!contacts.length ? (
        <ContactsEmptyState />
      ) : (
        <DrawerContainer drawer={drawer} open={selectedContactIndex !== null}>
          <Table
            things={contacts}
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
                    contact === profiles[selectedContactIndex]
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
          </Table>
        </DrawerContainer>
      )}
    </SearchProvider>
  );
}

RowAvatar.propTypes = {
  value: T.string,
  row: T.shape({
    values: T.shape({
      col1: T.string,
    }),
  }),
};

RowAvatar.defaultProps = {
  value: null,
  row: null,
};

export default ContactsList;
