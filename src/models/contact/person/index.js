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

import { v4 as uuid } from "uuid";
import { vcard, foaf, rdf } from "rdf-namespaces";
import {
  addUrl,
  asUrl,
  createSolidDataset,
  createThing,
  getThing,
  getUrl,
  setThing,
} from "@inrupt/solid-client";
import {
  getSchemaOperations,
  mapSchema,
  vcardExtras,
} from "../../../addressBook";
import { joinPath } from "../../../stringHelpers";
import { getContactAll } from "../index";
// eslint-disable-next-line import/no-cycle
import { getProfilesForPersonContacts } from "../../profile";
import { chain, defineThing } from "../../../solidClientHelpers/utils";

/**
 * Person contacts represent the agents of type vcard:Individual, foaf:Person, schema:Person
 * Their location are usually at /contacts/Person/<unique-id>/index.ttl#this
 */

/* Model constants */
export const PEOPLE_INDEX_FILE = "people.ttl";
export const PERSON_CONTAINER = "Person";
export const INDEX_FILE = "index.ttl";
export const NAME_EMAIL_INDEX_PREDICATE = vcardExtras("nameEmailIndex");
export const PERSON_CONTACT = {
  container: PERSON_CONTAINER,
  indexFile: PEOPLE_INDEX_FILE,
  indexFilePredicate: NAME_EMAIL_INDEX_PREDICATE,
  contactTypeUrl: vcard.Individual,
  isOfType: (contact) => !!getUrl(contact, vcardExtras("inAddressBook")),
  // eslint-disable-next-line no-use-before-define
  createContact: createPersonContact,
};

/* Model functions */
export function createPersonDatasetUrl(addressBook, id = uuid()) {
  return joinPath(addressBook.containerUrl, PERSON_CONTAINER, id, INDEX_FILE);
}

export async function getPersonAll(addressBook, fetch) {
  return getContactAll(addressBook, [PERSON_CONTACT], fetch);
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

export function createWebIdNode(webId, iri) {
  const webIdNode = chain(
    createThing(),
    (t) => addUrl(t, rdf.type, vcardExtras("WebId")),
    (t) => addUrl(t, vcard.value, webId)
  );
  const webIdNodeUrl = asUrl(webIdNode, iri);
  return { webIdNode, webIdNodeUrl };
}

export async function createPersonContact(addressBookContainerUrl, contact) {
  const normalizedContact = {
    emails: [],
    addresses: [],
    telephones: [],
    ...contact,
  };

  const id = uuid();
  const iri = joinPath(
    addressBookContainerUrl,
    PERSON_CONTAINER,
    id,
    INDEX_FILE
  );
  const { webIdNode, webIdNodeUrl } = createWebIdNode(contact.webId, iri);
  const rootAttributeFns = getSchemaOperations(contact, webIdNodeUrl);
  const emails = normalizedContact.emails.map(mapSchema("email"));
  const addresses = normalizedContact.addresses.map(mapSchema("address"));
  const telephones = normalizedContact.telephones.map(mapSchema("telephone"));

  const person = defineThing(
    { name: "this" },
    ...[(t) => addUrl(t, rdf.type, vcard.Individual), ...rootAttributeFns],
    ...emails.map(({ name }) => {
      return (t) => addUrl(t, vcard.hasEmail, [iri, name].join("#"));
    }),
    ...addresses.map(({ name }) => {
      return (t) => addUrl(t, vcard.hasAddress, [iri, name].join("#"));
    }),
    ...telephones.map(({ name }) => {
      return (t) => addUrl(t, vcard.hasTelephone, [iri, name].join("#"));
    })
  );
  const dataset = chain(
    createSolidDataset(),
    (d) => setThing(d, person),
    (d) => setThing(d, webIdNode),
    ...emails
      .concat(addresses)
      .concat(telephones)
      .map(({ thing }) => (d) => setThing(d, thing))
  );
  return {
    iri,
    dataset,
  };
}

export async function findPersonContactInAddressBook(
  addressBook,
  webId,
  fetch
) {
  const people = await getPersonAll(addressBook, fetch);
  const profiles = await getProfilesForPersonContacts(people, fetch);
  const existingContact = profiles.filter(
    (profile) => asUrl(profile) === webId
  );
  return existingContact;
}
