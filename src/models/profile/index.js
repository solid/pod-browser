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
  asUrl,
  getThing,
  getUrl,
} from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces";
import { getResource } from "../../solidClientHelpers/resource";
import { getWebIdUrl } from "../contact";

/**
 * Profiles are models that have loaded information from the contact _and_ the original profile (using WebID)
 *
 * @typedef Profile
 * TODO: WORK IN PROGRESS
 */

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

export async function findContactInAddressBook(people, webId, fetch) {
  const profiles = await getProfiles(people, fetch); // TODO: Problematic? Means traversing all contacts and loading their WebId
  const existingContact = profiles.filter(
    (profile) => asUrl(profile) === webId
  );
  return existingContact;
}
