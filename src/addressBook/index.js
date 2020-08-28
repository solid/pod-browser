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
  addStringUnlocalized,
  addUrl,
  getStringNoLocale,
  getStringNoLocaleAll,
  getUrl,
  getUrlAll,
  setThing,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { rdf, dc, acl, vcard, ldp, foaf } from "rdf-namespaces";
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

export function vcardExtras(property) {
  return `http://www.w3.org/2006/vcard/ns#${property}`;
}

export function contactsContainerIri(iri) {
  return joinPath(iri, CONTACTS_CONTAINER);
}

export function createAddressBook({ iri, owner, title = "Contacts" }) {
  const indexIri = joinPath(iri, "index.ttl");
  const peopleIri = joinPath(iri, "people.ttl");
  const groupsIri = joinPath(iri, "groups.ttl");

  const index = defineDataset(
    { name: "this" },
    (t) => addUrl(t, rdf.type, vcardExtras("AddressBook")),
    (t) => addUrl(t, acl.owner, owner),
    (t) => addStringUnlocalized(t, dc.title, title),
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
  const groupsIri = joinPath(containerIri, "groups.ttl");
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

export async function getPeople(containerIri, fetch) {
  const { respond, error } = createResponder();
  const peopleIri = joinPath(containerIri, "Person/");
  const { response: peopleResponse, error: peopleError } = await getResource(
    peopleIri,
    fetch
  );

  if (peopleError) return error(peopleError);

  const peopleIris = getUrlAll(
    peopleResponse.dataset,
    ldp.contains
  ).map((url) => joinPath(url, "index.ttl"));

  const peopleResponses = await Promise.all(
    peopleIris.map((iri) => getResource(iri, fetch))
  );

  const people = peopleResponses
    .filter(({ error: e }) => !e)
    .map(({ response }) => response);

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
      const nickname =
        getStringNoLocale(dataset, vcard.nickname) ||
        getStringNoLocale(dataset, foaf.nick);
      const name =
        getStringNoLocale(dataset, vcard.fn) ||
        getStringNoLocale(dataset, foaf.name);
      const avatar = getUrl(dataset, vcard.hasPhoto);

      return {
        avatar,
        name,
        nickname,
        webId,
      };
    });

  return respond(profiles);
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
  fn: (v) => (t) => addStringUnlocalized(t, vcard.fn, v),
  name: (v) => (t) => addStringUnlocalized(t, foaf.name, v),
  organizationName: (v) => (t) =>
    addStringUnlocalized(t, vcardExtras("organization-name"), v),
  role: (v) => (t) => addStringUnlocalized(t, vcard.role, v),
  countryName: (v) => (t) =>
    addStringUnlocalized(t, vcardExtras("country-name"), v),
  locality: (v) => (t) => addStringUnlocalized(t, vcard.locality, v),
  postalCode: (v) => (t) =>
    addStringUnlocalized(t, vcardExtras("postal-code"), v),
  region: (v) => (t) => addStringUnlocalized(t, vcard.region, v),
  streetAddress: (v) => (t) =>
    addStringUnlocalized(t, vcardExtras("street-address"), v),
  type: (v) => (t) => addStringUnlocalized(t, rdf.type, v),
  value: (v) => (t) => addStringUnlocalized(t, vcard.value, v),
};

export function getSchemaFunction(type, value) {
  const fn = schemaFunctionMappings[type];
  if (!fn) return (x) => x;
  return fn(value);
}

export function getSchemaOperations(schema) {
  if (!schema) return [];

  return Object.keys(schema).reduce((acc, key) => {
    const value = schema[key];
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
  return (schema) => {
    const name = [prefix, shortId()].join("-");
    const operations = getSchemaOperations(schema);
    const thing = defineThing({ name }, ...operations);

    return { name, thing };
  };
}

export function createContact(addressBookIri, contact) {
  const normalizedContact = {
    emails: [],
    addresses: [],
    telephones: [],
    ...contact,
  };
  const id = uuid();
  const iri = joinPath(addressBookIri, "Person", id, "index.ttl");
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

export async function saveContact(addressBookIri, schema, fetch) {
  const { respond, error } = createResponder();
  const newContact = createContact(addressBookIri, schema);
  const { iri } = newContact;
  const indexIri = joinPath(addressBookIri, "index.ttl");
  const peopleIri = joinPath(addressBookIri, "people.ttl");

  const { response: contact, error: saveContactError } = await saveResource(
    newContact,
    fetch
  );

  if (saveContactError) return error(saveContactError);

  const { response: peopleIndex, error: peopleError } = await getResource(
    peopleIri,
    fetch
  );

  if (peopleError) return error(peopleError);

  const peopleThing = defineThing(
    { name: "this  " },
    (t) => addStringUnlocalized(t, vcard.fn, schema.fn || schema.name),
    (t) => addUrl(t, vcardExtras("inAddressBook"), indexIri)
  );

  const peopleResource = {
    dataset: setThing(peopleIndex.dataset, peopleThing),
    iri: peopleIri,
  };

  const { response: people, error: savePeopleError } = await saveResource(
    peopleResource,
    fetch
  );

  if (savePeopleError) return error(savePeopleError);

  return respond({ iri, contact, people });
}
