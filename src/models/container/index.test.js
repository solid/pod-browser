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

import * as solidClientFns from "@inrupt/solid-client";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { ldp } from "rdf-namespaces";
import { chain } from "../../solidClientHelpers/utils";
import { getContainer, getContainerResourceIris } from "./index";

const containerUrl = "http://example.com/container/";
const fetch = jest.fn();
const error500 = "500 Server error";
const iri1 = "http://example.com/foo";
const iri2 = "http://example.com/bar";

const thing = chain(
  solidClientFns.mockThingFrom(containerUrl),
  (t) => solidClientFns.addUrl(t, ldp.contains, iri1),
  (t) => solidClientFns.addUrl(t, ldp.contains, iri2)
);
const dataset = chain(mockSolidDatasetFrom(containerUrl), (t) =>
  solidClientFns.setThing(t, thing)
);
const container = { dataset, thing };

describe("getContainer", () => {
  it("returns the dataset if available", async () => {
    jest.spyOn(solidClientFns, "getSolidDataset").mockResolvedValue(dataset);
    await expect(getContainer(containerUrl, fetch)).resolves.toEqual(container);
  });

  it("rejects if there are errors", async () => {
    jest.spyOn(solidClientFns, "getSolidDataset").mockRejectedValue(error500);
    await expect(getContainer(containerUrl, fetch)).rejects.toEqual(error500);
  });
});

describe("getContainerResourceIris", () => {
  it("returns the iris for resources in the container", () => {
    expect(getContainerResourceIris(container)).toHaveLength(2);
    expect(getContainerResourceIris(container)[0]).toEqual(iri1);
    expect(getContainerResourceIris(container)[1]).toEqual(iri2);
  });
});
