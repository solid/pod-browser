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
  asUrl,
  createSolidDataset,
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { rdf } from "rdf-namespaces";
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
  const contacts = await Promise.all(
    types.map(async (type) => {
      const dataset = await getContactIndexDataset(addressBook, type, fetch);
      return getThingAll(dataset)
        .filter((contact) =>
          getUrlAll(contact, rdf.type).includes(type.contactTypeUrl)
        )
        .map((thing) => ({
          thing,
          dataset,
        }));
    })
  );
  return contacts.flat();
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
