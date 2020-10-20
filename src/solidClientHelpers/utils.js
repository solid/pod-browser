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
  setThing,
  hasResourceInfo,
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

export function defineThing(options, ...operations) {
  return chain(createThing(options), ...operations);
}

export function defineDataset(options, ...operations) {
  return setThing(createSolidDataset(), defineThing(options, ...operations));
}

export function changeThing(thing, ...operations) {
  return chain(thing, ...operations);
}

export const ERRORS = {
  BAD_REQUEST: "Bad Request",
  CONFLICT: "Conflict",
  EXPECTATION_FAILED: "Expectation Failed",
  FAILED_DEPENDENCY: "Failed Dependency",
  FORBIDDEN: "Forbidden",
  GONE: "Gone",
  LENGTH_REQUIRED: "Length Required",
  LOCKED: "Locked",
  METHOD_NOT_ALLOWED: "Method Not Allowed",
  MISDIRECTED_REQUEST: "Misdirected Request",
  NOT_ACCEPTABLE: "Not Acceptable",
  NOT_FOUND: "Not Found",
  PAYLOAD_TOO_LARGE: "Payload Too Large",
  PAYMENT_REQUIRED: "Payment Required",
  PRECONDITION_FAILED: "Precondition Failed",
  PRECONDITION_REQUIRED: "Precondition Required",
  PROXY_AUTHENTICATION_REQUIRED: "Proxy Authentication Required",
  RANGE_NOT_SATISFIABLE: "Range Not Satisfiable",
  REQUEST_HEADER_FIELDS_TOO_LARGE: "Request Header Fields Too Large",
  REQUEST_TIMEOUT: "Request Timeout",
  TEAPOT: "I'm a teapot",
  TOO_EARLY: "Too Early",
  TOO_MANY_REQUESTS: "Too Many Requests",
  UNAUTHORIZED: "Unauthorized",
  UNAVAILABLE_FOR_LEGAL_REASONS: "Unavailable For Legal Reasons",
  UNPROCESSABLE_ENTITY: "Unprocessable Entity",
  UNSUPPORTED_MEDIA_TYPE: "Unsupported Media Type",
  UPGRADE_REQUIRED: "Upgrade Required",
  URI_TOO_LONG: "URI Too Long",
};

export const ERROR_CODES = {
  BAD_REQUEST: 400,
  CONFLICT: 409,
  EXPECTATION_FAILED: 417,
  FAILED_DEPENDENCY: 424,
  FORBIDDEN: 403,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  LOCKED: 423,
  METHOD_NOT_ALLOWED: 405,
  MISDIRECTED_REQUEST: 421,
  NOT_ACCEPTABLE: 406,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  PAYMENT_REQUIRED: 402,
  PRECONDITION_FAILED: 412,
  PRECONDITION_REQUIRED: 428,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  RANGE_NOT_SATISFIABLE: 416,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  REQUEST_TIMEOUT: 408,
  TEAPOT: 418,
  TOO_EARLY: 425,
  TOO_MANY_REQUESTS: 429,
  UNAUTHORIZED: 401,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  UNPROCESSABLE_ENTITY: 422,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UPGRADE_REQUIRED: 426,
  URI_TOO_LONG: 414,
};

export function isHTTPError(errorMessage, code) {
  return !!errorMessage.match(new RegExp(code));
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
