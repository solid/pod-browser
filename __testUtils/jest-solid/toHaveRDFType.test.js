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

import { rdf } from "rdf-namespaces";
import { mockThingFrom, setUrl } from "@inrupt/solid-client";
import toHaveRDFType from "./toHaveRDFType";

describe("toHaveRDFType", () => {
  it("fails when a type value is not given", () => {
    const type = "https://example.com/type";
    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      rdf.type,
      type
    );

    const { pass, message } = toHaveRDFType(thing);

    expect(pass).toBe(false);
    expect(message()).toEqual("You must provide a type value");
  });

  it("passes when the given thing contains the expected type", () => {
    const type = "https://example.com/type";
    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      rdf.type,
      type
    );

    const { pass } = toHaveRDFType(thing, type);

    expect(pass).toBe(true);
  });

  it("handles multiple types", () => {
    const type = "https://example.com/type";
    const type2 = "https://example.com/type2";

    const thing = setUrl(
      setUrl(mockThingFrom("https://example.com/thing"), rdf.type, type),
      rdf.type,
      type2
    );

    const { pass } = toHaveRDFType(thing, type2);

    expect(pass).toBe(true);
  });

  it("fails when the given thing does not contain the given type", () => {
    const type = "https://example.com/type";
    const type2 = "https://example.com/type2";

    const thing = setUrl(
      mockThingFrom("https://example.com/thing"),
      rdf.type,
      type
    );

    const { pass, message } = toHaveRDFType(thing, type2);

    expect(pass).toBe(false);
    expect(message()).toEqual(
      `Expected thing to have a type of ${type2}, received ${type}`
    );
  });
});
