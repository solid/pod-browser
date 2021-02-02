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
import { vcard } from "rdf-namespaces";
import { vcardExtras } from "../../../addressBook";
import { joinPath } from "../../../stringHelpers";
import { getContactAll } from "../index";

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
};

/* Model functions */
export function createPersonDatasetUrl(addressBook, id = uuid()) {
  return joinPath(addressBook.containerUrl, PERSON_CONTAINER, id, INDEX_FILE);
}

export async function getPersonAll(addressBook, fetch) {
  return getContactAll(addressBook, [PERSON_CONTACT], fetch);
}
