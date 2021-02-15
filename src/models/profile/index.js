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

import { vcard } from "rdf-namespaces";
import {
  addStringNoLocale,
  asUrl,
  getThing,
  getUrl,
} from "@inrupt/solid-client";
import { fetchProfile } from "../../solidClientHelpers/profile";
import { getResource } from "../../solidClientHelpers/resource";
// eslint-disable-next-line import/no-cycle
import { getWebIdUrl } from "../contact/person";

/* Model constants */

/* Model functions */

export async function getProfileForContact(personContactUrl, fetch) {
  const {
    response: { dataset, iri },
  } = await getResource(personContactUrl, fetch);
  const webId = getWebIdUrl(dataset, iri);
  const fetchedProfile = await fetchProfile(webId, fetch);
  return fetchedProfile;
}
export async function getProfilesForPersonContacts(people, fetch) {
  const peopleThings = await Promise.all(
    people.map(({ thing }) => getResource(asUrl(thing), fetch))
  );
  const profileResponses = await Promise.all(
    peopleThings.map(async ({ response: { dataset, iri } }) => {
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
