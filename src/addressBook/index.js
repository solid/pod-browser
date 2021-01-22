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
  createThing,
  getSourceUrl,
  getStringNoLocale,
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { foaf, rdf, schema, vcard } from "rdf-namespaces";
import {
  chain,
  createResponder,
  defineThing,
} from "../solidClientHelpers/utils";
import { getResource } from "../solidClientHelpers/resource";
import { joinPath } from "../stringHelpers";

const CONTACTS_CONTAINER = "contacts/";

const NAME_EMAIL_INDEX_PREDICATE =
  "http://www.w3.org/2006/vcard/ns#nameEmailIndex";

export const INDEX_FILE = "index.ttl";
export const PEOPLE_INDEX_FILE = "people.ttl";
export const GROUPS_INDEX_FILE = "groups.ttl";
export const PERSON_CONTAINER = "Person";

export const VCARD_WEBID_PREDICATE = "https://www.w3.org/2006/vcard/ns#WebId";

export const TYPE_MAP = {
  [foaf.Person]: {
    indexFile: PEOPLE_INDEX_FILE,
    container: PERSON_CONTAINER,
    indexFilePredicate: NAME_EMAIL_INDEX_PREDICATE,
    contactTypeIri: vcard.Individual,
  },
  [schema.Person]: {
    indexFile: PEOPLE_INDEX_FILE,
    container: PERSON_CONTAINER,
    indexFilePredicate: NAME_EMAIL_INDEX_PREDICATE,
    contactTypeIri: vcard.Individual,
  },
};

export function vcardExtras(property) {
  return `http://www.w3.org/2006/vcard/ns#${property}`;
}

export function contactsContainerIri(podRootIri) {
  return joinPath(podRootIri, CONTACTS_CONTAINER);
}

export function getContactsIndexIri(contactsIri) {
  return joinPath(contactsIri, INDEX_FILE);
}

export async function getContacts(indexFileDataset, contactTypeIri, fetch) {
  if (!indexFileDataset) {
    return [];
  }
  const contactsThings = getThingAll(indexFileDataset);

  const contactsIris = contactsThings.map((t) => asUrl(t));

  const contactsResponses = await Promise.all(
    contactsIris.map((iri) => getResource(iri, fetch))
  );

  const contacts = contactsResponses
    .filter(({ error: e }) => !e)
    .map(({ response }) => response)
    .filter(({ dataset, iri }) => {
      const contactThing = getThing(dataset, iri);
      return (
        contactThing &&
        getUrlAll(contactThing, rdf.type).includes(contactTypeIri)
      );
    });

  return contacts;
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

export async function getProfiles(people, fetch) {
  const profileResponses = await Promise.all(
    people.map(async ({ dataset, iri }) => {
      const url = getWebIdUrl(dataset, iri);
      return getResource(url, fetch);
    })
  );

  return profileResponses
    .filter(({ error }) => !error)
    .map(({ response }) => response)
    .map(({ dataset, iri }) => {
      const thing = getThing(dataset, iri);
      const avatar = getUrl(thing, vcard.hasPhoto);
      return addStringNoLocale(getThing(thing, iri), vcard.hasPhoto, avatar);
    });
}

export const createWebIdNodeFn = (webId, iri) => {
  const webIdNode = chain(
    createThing(),
    (t) => addUrl(t, rdf.type, VCARD_WEBID_PREDICATE),
    (t) => addUrl(t, vcard.value, webId)
  );
  const webIdNodeUrl = asUrl(webIdNode, iri);
  return { webIdNode, webIdNodeUrl };
};

export const schemaFunctionMappings = {
  webId: (v) => (t) => addUrl(t, vcard.url, v),
  fn: (v) => (t) => addStringNoLocale(t, vcard.fn, v),
  name: (v) => (t) => addStringNoLocale(t, foaf.name, v),
  organizationName: (v) => (t) =>
    addStringNoLocale(t, vcardExtras("organization-name"), v),
  role: (v) => (t) => addStringNoLocale(t, vcard.role, v),
  countryName: (v) => (t) =>
    addStringNoLocale(t, vcardExtras("country-name"), v),
  locality: (v) => (t) => addStringNoLocale(t, vcard.locality, v),
  postalCode: (v) => (t) => addStringNoLocale(t, vcardExtras("postal-code"), v),
  region: (v) => (t) => addStringNoLocale(t, vcard.region, v),
  streetAddress: (v) => (t) =>
    addStringNoLocale(t, vcardExtras("street-address"), v),
  type: (v) => (t) => addStringNoLocale(t, rdf.type, v),
  value: (v) => (t) => addStringNoLocale(t, vcard.value, v),
};

export function getSchemaFunction(type, value) {
  const fn = schemaFunctionMappings[type];
  if (!fn) return (x) => x;
  return fn(value);
}

export function getSchemaOperations(contactSchema, webIdNodeUrl) {
  if (!contactSchema) return [];

  return Object.keys(contactSchema).reduce((acc, key) => {
    let value = contactSchema[key];
    if (webIdNodeUrl && key === "webId") {
      value = webIdNodeUrl;
    }
    if (typeof value === "string") {
      return [...acc, getSchemaFunction(key, value)];
    }
    return acc;
  }, []);
}

export function shortId() {
  return uuid().slice(0, 7);
}

export function mapSchema(prefix) {
  return (contactSchema) => {
    const name = [prefix, shortId()].join("-");
    const operations = getSchemaOperations(contactSchema);
    const thing = defineThing({ name }, ...operations);
    return { name, thing };
  };
}

export function createContactTypeNotFoundError(contact) {
  return new Error(`Contact is unsupported type: ${contact.type}`);
}

export async function findContactInAddressBook(people, webId, fetch) {
  const profiles = await getProfiles(people, fetch); // TODO: Problematic? Means traversing all contacts and loading their WebId
  const existingContact = profiles.filter(
    (profile) => asUrl(profile) === webId
  );
  return existingContact;
}
