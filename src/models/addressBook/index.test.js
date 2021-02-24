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

import { acl, dc, rdf } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import {
  getStringNoLocale,
  getThingAll,
  getUrl,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import {
  ADDRESS_BOOK_ERROR_NO_MAIN_INDEX,
  CONTACTS_CONTAINER,
  createAddressBook,
  getAddressBookContainerUrl,
  getAddressBookIndexDefaultUrl,
  getAddressBookDatasetUrl,
  INDEX_FILE,
  loadAddressBook,
} from "./index";
import mockAddressBook, {
  mockAddressBookDataset,
  mockAddressBookThing,
} from "../../../__testUtils/mockAddressBook";
import { joinPath } from "../../stringHelpers";
import { vcardExtras } from "../../addressBook";

const podUrl = "https://example.pod.com/";
const containerUrl = joinPath("https://example.pod.com/", CONTACTS_CONTAINER);

describe("getAddressBookContainerUrl", () => {
  it("returns the default container for address book", () => {
    expect(getAddressBookContainerUrl(podUrl)).toEqual(containerUrl);
  });
});

describe("getAddressBookIndexDefaultUrl", () => {
  it("returns the default URLs for the various indexes", () => {
    expect(getAddressBookIndexDefaultUrl(containerUrl)).toEqual(
      joinPath(containerUrl, INDEX_FILE)
    );
  });
});

describe("getAddressBookDatasetUrl", () => {
  it("returns the URL that's stored in the model", () => {
    const indexUrl = "https://example.com/myIndex.ttl";
    const addressBook = mockAddressBook({
      indexUrl,
    });
    expect(getAddressBookDatasetUrl(addressBook)).toEqual(indexUrl);
  });

  it("returns default URLs if model data is missing", () => {
    const addressBook = mockAddressBook({
      containerUrl,
      indexUrl: null,
    });
    expect(getAddressBookDatasetUrl(addressBook)).toEqual(
      joinPath(containerUrl, INDEX_FILE)
    );
  });
});

describe("createAddressBook", () => {
  it("creates the main index, with a default title", () => {
    const owner = "https://example.pod.com/card#me";

    const addressBook = createAddressBook(containerUrl, owner);

    expect(addressBook.containerUrl).toEqual(containerUrl);

    expect(getThingAll(addressBook.dataset)).toHaveLength(1);

    expect(getStringNoLocale(addressBook.thing, dc.title)).toEqual("Contacts");
    expect(getUrl(addressBook.thing, rdf.type)).toEqual(
      vcardExtras("AddressBook")
    );
    expect(getUrl(addressBook.thing, acl.owner)).toEqual(owner);
  });

  it("can create with a given title", () => {
    const owner = "https://example.pod.com/card#me";
    const title = "My Address Book";

    const addressBook = createAddressBook(containerUrl, owner, title);

    expect(addressBook.containerUrl).toBe(containerUrl);
    expect(getStringNoLocale(addressBook.thing, dc.title)).toEqual(title);
  });
});

describe("loadAddressBook", () => {
  const fetch = "fetch";
  const existingThing = mockAddressBookThing({ containerUrl });
  const existingDataset = mockAddressBookDataset(
    { containerUrl },
    existingThing
  );

  it("loads the main index for an address book", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(existingDataset);
    await expect(loadAddressBook(containerUrl, fetch)).resolves.toEqual({
      containerUrl,
      dataset: existingDataset,
      thing: existingThing,
    });
  });

  it("returns error if it main index is missing", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(mockSolidDatasetFrom("http://example.com"));
    await expect(loadAddressBook(containerUrl, fetch)).rejects.toEqual(
      new Error(ADDRESS_BOOK_ERROR_NO_MAIN_INDEX)
    );
  });
});
