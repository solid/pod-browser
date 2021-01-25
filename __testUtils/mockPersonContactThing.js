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

import { addUrl, mockThingFrom, setThing, setUrl } from "@inrupt/solid-client";
import { vcard, rdf, foaf } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";
import { vcardExtras } from "../src/addressBook";

export const webIdUrl = "http://example.com/alice#me";

export function addContactsToAddressBook(addressBook, contactsToAdd) {
  // TODO: Should probably be moved to a separate mockContact.js
  const { people, ...rest } = addressBook;
  return {
    ...rest,
    people: {
      iri: addressBook.people.iri,
      dataset: chain(
        addressBook.groups.dataset,
        ...contactsToAdd.map((contactThing) => (d) =>
          setThing(
            d,
            chain(contactThing, (t) =>
              setUrl(t, vcardExtras("inAddressBook"), addressBook.index.iri)
            )
          )
        )
      ),
    },
  };
}

export default function mockPersonContactThing(url = webIdUrl) {
  return chain(
    mockThingFrom(url),
    (t) => addUrl(t, rdf.type, vcard.Individual),
    (t) => addUrl(t, foaf.openid, webIdUrl)
  );
}
