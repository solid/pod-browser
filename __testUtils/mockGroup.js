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
  addUrl,
  asUrl,
  getThing,
  mockSolidDatasetFrom,
  mockThingFrom,
  removeUrl,
  setStringNoLocale,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { rdf, vcard } from "rdf-namespaces";
import { chain } from "../src/solidClientHelpers/utils";
import { getBaseUrl } from "../src/solidClientHelpers/resource";

export function addMembersToMockedGroup(group, agentUrls) {
  const dataset = chain(
    group.dataset,
    ...agentUrls.map((agentUrl) => (d) =>
      setThing(d, setUrl(group.thing, vcard.hasMember, agentUrl))
    )
  );

  return {
    dataset,
    thing: getThing(dataset, asUrl(group.thing)),
  };
}

export function removeMembersFromMockedGroup(group, agentUrls) {
  const dataset = chain(
    group.dataset,
    ...agentUrls.map((agentUrl) => (d) =>
      setThing(d, removeUrl(group.thing, vcard.hasMember, agentUrl))
    )
  );

  return {
    dataset,
    thing: getThing(dataset, asUrl(group.thing)),
  };
}

export function mockGroupThing(name, url, { description, members } = {}) {
  return chain(
    mockThingFrom(url),
    (t) => setUrl(t, rdf.type, vcard.Group),
    (t) => setStringNoLocale(t, vcard.fn, name),
    ...(members || []).map((agentUrl) => (t) =>
      addUrl(t, vcard.hasMember, agentUrl)
    ),
    ...[
      description ? (t) => setStringNoLocale(t, vcard.note, description) : null,
    ].filter((fn) => !!fn)
  );
}

export default function mockGroup(name, url, options = {}) {
  const thing = mockGroupThing(name, url, options);
  const dataset = setThing(mockSolidDatasetFrom(getBaseUrl(url)), thing);
  return { dataset, thing };
}
