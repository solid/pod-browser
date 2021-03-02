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
  asUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getSourceUrl,
  getThing,
  setThing,
} from "@inrupt/solid-client";
import { acl, dc, rdf } from "rdf-namespaces";
import { joinPath } from "../../stringHelpers";
import { chain } from "../../solidClientHelpers/utils";
import { vcardExtras } from "../../addressBook";

/*
 * AddressBook is our Pod-wide accessible source for contacts
 */

/* Model constants */
export const CONTACTS_CONTAINER = "contacts/";
export const INDEX_FILE = "index.ttl";
export const ADDRESS_BOOK_ERROR_NO_MAIN_INDEX = "Unable to load main index";

/* Model functions */
export function getAddressBookContainerUrl(podRootUrl) {
  return joinPath(podRootUrl, CONTACTS_CONTAINER);
}

export function getAddressBookIndexDefaultUrl(containerUrl) {
  return joinPath(containerUrl, INDEX_FILE);
}

export function getAddressBookThingUrl(addressBook) {
  try {
    return asUrl(addressBook.thing);
  } catch {
    return `${getAddressBookIndexDefaultUrl(addressBook.containerUrl)}#this`;
  }
}

export function getAddressBookDatasetUrl(addressBook) {
  return (
    getSourceUrl(addressBook.dataset) ||
    getAddressBookIndexDefaultUrl(addressBook.containerUrl)
  );
}

export function createAddressBook(containerUrl, owner, title = "Contacts") {
  const thing = chain(
    createThing({ name: "this" }),
    (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
    (t) => addUrl(t, acl.owner, owner),
    (t) => addStringNoLocale(t, dc.title, title)
  );
  return {
    containerUrl,
    dataset: setThing(createSolidDataset(), thing),
    thing,
  };
}

export async function loadAddressBook(containerUrl, fetch) {
  const mainIndexUrl = getAddressBookIndexDefaultUrl(containerUrl);
  const mainIndexDataset = await getSolidDataset(mainIndexUrl, { fetch });
  const mainIndexThingUrl = `${mainIndexUrl}#this`;
  const mainIndex = getThing(mainIndexDataset, mainIndexThingUrl);
  if (!mainIndex) {
    throw new Error(ADDRESS_BOOK_ERROR_NO_MAIN_INDEX);
  }
  return {
    containerUrl,
    dataset: mainIndexDataset,
    thing: mainIndex,
  };
}
