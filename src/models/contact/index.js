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

import { getThingAll, getUrlAll } from "@inrupt/solid-client";
import { rdf } from "rdf-namespaces";
import { getContactIndex } from "./collection";

/*
 * Contacts represent the agents or groups in a user's AddressBook
 */

/* Model functions */
export function getContactAllFromContactsIndex(contactIndex) {
  const { dataset, type } = contactIndex;
  return getThingAll(dataset)
    .filter((contact) =>
      getUrlAll(contact, rdf.type).includes(type.contactTypeUrl)
    )
    .map((thing) => ({
      thing,
      dataset,
    }));
}

export function getContactAllFromContactIndexArray(contactIndexArray) {
  return contactIndexArray
    .map((index) => getContactAllFromContactsIndex(index))
    .reduce((memo, contacts) => memo.concat(contacts), []);
}

export async function getContactAll(addressBook, types, fetch) {
  const contactIndexArray = await Promise.all(
    types.map(async (type) => getContactIndex(addressBook, type, fetch))
  );
  return getContactAllFromContactIndexArray(contactIndexArray);
}
