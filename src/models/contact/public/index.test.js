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
  getStringNoLocale,
  getThingAll,
  getUrl,
  mockThingFrom,
} from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import { PUBLIC_AGENT, createPublicAgent, PUBLIC_AGENT_PREDICATE } from ".";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";

const AGENT_PREDICATE = "http://www.w3.org/ns/solid/acp#agent";

describe("isOfType", () => {
  it("returns true if thing is a public agent", () => {
    const { dataset } = mockAddressBook();
    const publicAgent = createPublicAgent(dataset);
    expect(PUBLIC_AGENT.isOfType(publicAgent.thing)).toBe(true);
  });
  it("returns false if thing is not a public agent", () => {
    const thing = mockThingFrom("https://example.org/thing");
    expect(PUBLIC_AGENT.isOfType(thing)).toBe(false);
  });
});

describe("createPublicAgent", () => {
  it("returns updated dataset", () => {
    const { dataset } = mockAddressBook();
    expect(getThingAll(dataset)).toHaveLength(1);
    const publicAgent = createPublicAgent(dataset);
    expect(getThingAll(publicAgent.dataset)).toHaveLength(2);
  });
  it("returns public agent thing with correct name and url", () => {
    const { dataset } = mockAddressBook();
    expect(getThingAll(dataset)).toHaveLength(1);
    const publicAgent = createPublicAgent(dataset);
    expect(getUrl(publicAgent.thing, AGENT_PREDICATE)).toEqual(
      PUBLIC_AGENT_PREDICATE
    );
    expect(getStringNoLocale(publicAgent.thing, foaf.name)).toEqual("Anyone");
  });
});
