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
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getUrl,
  getUrlAll,
} from "@inrupt/solid-client";
import { foaf, rdf, schema, space, vcard } from "rdf-namespaces";

export function displayProfileName({ nickname, name, webId }) {
  if (name) return name;
  if (nickname) return nickname;
  return webId;
}

export function getProfileFromPersonThing(profileThing) {
  return {
    avatar: getUrl(profileThing, vcard.hasPhoto),
    name:
      getStringNoLocale(profileThing, vcard.fn) ||
      getStringNoLocale(profileThing, foaf.name),
    nickname:
      getStringNoLocale(profileThing, vcard.nickname) ||
      getStringNoLocale(profileThing, foaf.nick),
    webId: asUrl(profileThing),
    types: getUrlAll(profileThing, rdf.type),
  };
}

export const TYPE_MAP = {
  [foaf.Person]: getProfileFromPersonThing,
  [schema.Person]: getProfileFromPersonThing,
};

export function getProfileFromThingError(contactThing) {
  return new Error(`Cannot handle profile for contact: ${asUrl(contactThing)}`);
}

export function getProfileFromThing(contactThing) {
  const types = getUrlAll(contactThing, rdf.type);
  const profileFn = TYPE_MAP[types.find((type) => TYPE_MAP[type])];

  if (!profileFn) {
    throw getProfileFromThingError(contactThing);
  }

  return profileFn(contactThing);
}

export function getPodConnectedToProfile(profile, location) {
  const pods = profile ? profile.pods || [] : [];
  return pods.find((pod) => location.startsWith(pod));
}

export function locationIsConnectedToProfile(profile, location) {
  return !!getPodConnectedToProfile(profile, location);
}

export function packageProfile(webId, dataset) {
  const profile = getThing(dataset, webId);
  return {
    ...getProfileFromPersonThing(profile),
    webId,
    dataset,
    pods: getUrlAll(profile, space.storage) || [],
  };
}

export async function fetchProfile(webId, fetch) {
  const dataset = await getSolidDataset(webId, { fetch });
  return packageProfile(webId, dataset);
}
