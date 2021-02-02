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
import {
  createSolidDataset,
  mockSolidDatasetFrom,
  mockThingFrom,
  setStringNoLocale,
  setThing,
} from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces/dist/index";
import { getOrCreateDataset, updateOrCreateDataset } from "./index";

const resourceUrl = "http://example.com/random.ttl";
const fetch = jest.fn();
const error404 = "404 Not found";
const error500 = "500 Server error";

let mockedGetSolidDataset;

beforeEach(() => {
  mockedGetSolidDataset = jest
    .spyOn(solidClientFns, "getSolidDataset")
    .mockImplementation((url) => mockSolidDatasetFrom(url));
});

describe("getOrCreateDataset", () => {
  it("returns the dataset if available", async () => {
    await expect(getOrCreateDataset(resourceUrl, fetch)).resolves.toEqual(
      mockSolidDatasetFrom(resourceUrl)
    );
  });

  it("returns an empty dataset if not found", async () => {
    mockedGetSolidDataset.mockRejectedValue(error404);
    await expect(getOrCreateDataset(resourceUrl, fetch)).resolves.toEqual(
      createSolidDataset()
    );
  });

  it("rejects for other errors", async () => {
    mockedGetSolidDataset.mockRejectedValue(error500);
    await expect(getOrCreateDataset(resourceUrl, fetch)).rejects.toEqual(
      error500
    );
  });
});

describe("updateOrCreateDataset", () => {
  const existingThing = setStringNoLocale(
    mockThingFrom("http://example.com/random.ttl#foo"),
    vcard.fn,
    "Test 1"
  );
  const existingDataset = setThing(
    mockSolidDatasetFrom(resourceUrl),
    existingThing
  );
  const newThing = setStringNoLocale(
    mockThingFrom("http://example.com/random.ttl#bar"),
    vcard.fn,
    "Test 2"
  );

  it("updates dataset if found", async () => {
    mockedGetSolidDataset.mockResolvedValue(existingDataset);
    const updatedDataset = setThing(existingDataset, newThing);
    const mockedSaveSolidDatasetAt = jest
      .spyOn(solidClientFns, "saveSolidDatasetAt")
      .mockResolvedValue(updatedDataset);
    await expect(
      updateOrCreateDataset(resourceUrl, fetch, (d) => setThing(d, newThing))
    ).resolves.toEqual(updatedDataset);
    expect(mockedGetSolidDataset).toHaveBeenCalledWith(resourceUrl, { fetch });
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      resourceUrl,
      updatedDataset,
      { fetch }
    );
  });

  it("updates a new dataset if not found", async () => {
    mockedGetSolidDataset.mockRejectedValue(error404);
    const updatedDataset = setThing(createSolidDataset(), newThing);
    const mockedSaveSolidDatasetAt = jest
      .spyOn(solidClientFns, "saveSolidDatasetAt")
      .mockResolvedValue(updatedDataset);
    await expect(
      updateOrCreateDataset(resourceUrl, fetch, (d) => setThing(d, newThing))
    ).resolves.toEqual(updatedDataset);
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      resourceUrl,
      updatedDataset,
      { fetch }
    );
  });
});
