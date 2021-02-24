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
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
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
  let updatedAddressBook = addressBook;
  let indexUrl = getContactIndexUrl(addressBook, type);
  if (!indexUrl) {
    const newIndexUrl = getContactIndexDefaultUrl(
      addressBook.containerUrl,
      type
    );
    const datasetUrl = getAddressBookIndexUrl(addressBook);
    const updatedAddressBookDataset = await saveSolidDatasetAt(
      datasetUrl,
      setThing(
        addressBook.dataset,
        setUrl(addressBook.thing, type.indexFilePredicate, newIndexUrl)
      ),
      { fetch }
    );
    updatedAddressBook = {
      containerUrl: addressBook.containerUrl,
      dataset: updatedAddressBookDataset,
      thing: getThing(updatedAddressBookDataset, asUrl(addressBook.thing)),
    };
    indexUrl = getContactIndexUrl(updatedAddressBook, type);
  }

  return {
    addressBook: updatedAddressBook,
    indexUrl,
  };
}
