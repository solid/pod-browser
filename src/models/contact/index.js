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
  addUrl,
  createThing,
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
} from "@inrupt/solid-client";
import { foaf, rdf, vcard } from "rdf-namespaces";
import { TYPE_MAP, VCARD_WEBID_PREDICATE } from "../addressBook";
import { chain } from "../../solidClientHelpers/utils";
import { getOrCreateResource } from "../resource";

/**
 * Contacts represent the dataset in a user's AddressBook, e.g. /contacts/Person/<unique-id>/index.ttl#this
 *
 * @typedef Contact
 * @type {object}
 * @property {object} dataset - The dataset that the thing lives in
 * @property {object} thing - The contact itself, be that a person, a group, or something else
 */

/* Model constants */
export const CONTACT_ERROR_NO_CONTACT_INDEX_TRIPLE =
  "No contact index linked in main index of address book";

/* Model functions */
export function createContactTypeNotFoundError(contact) {
  return new Error(`Contact is unsupported type: ${contact.type}`);
}

export async function getContactsIndex(addressBook, type, fetch) {
  const indexIri = getUrl(addressBook.thing, TYPE_MAP[type].indexFilePredicate);
  if (!indexIri) {
    throw new Error(CONTACT_ERROR_NO_CONTACT_INDEX_TRIPLE);
  }
  return getOrCreateResource(indexIri, fetch);
}

export async function getContacts(addressBook, fetch, type) {
  if (type) {
    const { dataset } = await getContactsIndex(addressBook, type, fetch);
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

  // const contactsIris = contactsThings.map((t) => asUrl(t));
  //
  // const contactsResponses = await Promise.all(
  //   contactsIris.map((iri) => getResource(iri, fetch))
  // );
  //
  // const contacts = contactsResponses
  //   .filter(({ error: e }) => !e)
  //   .map(({ response }) => response)
  //   .filter(({ dataset, iri }) => {
  //     const contactThing = getThing(dataset, iri);
  //     return (
  //       contactThing &&
  //       getUrlAll(contactThing, rdf.type).includes(contactTypeIri)
  //     );
  //   });
  //
  // return contacts;
}

export function getWebIdUrl(dataset, iri) {
  const thing = getThing(dataset, iri);
  const webIdNodeUrl = getUrl(thing, vcard.url);
  if (webIdNodeUrl) {
    const webIdNode = getThing(dataset, webIdNodeUrl);
    return webIdNode && getUrl(webIdNode, vcard.value);
  }
  return getUrl(thing, foaf.openid);
}

export function createWebIdNode(webId) {
  return chain(
    createThing(),
    (t) => addUrl(t, rdf.type, VCARD_WEBID_PREDICATE),
    (t) => addUrl(t, vcard.value, webId)
  );
}
