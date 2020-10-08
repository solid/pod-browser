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
import { packageProfile } from "../src/solidClientHelpers/profile";

export const aliceWebIdUrl = "http://example.com/alice#me";
export const aliceName = "Alice";
export const aliceNick = "A";
export const alicePhoto = "http://example.com/alice.jpg";

export function mockPersonDatasetAlice() {
  return chain(
    mockThingFrom(aliceWebIdUrl),
    (t) => addStringNoLocale(t, vcard.fn, aliceName),
    (t) => addStringNoLocale(t, vcard.nickname, aliceNick),
    (t) => addUrl(t, vcard.hasPhoto, alicePhoto)
  );
}

export function mockProfileAlice() {
  return packageProfile(aliceWebIdUrl, mockPersonDatasetAlice());
}

export const bobWebIdUrl = "http://example.com/bob#me";
export const bobName = "Bob";
export const bobNick = "B";

export function mockPersonDatasetBob() {
  return chain(
    mockThingFrom(bobWebIdUrl),
    (t) => addStringNoLocale(t, foaf.name, bobName),
    (t) => addStringNoLocale(t, foaf.nick, bobNick)
  );
}

export function mockProfileBob() {
  return packageProfile(bobWebIdUrl, mockPersonDatasetBob());
}
