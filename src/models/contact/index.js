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
  createSolidDataset,
  getSolidDataset,
  getSourceUrl,
  getThingAll,
  getUrl,
  getUrlAll,
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { foaf, rdf, schema, vcard } from "rdf-namespaces";
import { vcardExtras } from "../../addressBook";
import { joinPath } from "../../stringHelpers";
import { ERROR_CODES, isHTTPError } from "../../error";

/**
 * Contacts represent the dataset in a user's AddressBook, e.g. /contacts/Person/<unique-id>/index.ttl#this
 *
 * @typedef Contact
 * @type {object}
 * @property {object} dataset - The dataset that the thing lives in
 * @property {object} thing - The contact itself, be that a person, a group, or something else
 */

/* Model constants */
export const NAME_EMAIL_INDEX_PREDICATE = vcardExtras("nameEmailIndex");
export const NAME_GROUP_INDEX_PREDICATE = vcardExtras("groupIndex");
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
export const CONTACT_ERROR_NO_CONTACT_INDEX_TRIPLE =
  "No contact index linked in main index of address book";

/* Model functions */
async function getOrCreateDataset(iri, fetch) {
  try {
    return await getSolidDataset(iri, { fetch });
  } catch (error) {
    if (isHTTPError(error, ERROR_CODES.NOT_FOUND)) return createSolidDataset();
    throw error;
  }
}

export function getContactIndexDefaultUrl(containerIri, type) {
  return joinPath(containerIri, TYPE_MAP[type].indexFile);
}

export function getContactIndexUrl(addressBook, type) {
  return getUrl(addressBook.thing, TYPE_MAP[type].indexFilePredicate);
}

export async function getContactsIndexDataset(addressBook, type, fetch) {
  const indexIri = getUrl(addressBook.thing, TYPE_MAP[type].indexFilePredicate);
  return indexIri ? getOrCreateDataset(indexIri, fetch) : createSolidDataset();
}

export async function getContacts(addressBook, fetch, type) {
  if (type) {
    const dataset = await getContactsIndexDataset(addressBook, type, fetch);
    const { contactTypeIri } = TYPE_MAP[type];
    return getThingAll(dataset)
      .filter((contact) =>
        getUrlAll(contact, rdf.type).includes(contactTypeIri)
      )
      .map((thing) => ({
        thing,
        dataset,
      }));
  }
  const contactSets = await Promise.all(
    [vcard.Group, foaf.Person].map((t) => getContacts(addressBook, fetch, t))
  );
  return contactSets.reduce((contacts, things) => contacts.concat(things));
}

export async function addContactIndexToAddressBook(addressBook, type, fetch) {
  const indexUrl = getContactIndexDefaultUrl(addressBook.containerIri, type);
  await saveSolidDatasetAt(
    getSourceUrl(addressBook.dataset),
    setThing(
      addressBook.dataset,
      setUrl(addressBook.thing, TYPE_MAP[type].indexFilePredicate, indexUrl)
    ),
    { fetch }
  );
  return indexUrl;
}
