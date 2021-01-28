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
import { createSolidDataset, mockSolidDatasetFrom } from "@inrupt/solid-client";
import { getOrCreateResource } from "./index";

describe("getOrCreateResource", () => {
  const iri = "http://example.com";
  const fetch = jest.fn();
  const dataset = mockSolidDatasetFrom(iri);
  let mockedGetSolidDataset;

  beforeEach(() => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(dataset);
  });

  it("returns dataset if available", async () => {
    await expect(getOrCreateResource(iri, fetch)).resolves.toEqual({
      iri,
      dataset,
    });
    expect(mockedGetSolidDataset).toHaveBeenCalledWith(iri, { fetch });
  });

  it("returns new dataset if not available", async () => {
    mockedGetSolidDataset.mockRejectedValue("404");
    await expect(getOrCreateResource(iri, fetch)).resolves.toEqual({
      iri,
      dataset: createSolidDataset(),
    });
  });

  it("fails on errors", async () => {
    mockedGetSolidDataset.mockRejectedValue("500");
    await expect(getOrCreateResource(iri, fetch)).rejects.toEqual("500");
  });
});
