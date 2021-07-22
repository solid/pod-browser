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
  addUrl,
  createSolidDataset,
  createThing,
  setStringNoLocale,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { vcard, rdf, schema } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";
import { vcardExtras } from "../src/addressBook";

export const oidcPrefix = "http://www.w3.org/ns/solid/oidc#";
export const TOS_PREDICATE = `${oidcPrefix}tos_uri`;
export const POLICY_PREDICATE = `${oidcPrefix}policy_uri`;
export const CONTACTS_PREDICATE = `${oidcPrefix}contacts`;
export const LOGO_PREDICATE = `${oidcPrefix}logo_uri`;

export const APP_WEBID = "https://mockappurl.com";
export const APP_POLICY_URL = "https://mockappurl.com/privacy-policy";
export const APP_TOS_URL = "https://mockappurl.com/terms-of-service";

const contactThing = chain(
  createThing({ url: "https://mockappurl.com#contacts" }),
  (t) => addStringNoLocale(t, vcard.fn, "Example Contact"),
  (t) => addStringNoLocale(t, vcard.hasTelephone, "555-5555"),
  (t) => addStringNoLocale(t, vcard.hasEmail, "example@email.com"),
  (t) => addUrl(t, vcard.url, "https://examplewebsite.com")
);

const dataset = setThing(createSolidDataset(), contactThing);

export function mockApp() {
  return chain(
    createThing({ url: APP_WEBID }),
    (t) => addStringNoLocale(t, vcard.fn, "Mock App"),
    (t) => addUrl(t, vcardExtras("WebId"), APP_WEBID),
    (t) => addUrl(t, rdf.type, schema.SoftwareApplication), // just guessing what the type might be for apps
    (t) => addUrl(t, TOS_PREDICATE, APP_TOS_URL),
    (t) => addUrl(t, POLICY_PREDICATE, APP_POLICY_URL),
    (t) => addUrl(t, CONTACTS_PREDICATE, "https://mockappurl.com#contacts")
  );
}

export function mockAppDataset() {
  return setThing(dataset, mockApp());
}
