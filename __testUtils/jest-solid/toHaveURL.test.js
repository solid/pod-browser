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

import { foaf } from "rdf-namespaces";
import { mockThingFrom, setUrl } from "@inrupt/solid-client";
import toHaveURL from "./toHaveURL";

describe("toHaveURL", () => {
  it("fails when a predicate is not given", () => {
    const expectedValue = "https://example.com/test";
    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      foaf.name,
      expectedValue
    );

    const { pass, message } = toHaveURL(thing);

    expect(pass).toBe(false);
    expect(message()).toEqual("You must provide a URL predicate");
  });

  it("passes when the given thing has the expected predicate", () => {
    const expectedValue = "https://example.com";
    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      foaf.homepage,
      expectedValue
    );

    const { pass } = toHaveURL(thing, foaf.homepage);

    expect(pass).toBe(true);
  });

  it("passes when the given thing has the expected predicate with the expected value", () => {
    const expectedValue = "https://example.com";
    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      foaf.homepage,
      expectedValue
    );

    const { pass } = toHaveURL(thing, foaf.homepage, expectedValue);

    expect(pass).toBe(true);
  });

  it("handles multiple values", () => {
    const value = "https://example.com/value";
    const value2 = "https://example.com/value2";

    const thing = setUrl(
      setUrl(mockThingFrom("https://example.com/thing"), foaf.homepage, value),
      foaf.homepage,
      value2
    );

    const { pass } = toHaveURL(thing, foaf.homepage, value2);

    expect(pass).toBe(true);
  });

  it("fails when the given thing does not contain the expected predicate", () => {
    const thing = mockThingFrom("https://example.com/thing");

    const { pass, message } = toHaveURL(thing, foaf.homepage);

    expect(pass).toBe(false);
    expect(message()).toEqual(
      `Expected thing to have a predicate of ${foaf.homepage}`
    );
  });

  it("fails when the given thing does not contain the expected predicate with the expected value", () => {
    const actualValue = "https://example.com";
    const expectedValue = "unexpected";
    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      foaf.homepage,
      actualValue
    );

    const { pass, message } = toHaveURL(thing, foaf.homepage, expectedValue);

    expect(pass).toBe(false);
    expect(message()).toEqual(
      `Expected thing to have an ${foaf.homepage} predicate with a value of ${expectedValue}, received ${actualValue}`
    );
  });

  it("fails when the given thing does not contain the expected predicate or the expected value", () => {
    const expectedValue = "unexpected";
    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      foaf.page,
      "https://example.com"
    );

    const { pass, message } = toHaveURL(thing, foaf.homepage, expectedValue);

    expect(pass).toBe(false);
    expect(message()).toEqual(
      `Expected thing to have an ${foaf.homepage} predicate with a value of ${expectedValue}, received null`
    );
  });
});
