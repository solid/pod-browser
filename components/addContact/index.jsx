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

import { useContext } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import Link from "next/link";
import { getStringNoLocale, getUrl } from "@inrupt/solid-client";
import { vcard, foaf, space } from "rdf-namespaces";
import Spinner from "../spinner";
import { saveContact } from "../../src/addressBook";
import { getResource } from "../../src/solidClientHelpers/resource";
import { joinPath } from "../../src/stringHelpers";
import AgentSearchForm from "../agentSearchForm";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import AlertContext from "../../src/contexts/alertContext";
import SessionContext from "../../src/contexts/sessionContext";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function handleSubmit({ alertError, alertSuccess, fetch, webId }) {
  return async (iri) => {
    const { response: userProfile } = await getResource(webId, fetch);
    const pod = getUrl(userProfile.dataset, space.storage);

    const { response: profile, error: profileError } = await getResource(
      iri,
      fetch
    );

    if (profileError) alertError(profileError);
    if (profile) {
      const contact = { webId: iri };
      const name = getStringNoLocale(profile.dataset, foaf.name);
      const fn = getStringNoLocale(profile.dataset, vcard.fn);

      if (name) contact.fn = name;
      if (fn) contact.fn = fn;

      if (contact.fn) {
        const addressBookIri = joinPath(pod, "contacts/");
        const { response, error } = await saveContact(
          addressBookIri,
          contact,
          fetch
        );

        if (error) alertError(error);
        if (response) alertSuccess(`${contact.fn} was added to your contacts`);
      } else {
        alertError("That webId does not have a name");
      }
    }
  };
}

export default function AddContact() {
  useRedirectIfLoggedOut();
  const { alertSuccess, alertError } = useContext(AlertContext);
  const { session } = useContext(SessionContext);
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

  if (!webId) return <Spinner />;

  const onSubmit = handleSubmit({
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
