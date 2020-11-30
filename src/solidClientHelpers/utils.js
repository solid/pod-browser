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

/* eslint-disable camelcase */

import {
  createSolidDataset,
  createThing,
  getDatetime,
  getDecimal,
  getInteger,
  getSourceUrl,
  getThing,
  getUrlAll,
  hasResourceInfo,
  setThing,
} from "@inrupt/solid-client";
import { ldp, rdf } from "rdf-namespaces";

import { parseUrl } from "../stringHelpers";

const typeNameMap = Object.keys(ldp).reduce((acc, key) => {
  const value = ldp[key];
  return {
    ...acc,
    [value]: key,
  };
}, {});

// TODO use ldp namespace when available
export const namespace = {
  ...ldp,
  ...typeNameMap,
  mtime: "http://www.w3.org/ns/posix/stat#mtime",
  "http://www.w3.org/ns/posix/stat#mtime": "mtime",
  modified: "http://purl.org/dc/terms/modified",
  "http://purl.org/dc/terms/modified": "modified",
  size: "http://www.w3.org/ns/posix/stat#size",
  "http://www.w3.org/ns/posix/stat#size": "size",
  nickname: "http://xmlns.com/foaf/0.1/nick",
  "http://xmlns.com/foaf/0.1/nick": "nickname",
  familyName: "http://xmlns.com/foaf/0.1/familyName",
  "http://xmlns.com/foaf/0.1/familyName": "familyName",
  img: "http://xmlns.com/foaf/0.1/img",
  "http://xmlns.com/foaf/0.1/img": "img",
  name: "http://xmlns.com/foaf/0.1/name",
  "http://xmlns.com/foaf/0.1/name": "name",
  hasPhoto: "http://www.w3.org/2006/vcard/ns#hasPhoto",
  "http://www.w3.org/2006/vcard/ns#hasPhoto": "hasPhoto",
  "http://www.w3.org/2006/vcard/ns#country-name": "countryName",
  countryName: "http://www.w3.org/2006/vcard/ns#country-name",
  "http://www.w3.org/2006/vcard/ns#locality": "locality",
  locality: "http://www.w3.org/2006/vcard/ns#locality",
  "http://www.w3.org/2006/vcard/ns#postal-code": "postalCode",
  postalCode: "http://www.w3.org/2006/vcard/ns#postal-code",
  "http://www.w3.org/2006/vcard/ns#region": "region",
  region: "http://www.w3.org/2006/vcard/ns#region",
  "http://www.w3.org/2006/vcard/ns#street-address": "streetAddress",
  streetAddress: "http://www.w3.org/2006/vcard/ns#street-address",
  "http://www.w3.org/ns/pim/space#preferencesFile": "preferencesFile",
  preferencesFile: "http://www.w3.org/ns/pim/space#preferencesFile",
  "https://inrupt.com/podbrowser#preferencesFile": "podBrowserPreferencesFile",
  podBrowserPreferencesFile: "https://inrupt.com/podbrowser#preferencesFile",
  "http://www.w3.org/ns/pim/space#ConfigurationFile": "ConfigurationFile",
  ConfigurationFile: "http://www.w3.org/ns/pim/space#ConfigurationFile",
};

export function isContainerIri(iri) {
  return iri.charAt(iri.length - 1) === "/";
}

export function getIriPath(iri) {
  const { pathname } = parseUrl(iri);
  return pathname.replace(/\/?$/, "");
}

export function getTypes(dataset) {
  if (hasResourceInfo(dataset)) {
    const thing = getThing(dataset, getSourceUrl(dataset));
    return getUrlAll(thing, rdf.type);
  }
  return [];
}

export function datasetIsContainer(dataset) {
  return (
    getTypes(dataset).find((type) => type.match(/container/i)) !== undefined
  );
}

export function getTypeName(rawType) {
  if (!rawType) return "";
  return namespace[rawType] || rawType;
}

export function displayTypes(types) {
  return types?.length ? types.map((t) => getTypeName(t)) : [];
}

export function createResponder() {
  const respond = (response) => ({ response });
  const error = (e) => ({ error: e });

  return { respond, error };
}

export function normalizeDataset(dataset, iri) {
  const rawType = getUrlAll(
    dataset,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );

  const mtime = getDecimal(dataset, namespace.mtime);
  const modified = getDatetime(dataset, namespace.modified);
  const size = getInteger(dataset, namespace.size);
  const contains = getUrlAll(dataset, ldp.contains);
  const types = displayTypes(rawType);

  return {
    contains,
    iri,
    modified,
    mtime,
    size,
    types,
    dataset,
  };
}

export function chain(object, ...operations) {
  return operations.reduce((acc, transform) => {
    return transform(acc);
  }, object);
}

export async function chainPromise(object, ...operations) {
  return operations.reduce(
    async (acc, transform) => {
      // eslint-disable-next-line no-return-await
      return acc.then ? transform(await acc) : Promise.resolve(transform(acc));
    },
    object.then ? await object : Promise.resolve(object)
  );
}

export function defineThing(options, ...operations) {
  return chain(createThing(options), ...operations);
}

export function defineDataset(options, ...operations) {
  return setThing(createSolidDataset(), defineThing(options, ...operations));
}

export function changeThing(thing, ...operations) {
  return chain(thing, ...operations);
}

/**
 * Returns the shared characters that two strings starts with, e.g. sharedStart("bar", "baz", "bam") will return "ba".
 */
export function sharedStart(...strings) {
  const A = strings.concat().sort();
  const a1 = A[0] || "";
  const a2 = A[A.length - 1] || "";
  const L = a1.length;
  let i = 0;
  // eslint-disable-next-line no-plusplus
  while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
  return a1.substring(0, i);
}
