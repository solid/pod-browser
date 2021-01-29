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
  createSolidDataset,
  createThing,
  getSolidDataset,
  getSourceUrl,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { acl, dc, rdf } from "rdf-namespaces";
import { joinPath } from "../../stringHelpers";
import { chain } from "../../solidClientHelpers/utils";
import { ERROR_CODES, isHTTPError } from "../../error";
import { vcardExtras } from "../../addressBook";

/**
 * @typedef AddressBook
 * @type {object}
 * @property {string} containerIri - The address to the container
 * @property {object} dataset - The dataset the main index is stored in
 * @property {object} thing - The thing that represents the main index itself
 */

/* Model constants */
const CONTACTS_CONTAINER = "contacts/";

export const ADDRESS_BOOK_ERROR_ALREADY_EXIST = "Address book already exists.";
export const ADDRESS_BOOK_ERROR_NO_MAIN_INDEX = "Unable to load main index";
export const ADDRESS_BOOK_ERROR_NO_PERMISSION_TO_CREATE =
  "You do not have permission to create an address book";

/* Model functions */
export function getAddressBookContainerIri(podRootIri) {
  return joinPath(podRootIri, CONTACTS_CONTAINER);
}

export function getAddressBookIndexDefaultUrl(containerIri) {
  return joinPath(containerIri, "index.ttl");
}

export function getAddressBookIndexUrl(addressBook) {
  return (
    getSourceUrl(addressBook.dataset) ||
    getAddressBookIndexDefaultUrl(addressBook.containerIri)
  );
}

export function createAddressBook(containerIri, owner, title = "Contacts") {
  const thing = chain(
    createThing({ name: "this" }),
    (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
    (t) => addUrl(t, acl.owner, owner),
    (t) => addStringNoLocale(t, dc.title, title)
  );
  return {
    containerIri,
    dataset: setThing(createSolidDataset(), thing),
    thing,
  };
}

export async function loadAddressBook(containerIri, fetch) {
  const mainIndexUrl = getAddressBookIndexDefaultUrl(containerIri);
  const mainIndexDataset = await getSolidDataset(mainIndexUrl, { fetch });
  const mainIndexThingUrl = `${mainIndexUrl}#this`;
  const mainIndex = getThing(mainIndexDataset, mainIndexThingUrl);
  if (!mainIndex) {
    throw new Error(ADDRESS_BOOK_ERROR_NO_MAIN_INDEX);
  }
  return {
    containerIri,
    dataset: mainIndexDataset,
    thing: mainIndex,
  };
}

export async function saveNewAddressBook(
  containerIri,
  owner,
  fetch,
  title = "Contacts"
) {
  try {
    await getSolidDataset(containerIri, { fetch });
    throw new Error(ADDRESS_BOOK_ERROR_ALREADY_EXIST);
  } catch (error) {
    if (!isHTTPError(error, ERROR_CODES.NOT_FOUND)) throw error;
  }

  const newAddressBook = createAddressBook(containerIri, owner, title);
  const mainIndexUrl = getAddressBookIndexUrl(newAddressBook);

  try {
    const dataset = await saveSolidDatasetAt(
      mainIndexUrl,
      newAddressBook.dataset,
      {
        fetch,
      }
    );
    const thing = getThing(dataset, `${getSourceUrl(dataset)}#this`);
    return { containerIri, dataset, thing };
  } catch (error) {
    if (isHTTPError(error, ERROR_CODES.UNAUTHORIZED)) {
      throw new Error(ADDRESS_BOOK_ERROR_NO_PERMISSION_TO_CREATE);
    }
    throw error;
  }
}
