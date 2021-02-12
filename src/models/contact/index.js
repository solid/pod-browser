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
  getSourceUrl,
  getThing,
  getThingAll,
  getUrl,
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces";
import { createResponder, defineThing } from "../../solidClientHelpers/utils";
import { vcardExtras } from "../../addressBook";
import { saveResource } from "../../solidClientHelpers/resource";
import { joinPath } from "../../stringHelpers";
import { getOrCreateDataset } from "../dataset";
import { getAddressBookIndexUrl } from "../addressBook";

/*
 * Contacts represent the agents or groups in a user's AddressBook
 */

/* Model functions */
export function getContactIndexDefaultUrl(containerUrl, type) {
  return joinPath(containerUrl, type.indexFile);
}

export function getContactIndexUrl(addressBook, type) {
  return getUrl(addressBook.thing, type.indexFilePredicate);
}

export async function getContactIndexDataset(addressBook, type, fetch) {
  const indexUrl = getUrl(addressBook.thing, type.indexFilePredicate);
  return indexUrl ? getOrCreateDataset(indexUrl, fetch) : createSolidDataset();
}

export async function getContactAll(addressBook, types, fetch) {
  const contactsList = await Promise.all(
    types.map(async (type) => {
      const dataset = await getContactIndexDataset(addressBook, type, fetch);
      return getThingAll(dataset)
        .filter((contact) => type.isOfType(contact))
        .map((thing) => ({
          thing,
          dataset,
        }));
    })
  );
  return contactsList.reduce((memo, contacts) => memo.concat(contacts), []);
}

export async function addContactIndexToAddressBook(addressBook, type, fetch) {
  const indexUrl = getContactIndexDefaultUrl(addressBook.containerUrl, type);
  const datasetUrl = getAddressBookIndexUrl(addressBook);
  const dataset = await saveSolidDatasetAt(
    datasetUrl,
    setThing(
      addressBook.dataset,
      setUrl(addressBook.thing, type.indexFilePredicate, indexUrl)
    ),
    { fetch }
  );
  return {
    containerUrl: addressBook.containerUrl,
    dataset,
    thing: getThing(dataset, asUrl(addressBook.thing, datasetUrl)),
  };
}

export async function saveContact(addressBook, contactSchema, type, fetch) {
  const { respond, error } = createResponder();
  const { containerUrl: addressBookContainerUrl } = addressBook;
  const indexIri = getContactIndexUrl(addressBook, type);
  const newContact = await type.createContact(
    addressBookContainerUrl,
    contactSchema
  );
  const { iri } = newContact;
  const { response: contact, error: saveContactError } = await saveResource(
    newContact,
    fetch
  );
  if (saveContactError) return error(saveContactError);

  const contactIndex = await getContactIndexDataset(addressBook, type, fetch);

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
