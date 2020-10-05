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

import { addStringNoLocale, addUrl, mockThingFrom } from "@inrupt/solid-client";
import { vcard, foaf } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";

export const person1WebIdUrl = "http://example.com/alice#me";
export const person1Name = "Alice";
export const person1Nick = "A";
export const person1Photo = "http://example.com/alice.jpg";

export function mockPersonDatasetAlice() {
  return chain(
    mockThingFrom(person1WebIdUrl),
    (t) => addStringNoLocale(t, vcard.fn, person1Name),
    (t) => addStringNoLocale(t, vcard.nickname, person1Nick),
    (t) => addUrl(t, vcard.hasPhoto, person1Photo)
  );
}

export function mockProfileAlice() {
  return {
    name: person1Name,
    nickname: person1Nick,
    avatar: person1Photo,
    webId: person1WebIdUrl,
  };
}

export const person2WebIdUrl = "http://example.com/bob#me";
export const person2Name = "Bob";
export const person2Nick = "B";

export function mockPersonDatasetBob() {
  return chain(
    mockThingFrom(person2WebIdUrl),
    (t) => addStringNoLocale(t, foaf.name, person2Name),
    (t) => addStringNoLocale(t, foaf.nick, person2Nick)
  );
}

export function mockProfileBob() {
  return {
    name: person2Name,
    nickname: person2Nick,
    avatar: null,
    webId: person2WebIdUrl,
  };
}
