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

import { addStringNoLocale, addUrl } from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { foaf, rdf, vcard } from "rdf-namespaces";
import { defineThing } from "../solidClientHelpers/utils";
import { vcardExtras } from "../models/addressBook";

export const schemaFunctionMappings = {
  webId: (v) => (t) => addUrl(t, vcard.url, v),
  fn: (v) => (t) => addStringNoLocale(t, vcard.fn, v),
  name: (v) => (t) => addStringNoLocale(t, foaf.name, v),
  organizationName: (v) => (t) =>
    addStringNoLocale(t, vcardExtras("organization-name"), v),
  role: (v) => (t) => addStringNoLocale(t, vcard.role, v),
  countryName: (v) => (t) =>
    addStringNoLocale(t, vcardExtras("country-name"), v),
  locality: (v) => (t) => addStringNoLocale(t, vcard.locality, v),
  postalCode: (v) => (t) => addStringNoLocale(t, vcardExtras("postal-code"), v),
  region: (v) => (t) => addStringNoLocale(t, vcard.region, v),
  streetAddress: (v) => (t) =>
    addStringNoLocale(t, vcardExtras("street-address"), v),
  type: (v) => (t) => addStringNoLocale(t, rdf.type, v),
  value: (v) => (t) => addStringNoLocale(t, vcard.value, v),
};

export function getSchemaFunction(type, value) {
  const fn = schemaFunctionMappings[type];
  if (!fn) return (x) => x;
  return fn(value);
}

export function getSchemaOperations(contactSchema, webIdNodeUrl) {
  if (!contactSchema) return [];

  return Object.keys(contactSchema).reduce((acc, key) => {
    let value = contactSchema[key];
    if (webIdNodeUrl && key === "webId") {
      value = webIdNodeUrl;
    }
    if (typeof value === "string") {
      return [...acc, getSchemaFunction(key, value)];
    }
    return acc;
  }, []);
}

export function shortId() {
  return uuid().slice(0, 7);
}

export function mapSchema(prefix) {
  return (contactSchema) => {
    const name = [prefix, shortId()].join("-");
    const operations = getSchemaOperations(contactSchema);
    const thing = defineThing({ name }, ...operations);
    return { name, thing };
  };
}
