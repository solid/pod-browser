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

import React, { useContext, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import Link from "next/link";
import { getSourceUrl } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import Spinner from "../spinner";
import { findContactInAddressBook, saveContact } from "../../src/addressBook";
import useAddressBook from "../../src/hooks/useAddressBook";
import AgentSearchForm from "../agentSearchForm";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import AlertContext from "../../src/contexts/alertContext";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import styles from "./styles";
import { fetchProfile } from "../../src/solidClientHelpers/profile";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
export const EXISTING_WEBID_ERROR_MESSAGE =
  "That WebID is already in your contacts";
export const NO_NAME_ERROR_MESSAGE = "That WebID does not have a name";

export function handleSubmit({
  addressBook,
  setIsLoading,
  alertError,
  alertSuccess,
  fetch,
}) {
  return async (iri) => {
    setIsLoading(true);
    const addressBookIri = getSourceUrl(addressBook);

    const { name, webId } = await fetchProfile(iri, fetch);

    const existingContact = await findContactInAddressBook(
      addressBookIri,
      webId,
      fetch
    );

    if (existingContact.length) {
      alertError(EXISTING_WEBID_ERROR_MESSAGE);
      setIsLoading(false);
      return;
    }

    if (name) {
      const contact = { webId, fn: name };
      const { response, error } = await saveContact(
        addressBookIri,
        contact,
        fetch
      );

      if (error) alertError(error);
      if (response) alertSuccess(`${contact.fn} was added to your contacts`);
    } else {
      alertError(NO_NAME_ERROR_MESSAGE);
    }
    setIsLoading(false);
  };
}

export default function AddContact() {
  useRedirectIfLoggedOut();
  const { alertSuccess, alertError } = useContext(AlertContext);
  const { session } = useSession();
  const { fetch } = session;
  const {
    info: { webId },
  } = session;
  const { menuOpen } = useContext(DetailsMenuContext);
  const bem = useBem(useStyles());
  const containerClass = clsx(
    bem("container"),
    bem("container-view", menuOpen ? "menu-open" : null)
  );
  const [addressBook] = useAddressBook();
  const [isLoading, setIsLoading] = useState(false);
  if (!webId || isLoading) return <Spinner />;

  const onSubmit = handleSubmit({
    addressBook,
    setIsLoading,
    alertError,
    alertSuccess,
    fetch,
    webId,
  });

  return (
    <div className={containerClass}>
      <Link href="/contacts" replace>
        &lt; Back to contacts
      </Link>
      <h3>Add new contact</h3>

      <AgentSearchForm
        heading="Add contact using Web ID"
        onSubmit={onSubmit}
        buttonText="Add Contact"
      />
    </div>
  );
}
