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

const person1WebIdUrl = "http://example.com/alice#me";
const person1Name = "Alice";
const person1Nick = "A";
const person1Photo = "http://example.com/alice.jpg";

export function mockPersonDatasetAlice() {
  const person1 = mockThingFrom(person1WebIdUrl);
  const person1WithName = addStringNoLocale(person1, vcard.fn, person1Name);
  const person1WithNick = addStringNoLocale(
    person1WithName,
    vcard.nickname,
    person1Nick
  );
  const person1WithPhoto = addUrl(
    person1WithNick,
    vcard.hasPhoto,
    person1Photo
  );
  return person1WithPhoto;
}

export function mockProfileAlice() {
  return {
    name: person1Name,
    nickname: person1Nick,
    avatar: person1Photo,
    webId: person1WebIdUrl,
  };
}

const person2WebIdUrl = "http://example.com/bob#me";
const person2Name = "Bob";
const person2Nick = "B";

export function mockPersonDatasetBob() {
  const person2 = mockThingFrom(person2WebIdUrl);
  const person2WithName = addStringNoLocale(person2, foaf.name, person2Name);
  const person2WithNick = addStringNoLocale(
    person2WithName,
    foaf.nick,
    person2Nick
  );
  return person2WithNick;
}

export function mockProfileBob() {
  return {
    name: person2Name,
    nickname: person2Nick,
    avatar: null,
    webId: person2WebIdUrl,
  };
}
