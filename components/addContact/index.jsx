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
import { BackToNav, BackToNavLink } from "@inrupt/prism-react-components";
import clsx from "clsx";
import Link from "next/link";
import { useSession } from "@inrupt/solid-ui-react";
import { foaf } from "rdf-namespaces";
import Spinner from "../spinner";
import { findContactInAddressBook, saveContact } from "../../src/addressBook";
import useAddressBook from "../../src/hooks/useAddressBook";
import AgentSearchForm from "../agentSearchForm";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import AlertContext from "../../src/contexts/alertContext";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import styles from "./styles";
import { fetchProfile } from "../../src/solidClientHelpers/profile";
import useContacts from "../../src/hooks/useContacts";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
export const EXISTING_WEBID_ERROR_MESSAGE =
  "That WebID is already in your contacts";
export const NO_NAME_ERROR_MESSAGE = "That WebID does not have a name";
export const FETCH_PROFILE_FAILED_ERROR_MESSAGE =
  "Unable to retrieve a profile from the given WebID";

export function handleSubmit({
  addressBook,
  setAgentId,
  setIsLoading,
  alertError,
  alertSuccess,
  session,
  setDirtyForm,
  peopleMutate,
  people,
}) {
  return async (iri) => {
    const { fetch } = session;
    setDirtyForm(true);
    if (!iri) {
      return;
    }
    if (iri === session.info.webId) {
      alertError("You cannot add yourself as a contact");
    }
    setIsLoading(true);

    try {
      const { name, webId, types } = await fetchProfile(iri, fetch);
      const existingContact = await findContactInAddressBook(
        people,
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
          addressBook,
          contact,
          types,
          fetch
        );

        if (error) alertError(error);
        if (response) {
          alertSuccess(`${contact.fn} was added to your contacts`);
          setAgentId("");
          peopleMutate();
        }
      } else {
        alertError(NO_NAME_ERROR_MESSAGE);
      }
    } catch {
      alertError(FETCH_PROFILE_FAILED_ERROR_MESSAGE);
    }
    setIsLoading(false);
    setDirtyForm(false);
  };
}

export default function AddContact() {
  useRedirectIfLoggedOut();
  const { alertSuccess, alertError } = useContext(AlertContext);
  const { session } = useSession();
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
  const [agentId, setAgentId] = useState("");
  const [dirtyForm, setDirtyForm] = useState(false);
  const {
    data: people,
    error: peopleError,
    mutate: peopleMutate,
  } = useContacts(addressBook, foaf.Person);

  if (peopleError) alertError(peopleError);

  if (!webId || isLoading) return <Spinner />;

  const onSubmit = handleSubmit({
    addressBook,
    setAgentId,
    setIsLoading,
    alertError,
    alertSuccess,
    session,
    setDirtyForm,
    peopleMutate,
    people,
  });

  const handleChange = (newValue) => {
    setAgentId(newValue);
  };

  const link = (
    <Link href="/contacts" passHref>
      <BackToNavLink>contacts</BackToNavLink>
    </Link>
  );

  return (
    <div className={containerClass}>
      <BackToNav link={link} />

      <h3>Add new contact</h3>

      <AgentSearchForm
        type="contacts"
        onChange={handleChange}
        onSubmit={onSubmit}
        buttonText="Add Contact"
        value={agentId}
        dirtyForm={dirtyForm}
      />
    </div>
  );
}
