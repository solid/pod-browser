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

import clsx from "clsx";
import Link from "next/link";
import { Avatar } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { useContext, useState, useEffect } from "react";
import { PageHeader } from "@inrupt/prism-react-components";
import Spinner from "../spinner";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import SessionContext from "../../src/contexts/sessionContext";
import styles from "./styles";
import { getResource } from "../../src/solidClientHelpers/resource";
import { isHTTPError, ERROR_CODES } from "../../src/solidClientHelpers/utils";
import { fetchProfile } from "../../src/solidClientHelpers/profile";
import {
  saveNewAddressBook,
  contactsContainerIri,
  getPeople,
} from "../../src/addressBook";

import { useRedirectIfLoggedOut } from "../../src/effects/auth";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function ContactsList() {
  useRedirectIfLoggedOut();

  const classes = useStyles();
  const bem = useBem(classes);
  const { menuOpen } = useContext(DetailsMenuContext);
  const actionClass = PageHeader.actionClassName();
  const containerClass = clsx(
    bem("container"),
    bem("container-view", menuOpen ? "menu-open" : null)
  );
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [addressBook, setAddressBook] = useState();
  const [addressBookError, setAddressBookError] = useState();
  const [contacts, setContacts] = useState([]);
  const { session } = useContext(SessionContext);
  const {
    fetch,
    info: { webId },
  } = session;

  useEffect(() => {
    if (!webId || addressBookError || addressBook) return;

    (async () => {
      const { pods } = await fetchProfile(webId, fetch);
      const contactsIri = contactsContainerIri(pods[0]);

      const {
        response: existingAddressBook,
        error: existingError,
      } = await getResource(contactsIri, fetch);

      if (existingError && !isHTTPError(existingError, ERROR_CODES.NOT_FOUND)) {
        setLoadingContacts(false);
        return;
      }

      if (existingAddressBook) {
        setAddressBook(existingAddressBook);
        setLoadingContacts(false);
        const { response: people, error: peopleError } = await getPeople(
          contactsIri,
          fetch
        );
        if (peopleError) {
          setAddressBookError(peopleError);
          return;
        }

        setContacts(people);

        return;
      }

      const { response: newAddressBook, error } = await saveNewAddressBook(
        {
          iri: contactsIri,
          owner: webId,
        },
        fetch
      );

      setAddressBook(newAddressBook);
      setLoadingContacts(false);
      setAddressBookError(error);
    })();
  }, [
    webId,
    setLoadingContacts,
    setAddressBookError,
    setAddressBook,
    fetch,
    addressBook,
    addressBookError,
  ]);

  if (loadingContacts) return <Spinner />;
  if (addressBookError) return addressBookError;

  return (
    <>
      <PageHeader
        title="Contacts"
        actions={[
          <Link href="/contacts/add">
            <a className={actionClass}>Add new contact</a>
          </Link>,
        ]}
      />
      <div className={containerClass}>
        <table className={bem("table")}>
          <tbody className={bem("table__body")}>
            {contacts.map(({ name, avatar }) => (
              <tr className={bem("table__body-row")}>
                <td
                  className={clsx(
                    bem("table__body-cell"),
                    bem("table__body-cell--align-end"),
                    bem("table__body-cell--width-preview")
                  )}
                >
                  <Avatar className={bem("avatar")} alt={name} src={avatar} />
                </td>
                <td>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

ContactsList.propTypes = {};

ContactsList.defaultProps = {};

export default ContactsList;
