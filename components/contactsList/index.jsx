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

import React, { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Avatar, createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  Container,
  PageHeader,
  Table as PrismTable,
} from "@inrupt/prism-react-components";
import { Table, TableColumn } from "@inrupt/solid-ui-react";
import { vcard } from "rdf-namespaces";
import SortedTableCarat from "../sortedTableCarat";
import Spinner from "../spinner";
import styles from "./styles";

import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import useAddressBook from "../../src/hooks/useAddressBook";
import usePeople from "../../src/hooks/usePeople";
import ContactsListSearch from "./contactsListSearch";
import { SearchProvider } from "../../src/contexts/searchContext";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function ContactsList() {
  useRedirectIfLoggedOut();

  const tableClass = PrismTable.useTableClass("table", "inherits");
  const classes = useStyles();
  const bem = useBem(classes);
  const actionClass = PageHeader.usePageHeaderActionClassName();
  const [search, setSearch] = useState("");

  const [addressBook, addressBookError] = useAddressBook();
  const [people, peopleError] = usePeople(addressBook);
  const isLoading =
    (!addressBook && !addressBookError) || (!people && !peopleError);

  if (isLoading) return <Spinner />;
  if (addressBookError) return addressBookError;
  if (peopleError) return peopleError;

  const formattedNamePredicate = vcard.fn;
  const hasPhotoPredicate = vcard.hasPhoto;

  const ascIndicator = (
    <>
      {` `}
      <SortedTableCarat sorted />
    </>
  );
  const descIndicator = (
    <>
      {" "}
      <SortedTableCarat sorted sortedDesc />
    </>
  );

  // format things for the data table
  const contacts = people.map((p) => ({
    thing: p,
    dataset: addressBook,
  }));

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
        <ContactsListSearch people={people} />
      </PageHeader>
      <Container>
        <Table
          things={contacts}
          className={clsx(tableClass, bem("table"))}
          filter={search}
          ascIndicator={ascIndicator}
          descIndicator={descIndicator}
        >
          <TableColumn
            property={hasPhotoPredicate}
            header=""
            datatype="url"
            body={({ value }) => {
              return (
                <Avatar
                  className={bem("avatar")}
                  alt="Contact avatar"
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
      </Container>
    </SearchProvider>
  );
}

ContactsList.propTypes = {};

ContactsList.defaultProps = {};

export default ContactsList;
