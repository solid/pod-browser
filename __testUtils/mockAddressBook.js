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
import { acl, dc, foaf, rdf, vcard } from "rdf-namespaces";
import {
  getAddressBookIndexDefaultUrl,
  vcardExtras,
} from "../src/models/addressBook";
import { chain } from "../src/solidClientHelpers/utils";
import { aliceWebIdUrl } from "./mockPersonResource";

const defaultContainerIri = "https://user.example.com/contacts";

export function mockAddressBookThing(options = {}) {
  const containerIri = options.containerIri || defaultContainerIri;
  const owner = options.owner || aliceWebIdUrl;
  const indexUrl =
    options.indexUrl || getAddressBookIndexDefaultUrl(containerIri);
  const groupsUrl =
    options.groupsUrl ??
    getAddressBookIndexDefaultUrl(containerIri, vcard.Group);
  const peopleUrl =
    options.peopleUrl ??
    getAddressBookIndexDefaultUrl(containerIri, foaf.Person);
  const mainIndexIri = `${indexUrl}#this`;
  return chain(
    mockThingFrom(mainIndexIri),
    (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
    (t) => addUrl(t, acl.owner, owner),
    (t) => addStringNoLocale(t, dc.title, "Contacts"),
    ...(peopleUrl
      ? [(t) => addUrl(t, vcardExtras("nameEmailIndex"), peopleUrl)]
      : []),
    ...(groupsUrl
      ? [(t) => addUrl(t, vcardExtras("groupIndex"), groupsUrl)]
      : [])
  );
}

export function mockAddressBookDataset(
  options = {},
  thing = mockAddressBookThing(options)
) {
  const containerIri = options.containerIri || defaultContainerIri;
  const indexUrl =
    options.indexUrl || getAddressBookIndexDefaultUrl(containerIri);
  return chain(mockSolidDatasetFrom(indexUrl), (d) => setThing(d, thing));
}

export default function mockAddressBook(options = {}) {
  const containerIri = options.containerIri || defaultContainerIri;
  const thing = mockAddressBookThing(options);
  return {
    containerIri,
    thing,
    dataset: mockAddressBookDataset(options, thing),
  };
}
