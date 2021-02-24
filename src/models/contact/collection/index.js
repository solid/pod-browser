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
  getUrl,
  saveSolidDatasetAt,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { joinPath } from "../../../stringHelpers";
import { getAddressBookDatasetUrl } from "../../addressBook";
import { getOrCreateDataset } from "../../dataset";

/**
 * A contact index is the collection of a given contact type with a subset of
 * their data so that we can easily list contacts and some of their info without
 * having to fetch all of the specific contact resources.
 */

/* Model functions */
export function compareContactIndexArray(a, b) {
  if (typeof a === "undefined") {
    return typeof b === "undefined";
  }
  if (typeof b === "undefined") {
    return typeof a === "undefined";
  }
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.reduce((memo, item) => memo && b.indexOf(item) !== -1, true);
}

export function getContactIndexDefaultUrl(containerUrl, type) {
  return joinPath(containerUrl, type.indexFile);
}

export function getContactIndexUrl(addressBook, type) {
  return getUrl(addressBook.thing, type.indexFilePredicate);
}

export async function getContactIndex(addressBook, type, fetch) {
  const indexUrl = getUrl(addressBook.thing, type.indexFilePredicate);
  const dataset = indexUrl
    ? await getOrCreateDataset(indexUrl, fetch)
    : createSolidDataset();
  return {
    dataset,
    type,
  };
}

export async function getContactIndexAll(addressBook, types, fetch) {
  return Promise.all(
    types.map(async (type) => getContactIndex(addressBook, type, fetch))
  );
}

export async function addContactIndexToAddressBook(addressBook, type, fetch) {
  const indexUrl = getContactIndexDefaultUrl(addressBook.containerUrl, type);
  const datasetUrl = getAddressBookDatasetUrl(addressBook);
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
