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
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { useContext, useState, useEffect } from "react";
import Spinner from "../spinner";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import SessionContext from "../../src/contexts/sessionContext";
import styles from "./styles";
import { getResource } from "../../src/solidClientHelpers/resource";
import { isHTTPError, ERROR_CODES } from "../../src/solidClientHelpers/utils";
import { fetchProfile } from "../../src/solidClientHelpers/profile";
import { joinPath } from "../../src/stringHelpers";
import { saveNewAddressBook } from "../../src/addressBook";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";

function ContactsList() {
  useRedirectIfLoggedOut();

  const useStyles = makeStyles((theme) => createStyles(styles(theme)));
  const bem = useBem(useStyles());
  const { menuOpen } = useContext(DetailsMenuContext);
  const containerClass = clsx(
    bem("container"),
    bem("container-view", menuOpen ? "menu-open" : null)
  );
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [addressBook, setAddressBook] = useState();
  const [addressBookError, setAddressBookError] = useState();
  const { session } = useContext(SessionContext);

  const {
    fetch,
    info: { webId },
  } = session;

  useEffect(() => {
    if (!webId || addressBookError || addressBook) return;

    (async () => {
      const { pods } = await fetchProfile(webId, fetch);
      if (!pods) return;

      const contactsIri = joinPath(pods[0], "contacts/");

      const {
        response: existingAddressBook,
        error: existingError,
      } = await getResource(contactsIri, fetch);

      if (existingError && !isHTTPError(existingError, ERROR_CODES.NOT_FOUND)) {
        setLoadingContacts(false);
        setAddressBookError(existingError);
        return;
      }

      if (existingAddressBook) {
        setAddressBook(existingAddressBook);
        setLoadingContacts(false);
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
    <div className={containerClass}>
      <Link href="/contacts/add" replace>
        Add
      </Link>
    </div>
  );
}

ContactsList.propTypes = {};

ContactsList.defaultProps = {};

export default ContactsList;
