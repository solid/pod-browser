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

/* eslint-disable camelcase */

import {
  addStringNoLocale,
  addUrl,
  asUrl,
  createThing,
  deleteFile,
  getSolidDataset,
  getSourceUrl,
  getStringNoLocale,
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
  removeThing,
  setThing,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { acl, dc, foaf, rdf, schema, vcard } from "rdf-namespaces";
import {
  chain,
  createResponder,
  defineDataset,
  defineThing,
} from "../solidClientHelpers/utils";
import { getResource, saveResource } from "../solidClientHelpers/resource";
import { joinPath } from "../stringHelpers";
import { ERROR_CODES, isHTTPError } from "../error";

const CONTACTS_CONTAINER = "contacts/";

const NAME_EMAIL_INDEX_PREDICATE =
  "http://www.w3.org/2006/vcard/ns#nameEmailIndex";

const INDEX_FILE = "index.ttl";
const PEOPLE_INDEX_FILE = "people.ttl";
const GROUPS_INDEX_FILE = "groups.ttl";
const PERSON_CONTAINER = "Person";

const VCARD_WEBID_PREDICATE = "http://www.w3.org/2006/vcard/ns#WebId";

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

export function createAddressBook({ iri, owner, title = "Contacts" }) {
  const indexIri = joinPath(iri, INDEX_FILE);
  const peopleIri = joinPath(iri, PEOPLE_INDEX_FILE);
  const groupsIri = joinPath(iri, GROUPS_INDEX_FILE);

  const index = defineDataset(
    { name: "this" },
    (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
    (t) => addUrl(t, acl.owner, owner),
    (t) => addStringNoLocale(t, dc.title, title),
    (t) => addUrl(t, vcardExtras("nameEmailIndex"), peopleIri),
    (t) => addUrl(t, vcardExtras("groupIndex"), groupsIri)
  );
  const groups = defineDataset({ name: "this" });
  const people = defineDataset({ name: "this" });

  return {
    iri,
    index: {
      iri: indexIri,
      dataset: index,
    },
    groups: {
      iri: groupsIri,
      dataset: groups,
    },
    people: {
      iri: peopleIri,
      dataset: people,
    },
  };
}

export async function getGroups(containerIri, fetch) {
  const { respond, error } = createResponder();
  const groupsIri = joinPath(containerIri, GROUPS_INDEX_FILE);
  const { response: groupsResponse, error: resourceError } = await getResource(
    groupsIri,
    fetch
  );

  if (resourceError) return error(resourceError);
  const { dataset } = groupsResponse;
  const groupsThingUrl = `${getSourceUrl(dataset)}#this`; // TODO: Ugly hack, should remove
  const groupsThing = getThing(dataset, groupsThingUrl);
  const iris = getUrlAll(groupsThing, vcardExtras("includesGroup"));

  const groups = iris.map((iri) => {
    const groupThing = getThing(dataset, iri);
    return {
      iri,
      name: getStringNoLocale(groupThing, vcard.fn),
    };
  });

  return respond(groups);
}

export async function getContacts(indexFileDataset, contactTypeIri, fetch) {
  const { respond } = createResponder();
  if (!indexFileDataset) {
    return respond([]);
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
      return getUrlAll(contactThing, rdf.type).includes(contactTypeIri);
    });

  return respond(contacts);
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

export async function saveNewAddressBook(
  { iri, owner, title = "Contacts" },
  fetch
) {
  const { respond, error } = createResponder();
  const { response: existingAddressBook } = await getResource(iri, fetch);
  const respondWithError = (msg) => {
    if (isHTTPError(msg, ERROR_CODES.UNAUTHORIZED)) {
      return error("You do not have permission to create an address book");
    }

    return error(msg);
  };

  if (existingAddressBook) return error("Address book already exists.");

  const newAddressBook = createAddressBook({
    iri,
    owner,
    title,
  });

  const { response: index, error: saveIndexError } = await saveResource(
    newAddressBook.index,
    fetch
  );
  const { response: groups, error: saveGroupsError } = await saveResource(
    newAddressBook.groups,
    fetch
  );
  const { response: people, error: savePeopleError } = await saveResource(
    newAddressBook.people,
    fetch
  );

  if (saveIndexError) return respondWithError(saveIndexError);
  if (saveGroupsError) return respondWithError(saveGroupsError);
  if (savePeopleError) return respondWithError(savePeopleError);

  return respond({ iri, index, groups, people });
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

export async function getIndexDatasetFromAddressBook(
  addressBookDataset,
  indexFilePredicate,
  fetch
) {
  const { respond, error } = createResponder();
  try {
    const addressBookIri = `${getSourceUrl(addressBookDataset)}#this`; // TODO: Ugly hack, should remove
    const addressBookThing = getThing(addressBookDataset, addressBookIri);
    const indexDatasetIri = getUrl(addressBookThing, indexFilePredicate);
    const indexFileDataset = await getSolidDataset(indexDatasetIri, { fetch });
    return respond(indexFileDataset);
  } catch (e) {
    return error(e);
  }
}

export function createContactTypeNotFoundError(contact) {
  return new Error(`Contact is unsupported type: ${contact.type}`);
}

export function createContact(
  addressBookIri,
  contact,
  types,
  createWebIdNode = createWebIdNodeFn
) {
  // Find the first matching container mapping.
  const containerMap = TYPE_MAP[types.find((type) => TYPE_MAP[type])];

  if (!containerMap) {
    throw createContactTypeNotFoundError(contact);
  }

  const { container } = containerMap;

  const normalizedContact = {
    emails: [],
    addresses: [],
    telephones: [],
    ...contact,
  };

  const id = uuid();
  const iri = joinPath(addressBookIri, container, id, INDEX_FILE);
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
  let dataset = [...emails, ...addresses, ...telephones].reduce(
    (acc, { thing }) => {
      return setThing(acc, thing);
    },
    person
  );

  dataset = setThing(dataset, webIdNode);

  return {
    iri,
    dataset,
  };
}

export async function findContactInAddressBook(people, webId, fetch) {
  const profiles = await getProfiles(people, fetch);
  const existingContact = profiles.filter(
    (profile) => asUrl(profile) === webId
  );
  return existingContact;
}

export async function saveContact(
  addressBook,
  addressBookContainerUrl,
  contactSchema,
  types,
  fetch
) {
  const { respond, error } = createResponder();
  const newContact = createContact(
    addressBookContainerUrl,
    contactSchema,
    types,
    createWebIdNodeFn
  );
  const { iri } = newContact;

  const indexIri = joinPath(addressBookContainerUrl, INDEX_FILE);
  const { indexFilePredicate } = TYPE_MAP[foaf.Person];

  const { response: contact, error: saveContactError } = await saveResource(
    newContact,
    fetch
  );

  if (saveContactError) return error(saveContactError);

  const { response: contactIndex } = await getIndexDatasetFromAddressBook(
    addressBook,
    indexFilePredicate,
    fetch
  );

  const contactThing = defineThing(
    {
      url: `${getSourceUrl(contact)}#this`,
    },
    (t) =>
      addStringNoLocale(t, vcard.fn, contactSchema.fn || contactSchema.name),
    (t) => addUrl(t, vcardExtras("inAddressBook"), indexIri)
  );

  const contactIndexIri = getSourceUrl(contactIndex);
  const contactResource = {
    dataset: setThing(contactIndex, contactThing),
    iri: contactIndexIri,
  };

  const { response: contacts, error: saveContactsError } = await saveResource(
    contactResource,
    fetch
  );

  if (saveContactsError) return error(saveContactsError);
  return respond({ iri, contact, contacts });
}

export async function deleteContact(
  addressBookIri,
  contactToDelete,
  type,
  fetch
) {
  const addressBook = await getSolidDataset(addressBookIri, {
    fetch,
  });
  const { indexFilePredicate } = TYPE_MAP[type];
  const { response: indexFileDataset } = await getIndexDatasetFromAddressBook(
    addressBook,
    indexFilePredicate,
    fetch
  );

  const indexDatasetIri = getSourceUrl(indexFileDataset);
  const contactsIndexThings = getThingAll(indexFileDataset, { fetch });

  const contactsIndexEntryToRemove = contactsIndexThings.find((thing) =>
    asUrl(thing).includes(contactToDelete.iri)
  );
  const updatedContactsIndex = removeThing(
    indexFileDataset,
    contactsIndexEntryToRemove
  );
  const updatedContactsIndexResponse = await saveResource(
    { dataset: updatedContactsIndex, iri: indexDatasetIri },
    fetch
  );

  const contactContainerIri = contactToDelete.iri.substring(
    0,
    contactToDelete.iri.lastIndexOf("/") + 1
  );

  await deleteFile(contactToDelete.iri, { fetch });
  await deleteFile(contactContainerIri, { fetch });

  const { error: saveContactsError } = updatedContactsIndexResponse;

  if (saveContactsError) {
    throw saveContactsError;
  }
}
