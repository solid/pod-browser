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

import { asUrl } from "@inrupt/solid-client";
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
  const responses = await Promise.all(
    people.map(({ thing }) => getProfileForContact(asUrl(thing), fetch))
  );
  return responses.filter((profile) => profile);
}
