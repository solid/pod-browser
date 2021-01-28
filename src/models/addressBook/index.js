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
  getUrl,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { acl, dc, foaf, rdf, schema, vcard } from "rdf-namespaces";
import { joinPath } from "../../stringHelpers";
import { chain } from "../../solidClientHelpers/utils";
import {
  getBaseUrl,
  getResource,
  saveResource,
} from "../../solidClientHelpers/resource";
import { ERROR_CODES, isHTTPError } from "../../error";

/**
 * @typedef AddressBook
 * @type {object}
 * @property {string} containerIri - The address to the container
 * @property {object} thing - The thing that represents the main index itself
 * @property {object} dataset - The dataset the main index is stored in
 */

/* Model constants */
const CONTACTS_CONTAINER = "contacts/";

export function vcardExtras(property) {
  return `http://www.w3.org/2006/vcard/ns#${property}`;
}

export const NAME_EMAIL_INDEX_PREDICATE = vcardExtras("nameEmailIndex");
export const NAME_GROUP_INDEX_PREDICATE = vcardExtras("groupIndex");
export const VCARD_WEBID_PREDICATE = vcardExtras("WebId");
export const INDEX_FILE = "index.ttl";
export const PEOPLE_INDEX_FILE = "people.ttl";
export const GROUPS_INDEX_FILE = "groups.ttl";
export const PERSON_CONTAINER = "Person";
export const GROUP_CONTAINER = "Group";

const person = {
  indexFile: PEOPLE_INDEX_FILE,
  container: PERSON_CONTAINER,
  indexFilePredicate: NAME_EMAIL_INDEX_PREDICATE,
  contactTypeIri: vcard.Individual,
};
const group = {
  indexFile: GROUPS_INDEX_FILE,
  container: GROUP_CONTAINER,
  indexFilePredicate: NAME_GROUP_INDEX_PREDICATE,
  contactTypeIri: vcard.Group,
};
export const TYPE_MAP = {
  [foaf.Person]: person,
  [schema.Person]: person,
  [vcard.Group]: group,
  [vcard.Individual]: person,
};

export const ADDRESS_BOOK_ERROR_ALREADY_EXIST = "Address book already exists.";
export const ADDRESS_BOOK_ERROR_NO_MAIN_INDEX = "Unable to load main index";
export const ADDRESS_BOOK_ERROR_NO_PERMISSION_TO_CREATE =
  "You do not have permission to create an address book";

/* Model functions */
export function getAddressBookContainerIri(podRootIri) {
  return joinPath(podRootIri, CONTACTS_CONTAINER);
}

export function getAddressBookIndexDefaultUrl(containerIri, type) {
  return joinPath(containerIri, type ? TYPE_MAP[type].indexFile : INDEX_FILE);
}

export function getAddressBookIndexUrl(addressBook, type) {
  if (!type) {
    return (
      getSourceUrl(addressBook.dataset) ||
      getAddressBookIndexDefaultUrl(addressBook.containerIri)
    );
  }
  return (
    getUrl(addressBook.thing, TYPE_MAP[type].indexFilePredicate) ||
    getAddressBookIndexDefaultUrl(addressBook.containerIri, type)
  );
}

export function createAddressBook(containerIri, owner, title = "Contacts") {
  const peopleDatasetIri = getAddressBookIndexDefaultUrl(
    containerIri,
    foaf.Person
  );
  const groupsDatasetIri = getAddressBookIndexDefaultUrl(
    containerIri,
    vcard.Group
  );
  const thing = chain(
    createThing({ name: "this" }),
    (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
    (t) => addUrl(t, acl.owner, owner),
    (t) => addStringNoLocale(t, dc.title, title),
    (t) => addUrl(t, vcardExtras("nameEmailIndex"), peopleDatasetIri),
    (t) => addUrl(t, vcardExtras("groupIndex"), groupsDatasetIri)
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
