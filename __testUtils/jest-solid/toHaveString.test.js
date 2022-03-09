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
import { mockThingFrom, setStringNoLocale } from "@inrupt/solid-client";
import toHaveString from "./toHaveString";

describe("toHaveString", () => {
  it("fails when a predicate is not given", () => {
    const expectedValue = "test";
    const thing = setStringNoLocale(
      mockThingFrom("https://example.com/thing"),
      foaf.name,
      expectedValue
    );

    const { pass, message } = toHaveString(thing);

    expect(pass).toBe(false);
    expect(message()).toEqual("You must provide a string predicate");
  });

  it("passes when the given thing has the expected predicate", () => {
    const expectedValue = "test";
    const thing = setStringNoLocale(
      mockThingFrom("https://example.com/thing"),
      foaf.name,
      expectedValue
    );

    const { pass } = toHaveString(thing, foaf.name);

    expect(pass).toBe(true);
  });

  it("passes when the given thing has the expected predicate with the expected value", () => {
    const expectedValue = "test";
    const thing = setStringNoLocale(
      mockThingFrom("https://example.com/thing"),
      foaf.name,
      expectedValue
    );

    const { pass } = toHaveString(thing, foaf.name, expectedValue);

    expect(pass).toBe(true);
  });

  it("handles multiple values", () => {
    const value = "test";
    const value2 = "test2";

    const thing = setStringNoLocale(
      setStringNoLocale(
        mockThingFrom("https://example.com/thing"),
        foaf.name,
        value
      ),
      foaf.name,
      value2
    );

    const { pass } = toHaveString(thing, foaf.name, value2);

    expect(pass).toBe(true);
  });

  it("fails when the given thing does not contain the expected predicate", () => {
    const thing = mockThingFrom("https://example.com/thing");

    const { pass, message } = toHaveString(thing, foaf.name);

    expect(pass).toBe(false);
    expect(message()).toEqual(
      `Expected thing to have a predicate of ${foaf.name}`
    );
  });

  it("fails when the given thing does not contain the expected predicate with the expected value", () => {
    const actualValue = "unexpected";
    const expectedValue = "test";
    const thing = setStringNoLocale(
      mockThingFrom("https://example.com/thing"),
      foaf.name,
      actualValue
    );

    const { pass, message } = toHaveString(thing, foaf.name, expectedValue);

    expect(pass).toBe(false);
    expect(message()).toEqual(
      `Expected thing to have an ${foaf.name} predicate with a value of ${expectedValue}, received ${actualValue}`
    );
  });

  it("fails when the given thing does not contain the expected predicate or the expected value", () => {
    const thing = mockThingFrom("https://example.com/thing");

    const { pass, message } = toHaveString(thing, foaf.homepage, "test");

    expect(pass).toBe(false);
    expect(message()).toEqual(
      `Expected thing to have an ${foaf.homepage} predicate with a value of test, received null`
    );
  });
});
