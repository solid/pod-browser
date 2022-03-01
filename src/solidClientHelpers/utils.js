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
  getSourceUrl,
  getThing,
  getUrlAll,
  hasResourceInfo,
  setThing,
} from "@inrupt/solid-client";
import { ldp, rdf } from "rdf-namespaces";
import { ERROR_CODES, isHTTPError } from "../error";
import { parseUrl } from "../stringHelpers";

function mirrorKeysAndValues(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    return {
      ...acc,
      [value]: key,
    };
  }, obj);
}

const missingNamespaces = {
  mtime: "http://www.w3.org/ns/posix/stat#mtime",
  modified: "http://purl.org/dc/terms/modified",
  size: "http://www.w3.org/ns/posix/stat#size",
  nickname: "http://xmlns.com/foaf/0.1/nick",
  familyName: "http://xmlns.com/foaf/0.1/familyName",
  img: "http://xmlns.com/foaf/0.1/img",
  name: "http://xmlns.com/foaf/0.1/name",
  hasPhoto: "http://www.w3.org/2006/vcard/ns#hasPhoto",
  countryName: "http://www.w3.org/2006/vcard/ns#country-name",
  locality: "http://www.w3.org/2006/vcard/ns#locality",
  postalCode: "http://www.w3.org/2006/vcard/ns#postal-code",
  region: "http://www.w3.org/2006/vcard/ns#region",
  streetAddress: "http://www.w3.org/2006/vcard/ns#street-address",
  preferencesFile: "http://www.w3.org/ns/pim/space#preferencesFile",
  podBrowserPreferencesFile: "https://inrupt.com/podbrowser#preferencesFile",
  ConfigurationFile: "http://www.w3.org/ns/pim/space#ConfigurationFile",
};

// TODO use ldp namespace when available
export const namespace = {
  ...mirrorKeysAndValues(ldp),
  ...mirrorKeysAndValues(missingNamespaces),
};

export function isContainerIri(iri) {
  if (!iri) return false;
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

export function createResponder(
  { unauthorizedMessage } = {
    unauthorizedMessage: "You are not authorized for that action",
  }
) {
  const respond = (response) => ({ response });
  const error = (e) => {
    const unauthorized = isHTTPError(e, ERROR_CODES.UNAUTHORIZED);
    const msg = unauthorized ? unauthorizedMessage : e;
    return { error: msg };
  };

  return { respond, error };
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

export async function serializePromises(promiseFactories) {
  return promiseFactories.reduce(async (promise, func) => {
    const oldResult = await promise;
    const newResult = await func();
    return oldResult.concat(newResult);
  }, Promise.resolve([]));
}

export function uniqueObjects(array) {
  return Array.from(new Set(array.map(JSON.stringify))).map(JSON.parse);
}
