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

import { acl, dc, foaf, rdf, vcard } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import {
  getStringNoLocale,
  getThingAll,
  getUrl,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import * as resourceFns from "../../solidClientHelpers/resource";
import {
  ADDRESS_BOOK_ERROR_ALREADY_EXIST,
  ADDRESS_BOOK_ERROR_NO_MAIN_INDEX,
  ADDRESS_BOOK_ERROR_NO_PERMISSION_TO_CREATE,
  createAddressBook,
  getAddressBookContainerIri,
  getAddressBookIndexDefaultUrl,
  getAddressBookIndexUrl,
  GROUPS_INDEX_FILE,
  INDEX_FILE,
  loadAddressBook,
  PEOPLE_INDEX_FILE,
  saveNewAddressBook,
  vcardExtras,
} from "./index";
import mockAddressBook, {
  mockAddressBookDataset,
  mockAddressBookThing,
} from "../../../__testUtils/mockAddressBook";
import { joinPath } from "../../stringHelpers";

const podIri = "https://example.pod.com/";
const containerIri = "https://example.pod.com/contacts/";

describe("getAddressBookContainerIri", () => {
  it("returns the default container for address book", () => {
    expect(getAddressBookContainerIri(podIri)).toEqual(containerIri);
  });
});

describe("getAddressBookIndexDefaultUrl", () => {
  it("returns the default URLs for the various indexes", () => {
    expect(getAddressBookIndexDefaultUrl(containerIri)).toEqual(
      joinPath(containerIri, INDEX_FILE)
    );
    expect(getAddressBookIndexDefaultUrl(containerIri, vcard.Group)).toEqual(
      joinPath(containerIri, GROUPS_INDEX_FILE)
    );
    expect(getAddressBookIndexDefaultUrl(containerIri, foaf.Person)).toEqual(
      joinPath(containerIri, PEOPLE_INDEX_FILE)
    );
  });
});

describe("getAddressBookIndexUrl", () => {
  it("returns the URL that's stored in the model", () => {
    const indexUrl = "https://example.com/myIndex.ttl";
    const groupsUrl = "https://example.com/myGroups.ttl";
    const peopleUrl = "https://example.com/myPeople.ttl";
    const addressBook = mockAddressBook({
      indexUrl,
      groupsUrl,
      peopleUrl,
    });
    expect(getAddressBookIndexUrl(addressBook)).toEqual(indexUrl);
    expect(getAddressBookIndexUrl(addressBook, vcard.Group)).toEqual(groupsUrl);
    expect(getAddressBookIndexUrl(addressBook, foaf.Person)).toEqual(peopleUrl);
  });

  it("returns default URLs if model data is missing", () => {
    const addressBook = mockAddressBook({
      containerIri,
      indexUrl: null,
      groupsUrl: null,
      peopleUrl: null,
    });
    expect(getAddressBookIndexUrl(addressBook)).toEqual(
      joinPath(containerIri, INDEX_FILE)
    );
    expect(getAddressBookIndexUrl(addressBook, vcard.Group)).toEqual(
      joinPath(containerIri, GROUPS_INDEX_FILE)
    );
    expect(getAddressBookIndexUrl(addressBook, foaf.Person)).toEqual(
      joinPath(containerIri, PEOPLE_INDEX_FILE)
    );
  });
});

describe("createAddressBook", () => {
  it("creates the main index, with a default title", () => {
    const owner = "https://example.pod.com/card#me";

    const addressBook = createAddressBook(containerIri, owner);

    expect(addressBook.containerIri).toEqual(containerIri);

    expect(getThingAll(addressBook.dataset)).toHaveLength(1);

    expect(getStringNoLocale(addressBook.thing, dc.title)).toEqual("Contacts");
    expect(getUrl(addressBook.thing, rdf.type)).toEqual(
      vcardExtras("AddressBook")
    );
    expect(getUrl(addressBook.thing, acl.owner)).toEqual(owner);
    expect(getUrl(addressBook.thing, vcardExtras("nameEmailIndex"))).toEqual(
      "https://example.pod.com/contacts/people.ttl"
    );
    expect(getUrl(addressBook.thing, vcardExtras("groupIndex"))).toEqual(
      "https://example.pod.com/contacts/groups.ttl"
    );
  });

  it("can create with a given title", () => {
    const owner = "https://example.pod.com/card#me";
    const title = "My Address Book";

    const addressBook = createAddressBook(containerIri, owner, title);

    expect(addressBook.containerIri).toBe(containerIri);
    expect(getStringNoLocale(addressBook.thing, dc.title)).toEqual(title);
  });
});

describe("loadAddressBook", () => {
  const mainIndexUrl = getAddressBookIndexDefaultUrl(containerIri);
  const fetch = "fetch";
  const existingThing = mockAddressBookThing({ containerIri });
  const existingDataset = mockAddressBookDataset(
    { containerIri },
    existingThing
  );

  it("loads the main index for an address book", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(existingDataset);
    await expect(loadAddressBook(containerIri, fetch)).resolves.toEqual({
      containerIri,
      dataset: existingDataset,
      thing: existingThing,
    });
  });

  it("returns error if it main index is missing", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(mockSolidDatasetFrom("http://example.com"));
    await expect(loadAddressBook(containerIri, fetch)).rejects.toEqual(
      new Error(ADDRESS_BOOK_ERROR_NO_MAIN_INDEX)
    );
  });
});

describe("saveNewAddressBook", () => {
  const owner = "https://example.pod.com/card#me";
  const error401 = "401 Unauthorized";
  const error404 = "404 Not found";
  const error500 = "500 Server error";
  const fetch = jest.fn();
  const addressBook = mockAddressBook({ containerIri });

  let mockedGetSolidDataset;
  let mockedSaveSolidDatasetAt;

  beforeEach(() => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockRejectedValue(error404);
    mockedSaveSolidDatasetAt = jest
      .spyOn(solidClientFns, "saveSolidDatasetAt")
      .mockResolvedValue(addressBook.dataset);
  });

  it("saves a new address at the given iri, for the given owner, with a default title", async () => {
    const savedBook = await saveNewAddressBook(containerIri, owner, fetch);

    expect(savedBook.containerIri).toBe(containerIri);
    expect(savedBook.dataset).toEqual(addressBook.dataset);
    expect(savedBook.thing).toEqual(addressBook.thing);
  });

  it("returns an error if the user is unauthorized", async () => {
    mockedSaveSolidDatasetAt.mockRejectedValue(error401);

    await expect(
      saveNewAddressBook(containerIri, owner, fetch)
    ).rejects.toEqual(new Error(ADDRESS_BOOK_ERROR_NO_PERMISSION_TO_CREATE));
  });

  it("returns an error if the address book already exists", async () => {
    mockedGetSolidDataset.mockResolvedValue(mockSolidDatasetFrom(containerIri));

    await expect(
      saveNewAddressBook(containerIri, owner, fetch)
    ).rejects.toEqual(new Error(ADDRESS_BOOK_ERROR_ALREADY_EXIST));
  });

  it("passes the error on if it isn't a 401 error", async () => {
    mockedSaveSolidDatasetAt.mockRejectedValue(error500);

    await expect(
      saveNewAddressBook(containerIri, owner, fetch)
    ).rejects.toEqual(error500);
  });
});
