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
  addDatetime,
  addStringNoLocale,
  addUrl,
  createSolidDataset,
  createThing,
  mockSolidDatasetFrom,
  setThing,
} from "@inrupt/solid-client";
import { dct, rdf } from "rdf-namespaces";
import {
  initializeBookmarks,
  addBookmark,
  removeBookmark,
  RECALLS_PROPERTY_IRI,
  BOOKMARK_TYPE_IRI,
} from "./bookmarks";
import { saveResource } from "./resource";
import { defineDataset } from "./utils";

jest.mock("./resource");
const bookmarksIri = "https://mypost.myhost.com/bookmarks/index.ttl";
const bookmarksDataset = mockSolidDatasetFrom(bookmarksIri);
const fetch = jest.fn();

describe("initialize bookmarks", () => {
  test("it saves a new bookmarks dataset at a given IRI", async () => {
    saveResource.mockResolvedValue({ response: bookmarksDataset });
    const expected = await initializeBookmarks(bookmarksIri, fetch);

    expect(expected).toEqual({ dataset: bookmarksDataset, iri: bookmarksIri });
  });
});

describe("addBookmark", () => {
  const bookmarkUrl = "https://example.org/cats";
  test("it saves a new bookmark to the bookmarks dataset", async () => {
    const emptyDataset = createSolidDataset();
    const bookmarkThing = addUrl(
      createThing(),
      RECALLS_PROPERTY_IRI,
      bookmarkUrl
    );
    const filledDataset = setThing(emptyDataset, bookmarkThing);

    saveResource.mockResolvedValue({ response: filledDataset });

    const { response: finalDataset } = await addBookmark(
      bookmarkUrl,
      { dataset: emptyDataset, iri: bookmarksIri },
      fetch
    );
    expect(finalDataset.quads.size).toBe(1);
  });

  it("does not overwrite existing bookmarks", async () => {
    const dataset = defineDataset(
      {},
      (t) => addUrl(t, rdf.type, BOOKMARK_TYPE_IRI),
      (t) => addStringNoLocale(t, dct.title, "Cats are awesome!"),
      (t) => addUrl(t, RECALLS_PROPERTY_IRI, bookmarkUrl),
      (t) => addDatetime(t, dct.created, new Date())
    );
    const bookmarks = { dataset, iri: bookmarksIri };
    const { response } = await addBookmark(bookmarkUrl, bookmarks, fetch);
    expect(response).toBe(bookmarks);
  });
});

describe("removeBookmark", () => {
  test("it removes a bookmark from the bookmarks dataset", async () => {
    const emptyDataset = createSolidDataset();
    const bookmarkThing = addUrl(
      createThing(),
      RECALLS_PROPERTY_IRI,
      "https://example.org/cats"
    );
    const filledDataset = setThing(emptyDataset, bookmarkThing);

    await removeBookmark(
      "https://example.org/cats",
      { dataset: filledDataset, iri: bookmarksIri },
      fetch
    );
    expect(saveResource).toHaveBeenCalledWith(
      { dataset: emptyDataset, iri: bookmarksIri },
      fetch
    );
  });

  it("returns the same dataset if bookmark already exists", async () => {
    const emptyDataset = createSolidDataset();

    const bookmarks = { dataset: emptyDataset, iri: bookmarksIri };
    const { response } = await removeBookmark(
      "https://example.org/cats",
      bookmarks,
      fetch
    );
    expect(response).toEqual(bookmarks);
  });
});
