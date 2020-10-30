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
  deleteFile,
  getSourceUrl,
  getStringNoLocaleAll,
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
  removeThing,
  getSolidDataset,
  setThing,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { rdf, dc, acl, vcard, ldp, foaf, schema } from "rdf-namespaces";
import {
  createResponder,
  defineDataset,
  defineThing,
  isHTTPError,
  ERROR_CODES,
} from "../solidClientHelpers/utils";
import { getResource, saveResource } from "../solidClientHelpers/resource";
import { joinPath } from "../stringHelpers";

const CONTACTS_CONTAINER = "contacts/";

const INDEX_FILE = "index.ttl";
const PEOPLE_INDEX_FILE = "people.ttl";
const GROUPS_INDEX_FILE = "groups.ttl";
const PERSON_CONTAINER = "Person";

const TYPE_MAP = {
  [foaf.Person]: {
    indexFile: PEOPLE_INDEX_FILE,
    container: PERSON_CONTAINER,
  },
  [schema.Person]: {
    indexFile: PEOPLE_INDEX_FILE,
    container: PERSON_CONTAINER,
  },
};

export function vcardExtras(property) {
  return `http://www.w3.org/2006/vcard/ns#${property}`;
}

export function contactsContainerIri(iri) {
  return joinPath(iri, CONTACTS_CONTAINER);
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
  const names = getStringNoLocaleAll(dataset, vcard.fn);
  const iris = getUrlAll(dataset, vcardExtras("includesGroup"));

  const groups = iris.map((iri, i) => {
    return {
      iri,
      name: names[i],
    };
  });

  return respond(groups);
}

export async function getContacts(type, containerIri, fetch) {
  const { respond, error } = createResponder();
  const { container } = TYPE_MAP[type];

  if (!container) {
    throw new Error(`Cannot load contacts of type: ${type}`);
  }

  const contactsIri = `${joinPath(containerIri, container)}/`;

  const {
    response: contactsResponse,
    error: contactsError,
  } = await getResource(contactsIri, fetch);

  if (contactsError && isHTTPError(contactsError, ERROR_CODES.NOT_FOUND)) {
    // temporary solution to allow loading contacts page when /contacts/Person isn't created yet
    return respond([]);
  }

  if (contactsError) {
    return error(contactsError);
  }

  const contactsIris = getUrlAll(
    contactsResponse.dataset,
    ldp.contains
  ).map((url) => joinPath(url, INDEX_FILE));

  const contactsResponses = await Promise.all(
    contactsIris.map((iri) => getResource(iri, fetch))
  );

  const contacts = contactsResponses
    .filter(({ error: e }) => !e)
    .map(({ response }) => response);

  return respond(contacts);
}

export async function getProfiles(people, fetch) {
  const profileResponses = await Promise.all(
    people.map(({ dataset }) => {
      const url = getUrl(dataset, foaf.openid);
      return getResource(url, fetch);
    })
  );

  const profiles = profileResponses
    .filter(({ error: e }) => !e)
    .map(({ response }) => response)
    .map(({ dataset, iri: webId }) => {
      const avatar = getUrl(dataset, vcard.hasPhoto);
      return addStringNoLocale(
        getThing(dataset, webId),
        vcard.hasPhoto,
        avatar
      );
    });

  return profiles;
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

export const schemaFunctionMappings = {
  webId: (v) => (t) => addUrl(t, foaf.openid, v),
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

export function getSchemaOperations(contactSchema) {
  if (!contactSchema) return [];

  return Object.keys(contactSchema).reduce((acc, key) => {
    const value = contactSchema[key];
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

export function createContact(addressBookIri, contact, types) {
  // Find the first matching container mapping.
  const containerMap = TYPE_MAP[types.find((type) => TYPE_MAP[type])];

  if (!containerMap) {
    throw new Error(`Contact is unsupported type: ${contact.type}`);
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
  const rootAttributeFns = getSchemaOperations(contact);

  const emails = normalizedContact.emails.map(mapSchema("email"));
  const addresses = normalizedContact.addresses.map(mapSchema("address"));
  const telephones = normalizedContact.telephones.map(mapSchema("telephone"));

  const person = defineDataset(
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

  const dataset = [...emails, ...addresses, ...telephones].reduce(
    (acc, { thing }) => {
      return setThing(acc, thing);
    },
    person
  );

  return {
    iri,
    dataset,
  };
}

export async function findContactInAddressBook(addressBookIri, webId, fetch) {
  const { response: people } = await getContacts(
    foaf.Person,
    addressBookIri,
    fetch
  );

  const profiles = await getProfiles(people, fetch);
  const existingContact = profiles.filter(
    (profile) => asUrl(profile) === webId
  );
  return existingContact;
}

export async function saveContact(addressBookIri, contactSchema, types, fetch) {
  const { respond, error } = createResponder();
  const newContact = createContact(addressBookIri, contactSchema, types);
  const { iri } = newContact;

  const containerMap = TYPE_MAP[types.find((type) => TYPE_MAP[type])];
  const { indexFile } = containerMap;

  const indexIri = joinPath(addressBookIri, INDEX_FILE);
  const contactIndexIri = joinPath(addressBookIri, indexFile);

  const { response: contact, error: saveContactError } = await saveResource(
    newContact,
    fetch
  );

  if (saveContactError) return error(saveContactError);

  const { response: contactIndex, error: contactError } = await getResource(
    contactIndexIri,
    fetch
  );

  if (contactError) return error(contactError);

  const contactThing = defineThing(
    {
      url: `${getSourceUrl(contact)}#this`,
    },
    (t) =>
      addStringNoLocale(t, vcard.fn, contactSchema.fn || contactSchema.name),
    (t) => addUrl(t, vcardExtras("inAddressBook"), indexIri)
  );

  const contactResource = {
    dataset: setThing(contactIndex.dataset, contactThing),
    iri: contactIndexIri,
  };

  const { response: contacts, error: saveContactsError } = await saveResource(
    contactResource,
    fetch
  );

  if (saveContactsError) return error(saveContactsError);
  return respond({ iri, contact, contacts });
}

export async function deleteContact(addressBookIri, contactToDelete, fetch) {
  const webId = getUrl(contactToDelete.dataset, foaf.openid);
  const profileDataset = await getSolidDataset(webId);
  const types = getUrlAll(profileDataset, rdf.type);

  // TODO: get contact from contacts index once SOLIDOS-503 is resolved
  const containerMap = TYPE_MAP[types.find((type) => TYPE_MAP[type])];

  if (!containerMap) {
    throw new Error(`Contact is unsupported type: ${webId}`);
  }

  const { indexFile } = containerMap;

  const contactIri = contactToDelete.iri;
  const contactsIri = joinPath(addressBookIri, indexFile);
  const { response: contactsIndex, error: contactsError } = await getResource(
    contactsIri,
    fetch
  );

  if (contactsError) {
    throw contactsError;
  }

  const contactsIndexThings = getThingAll(contactsIndex.dataset);
  const contactsIndexEntryToRemove = contactsIndexThings.find((thing) =>
    asUrl(thing).includes(contactIri)
  );

  const updatedcontactsIndex = removeThing(
    contactsIndex.dataset,
    contactsIndexEntryToRemove
  );

  const updatedcontactsIndexResponse = saveResource(
    { dataset: updatedcontactsIndex, iri: contactsIri },
    fetch
  );

  const contactContainerIri = contactIri.substring(
    0,
    contactIri.lastIndexOf("/") + 1
  );

  await deleteFile(contactIri, { fetch });
  await deleteFile(contactContainerIri, { fetch });

  const { error: saveContactsError } = await updatedcontactsIndexResponse;

  if (saveContactsError) {
    throw saveContactsError;
  }
}
