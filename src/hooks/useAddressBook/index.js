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

import { useContext, useEffect, useState } from "react";
import SessionContext from "../../contexts/sessionContext";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import { contactsContainerIri, saveNewAddressBook } from "../../addressBook";
import { getResource } from "../../solidClientHelpers/resource";
import { ERROR_CODES, isHTTPError } from "../../solidClientHelpers/utils";

export default function useAddressBook() {
  const [addressBook, setAddressBook] = useState(null);
  const [error, setError] = useState(null);
  const { session } = useContext(SessionContext);
  const profile = useAuthenticatedProfile();

  useEffect(() => {
    if (!session.info.isLoggedIn || !profile) return;
    const { pods, webId } = profile;
    const { fetch } = session;
    const contactsIri = contactsContainerIri(pods[0]);

    (async () => {
      const {
        response: existingAddressBook,
        error: existingError,
      } = await getResource(contactsIri, fetch);

      if (existingAddressBook) {
        setAddressBook(existingAddressBook.dataset);
        return;
      }

      if (existingError && isHTTPError(existingError, ERROR_CODES.NOT_FOUND)) {
        const {
          response: newAddressBook,
          error: newError,
        } = await saveNewAddressBook(
          {
            iri: contactsIri,
            owner: webId,
          },
          fetch
        );
        if (newError) {
          setError(newError);
          return;
        }
        setAddressBook(newAddressBook.index);
        return;
      }
      setError(existingError);
    })();
  }, [session, profile]);

  return [addressBook, error];
}
