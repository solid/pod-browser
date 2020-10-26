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
import { Avatar, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  DrawerContainer,
  PageHeader,
  Table as PrismTable,
} from "@inrupt/prism-react-components";
import { getSourceUrl, getStringNoLocale } from "@inrupt/solid-client";
import { Table, TableColumn, useSession } from "@inrupt/solid-ui-react";
import { vcard } from "rdf-namespaces";
import SortedTableCarat from "../sortedTableCarat";
import Spinner from "../spinner";
import styles from "./styles";

import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import useAddressBook from "../../src/hooks/useAddressBook";
import usePeople from "../../src/hooks/usePeople";
import useProfiles from "../../src/hooks/useProfiles";
import { SearchProvider } from "../../src/contexts/searchContext";
import { deleteContact } from "../../src/addressBook";
import ContactsDrawer from "./contactsDrawer";
import ContactsListSearch from "./contactsListSearch";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function handleClose(setSelectedContactIndex) {
  return () => setSelectedContactIndex(null);
}

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
    await deleteContact(getSourceUrl(addressBook), selectedContact, fetch);
    peopleMutate();
    closeDrawer();
  };
}

function ContactsList() {
  useRedirectIfLoggedOut();

  const tableClass = PrismTable.useTableClass("table", "inherits");
  const classes = useStyles();
  const bem = useBem(classes);
  const actionClass = PageHeader.usePageHeaderActionClassName();
  const [search, setSearch] = useState("");

  const [addressBook, addressBookError] = useAddressBook();
  const { data: people, error: peopleError, mutate: peopleMutate } = usePeople(
    addressBook
  );
  const profiles = useProfiles(people);
  const formattedNamePredicate = vcard.fn;
  const hasPhotoPredicate = vcard.hasPhoto;

  const {
    session: { fetch },
  } = useSession();

  const [selectedContactIndex, setSelectedContactIndex] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState("");
  useEffect(() => {
    if (selectedContactIndex === null) return;
    const name = getStringNoLocale(
      people[selectedContactIndex].dataset,
      formattedNamePredicate
    );
    setSelectedContactName(name);
  }, [selectedContactIndex, formattedNamePredicate, people]);

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
      <DrawerContainer drawer={drawer} open={selectedContactIndex !== null}>
        <Table
          things={contacts}
          className={clsx(tableClass, bem("table"))}
          filter={search}
          ascIndicator={<SortedTableCarat sorted />}
          descIndicator={<SortedTableCarat sorted sortedDesc />}
          getRowProps={(row, contact) => {
            return {
              className: clsx(
                bem(
                  "table__body-row",
                  "selectable",
                  contact === profiles[selectedContactIndex] ? "selected" : null
                )
              ),
              onClick: () => {
                setSelectedContactIndex(row.index);
              },
            };
          }}
        >
          <TableColumn
            property={hasPhotoPredicate}
            header=""
            datatype="url"
            body={({ value, row }) => {
              return (
                <Avatar
                  className={bem("avatar")}
                  alt={row.values.col1 || "Contact avatar"}
                  src={value}
                />
              );
            }}
          />
          <TableColumn
            property={formattedNamePredicate}
            header="Name"
            filterable
            sortable
          />
        </Table>
      </DrawerContainer>
    </SearchProvider>
  );
}

ContactsList.propTypes = {};

ContactsList.defaultProps = {};

export default ContactsList;
