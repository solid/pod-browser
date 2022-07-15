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
  asUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
} from "@inrupt/solid-client";
import { vcard, foaf, rdf, space, rdfs, schema } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";
import { packageProfile } from "../src/solidClientHelpers/profile";
import { vcardExtras } from "../src/addressBook";

const VCARD_WEBID_PREDICATE = vcardExtras("WebId");

export function mockWebIdNode(
  webId,
  nodeUrl = "https://example.org/contacts/Person/1234/index.ttl#4567"
) {
  const webIdNode = chain(
    mockThingFrom(nodeUrl),
    (t) => addUrl(t, rdf.type, VCARD_WEBID_PREDICATE),
    (t) => addUrl(t, vcard.value, webId)
  );
  const url = asUrl(webIdNode);
  return { webIdNode, webIdNodeUrl: url };
}

export const aliceProfileUrl = "http://alice.example.com/alice";
export const aliceWebIdUrl = "http://alice.example.com/alice#me";
export const aliceName = "Alice";
export const aliceNick = "A";
export const alicePhoto = "http://alice.example.com/alice.jpg";
export const alicePodRoot = "http://alice.example.com/";
export const aliceAlternativeProfileUrl = "https://alice2.example.org/card";
export const aliceAlternativeWebIdUrl = "https://alice2.example.org/card#me";

export function mockPersonThingAlice(...operations) {
  return chain(
    mockThingFrom(aliceWebIdUrl),
    (t) => addStringNoLocale(t, foaf.name, aliceName),
    (t) => addStringNoLocale(t, vcard.nickname, aliceNick),
    (t) => addUrl(t, vcard.hasPhoto, alicePhoto),
    (t) => addUrl(t, rdf.type, foaf.Person),
    (t) => addUrl(t, vcard.url, aliceAlternativeWebIdUrl),
    (t) => addUrl(t, space.storage, alicePodRoot),
    ...operations
  );
}

const mockPhoneThing = chain(
  mockThingFrom("http://alice.example.com/phone"),
  (t) => addUrl(t, rdf.type, "http://www.w3.org/2006/vcard/ns#Home"),
  (t) => addUrl(t, vcard.value, "tel:42-1337")
);

const mockEmailThing = chain(
  mockThingFrom("http://alice.example.com/email"),
  (t) => addUrl(t, vcard.value, "mailto:alice@example.com")
);

export function mockPersonThingAliceWithContactInfo(...operations) {
  return chain(
    mockThingFrom(aliceWebIdUrl),
    (t) => addStringNoLocale(t, foaf.name, aliceName),
    (t) => addStringNoLocale(t, vcard.nickname, aliceNick),
    (t) => addUrl(t, vcard.hasPhoto, alicePhoto),
    (t) => addUrl(t, rdf.type, foaf.Person),
    (t) => addUrl(t, vcard.url, aliceAlternativeWebIdUrl),
    (t) => addUrl(t, space.storage, alicePodRoot),
    (t) => addUrl(t, vcard.hasTelephone, "http://alice.example.com/phone"),
    (t) => addUrl(t, vcard.hasEmail, "http://alice.example.com/email"),
    ...operations
  );
}

export function mockPersonDatasetAlice(...operations) {
  return setThing(
    mockSolidDatasetFrom(aliceWebIdUrl),
    mockPersonThingAlice(...operations)
  );
}

export function mockEmptyDatasetAlice() {
  return mockSolidDatasetFrom("http://alice.example.com/seeAlsoEmpty");
}

export function mockPersonThingAliceWithEmptySeeAlso() {
  return chain(
    mockThingFrom(aliceWebIdUrl),
    (t) => addUrl(t, rdfs.seeAlso, "http://alice.example.com/seeAlsoEmpty"),
    (t) => addUrl(t, rdf.type, schema.Person)
  );
}

export function mockPersonDatasetAliceWithEmptySeeAlso() {
  return chain(mockSolidDatasetFrom(aliceWebIdUrl), (d) =>
    setThing(d, mockPersonThingAliceWithEmptySeeAlso())
  );
}

export function mockDatasetAliceWithNewThing() {
  return setThing(
    mockEmptyDatasetAlice(),
    addUrl(mockThingFrom(aliceWebIdUrl), rdf.type, schema.Person)
  );
}

export function mockPersonDatasetAliceWithContactInfo(...operations) {
  return chain(
    mockSolidDatasetFrom(aliceWebIdUrl),
    (d) => setThing(d, mockPersonThingAliceWithContactInfo(...operations)),
    (d) => setThing(d, mockEmailThing),
    (d) => setThing(d, mockPhoneThing),
    ...operations
  );
}

export function mockSeeAlsoThingAlice() {
  return chain(
    mockThingFrom(aliceWebIdUrl),
    (t) => addStringNoLocale(t, foaf.name, "Alternative Alice"),
    (t) =>
      addUrl(t, vcard.hasPhoto, "https://example.com/anotherphotoforalice.jpg")
  );
}

export function mockSeeAlsoDatasetAlice() {
  return chain(
    mockSolidDatasetFrom("http://alice.example.com/aliceSeeAlso"),
    (d) => setThing(d, mockSeeAlsoThingAlice())
  );
}

export function mockPersonThingAliceWithContactInfoAndSeeAlso() {
  return chain(
    mockThingFrom(aliceWebIdUrl),
    (t) => addStringNoLocale(t, foaf.name, aliceName),
    (t) => addStringNoLocale(t, vcard.nickname, aliceNick),
    (t) => addUrl(t, vcard.hasPhoto, alicePhoto),
    (t) => addUrl(t, rdf.type, foaf.Person),
    (t) => addUrl(t, vcard.url, aliceAlternativeWebIdUrl),
    (t) => addUrl(t, space.storage, alicePodRoot),
    (t) => addUrl(t, vcard.hasTelephone, "http://alice.example.com/phone"),
    (t) => addUrl(t, vcard.hasEmail, "http://alice.example.com/email"),
    (t) => addUrl(t, rdfs.seeAlso, "http://alice.example.com/aliceSeeAlso")
  );
}

export function mockPersonDatasetAliceWithContactInfoAndSeeAlso() {
  return chain(
    mockSolidDatasetFrom(aliceWebIdUrl),
    (d) => setThing(d, mockPersonThingAliceWithContactInfoAndSeeAlso()),
    (d) => setThing(d, mockEmailThing),
    (d) => setThing(d, mockPhoneThing)
  );
}

export function mockProfileAlice(...operations) {
  return packageProfile(aliceWebIdUrl, mockPersonDatasetAlice(...operations));
}

export const bobProfileUrl = "http://bob.example.com/bob";
export const bobWebIdUrl = "http://bob.example.com/bob#me";
export const bobName = "Bob";
export const bobNick = "B";
export const bobPodRoot = "http://bob.example.com/";
export const bobAlternateProfileUrl = "https://bob2.example.org/card";
export const bobAlternateWebIdUrl = "https://bob2.example.org/card#me";

export function mockPersonThingBob() {
  return chain(
    mockThingFrom(bobWebIdUrl),
    (t) => addStringNoLocale(t, foaf.name, bobName),
    (t) => addStringNoLocale(t, foaf.nick, bobNick),
    (t) => addUrl(t, rdf.type, foaf.Person),
    (t) => addUrl(t, foaf.openid, bobAlternateWebIdUrl),
    (t) => addUrl(t, space.storage, bobPodRoot)
  );
}

export function mockPersonDatasetBob() {
  return setThing(mockSolidDatasetFrom(bobWebIdUrl), mockPersonThingBob());
}

export function mockProfileBob() {
  return packageProfile(bobWebIdUrl, mockPersonDatasetBob());
}
