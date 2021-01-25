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

import {
  addStringNoLocale,
  addUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
} from "@inrupt/solid-client";
import { acl, dc, rdf } from "rdf-namespaces";
import {
  getAddressBookGroupIndexUrl,
  getAddressBookMainIndexUrl,
  getAddressBookPersonIndexUrl,
} from "../src/models/addressBook";
import { vcardExtras } from "../src/addressBook";
import { chain } from "../src/solidClientHelpers/utils";
import { aliceWebIdUrl } from "./mockPersonResource";

export default function mockAddressBook(options = {}) {
  const containerIri =
    options.containerIri || "https://user.example.com/contacts";
  const owner = options.owner || aliceWebIdUrl;

  const indexUrl = getAddressBookMainIndexUrl({ containerIri });
  const groupsUrl = getAddressBookGroupIndexUrl({ containerIri });
  const peopleUrl = getAddressBookPersonIndexUrl({ containerIri });

  const mainIndexIri = `${indexUrl}#this`;
  return {
    containerIri,
    index: {
      iri: mainIndexIri,
      dataset: chain(mockSolidDatasetFrom(indexUrl), (d) =>
        setThing(
          d,
          chain(
            mockThingFrom(mainIndexIri),
            (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
            (t) => addUrl(t, acl.owner, owner),
            (t) => addStringNoLocale(t, dc.title, "Contacts"),
            (t) => addUrl(t, vcardExtras("nameEmailIndex"), peopleUrl),
            (t) => addUrl(t, vcardExtras("groupIndex"), groupsUrl)
          )
        )
      ),
    },
    groups: {
      iri: groupsUrl,
      dataset: mockSolidDatasetFrom(groupsUrl),
    },
    people: {
      iri: peopleUrl,
      dataset: mockSolidDatasetFrom(peopleUrl),
    },
  };
}
