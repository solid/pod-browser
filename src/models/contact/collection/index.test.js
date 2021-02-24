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
  getSourceUrl,
  getThingAll,
  getUrl,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import { joinPath } from "../../../stringHelpers";
import {
  addContactIndexToAddressBook,
  getContactIndex,
  getContactIndexDefaultUrl,
  getContactIndexUrl,
} from "./index";
import { chain } from "../../../solidClientHelpers/utils";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import { addIndexToMockedAddressBook } from "../../../../__testUtils/mockContact";
import { PERSON_CONTACT } from "../person";
import { GROUP_CONTACT } from "../group";
import { createAddressBook } from "../../addressBook";
import { webIdUrl } from "../../../../__testUtils/mockSession";

const containerUrl = "https://example.pod.com/contacts/";
const fetch = jest.fn();

describe("getContactIndexDefaultUrl", () => {
  it("returns the default URL for the various indexes", () => {
    const indexFile = "test.ttl";
    expect(getContactIndexDefaultUrl(containerUrl, { indexFile })).toEqual(
      joinPath(containerUrl, indexFile)
    );
  });
});

describe("getContactIndexUrl", () => {
  it("returns the URL that's stored in the model", () => {
    const groupsUrl = "https://example.com/myGroups.ttl";
    const peopleUrl = "https://example.com/myPeople.ttl";
    const addressBook = chain(
      mockAddressBook(),
      (a) =>
        addIndexToMockedAddressBook(a, PERSON_CONTACT, { indexUrl: peopleUrl }),
      (a) =>
        addIndexToMockedAddressBook(a, GROUP_CONTACT, { indexUrl: groupsUrl })
    );
    expect(getContactIndexUrl(addressBook, GROUP_CONTACT)).toEqual(groupsUrl);
    expect(getContactIndexUrl(addressBook, PERSON_CONTACT)).toEqual(peopleUrl);
  });
});

describe("getContactsIndexDataset", () => {
  const addressBook = mockAddressBook();
  const addressBookWithGroupIndex = chain(addressBook, (a) =>
    addIndexToMockedAddressBook(a, GROUP_CONTACT)
  );

  let mockedGetSolidDataset;

  beforeEach(() => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockImplementation((url) => mockSolidDatasetFrom(url));
  });

  it("returns the requested resource", async () => {
    const dataset = await getContactIndex(
      addressBookWithGroupIndex,
      GROUP_CONTACT,
      fetch
    );
    const groupsIndexUrl = getContactIndexUrl(
      addressBookWithGroupIndex,
      GROUP_CONTACT
    );
    expect(dataset).toEqual(mockSolidDatasetFrom(groupsIndexUrl));
  });

  it("returns a blank dataset if index is not linked to addressBook", async () => {
    await expect(
      getContactIndex(addressBook, GROUP_CONTACT, fetch)
    ).resolves.toEqual(createSolidDataset());
  });

  it("returns a blank dataset if resource does not exist", async () => {
    mockedGetSolidDataset.mockRejectedValue("404");
    await expect(
      getContactIndex(addressBookWithGroupIndex, GROUP_CONTACT, fetch)
    ).resolves.toEqual(createSolidDataset());
  });

  it("throws an error if call for resource returns anything other than 404", async () => {
    const error = "500";
    mockedGetSolidDataset.mockRejectedValue(error);
    await expect(
      getContactIndex(addressBookWithGroupIndex, GROUP_CONTACT, fetch)
    ).rejects.toEqual(error);
  });
});

describe("addContactIndexToAddressBook", () => {
  const addressBook = mockAddressBook({ containerUrl });
  const addressBookWithGroups = addIndexToMockedAddressBook(
    addressBook,
    GROUP_CONTACT
  );
  let mockedSaveSolidDatasetAt;

  beforeEach(() => {
    mockedSaveSolidDatasetAt = jest
      .spyOn(solidClientFns, "saveSolidDatasetAt")
      .mockResolvedValue(addressBookWithGroups.dataset);
  });

  it("adds the contacts index to the address book", async () => {
    await expect(
      addContactIndexToAddressBook(addressBook, GROUP_CONTACT, fetch)
    ).resolves.toEqual(addressBookWithGroups);
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      getSourceUrl(addressBook.dataset),
      expect.any(Object),
      { fetch }
    );
    const updatedDataset = mockedSaveSolidDatasetAt.mock.calls[0][1];
    const [mainIndex] = getThingAll(updatedDataset);
    expect(getUrl(mainIndex, GROUP_CONTACT.indexFilePredicate)).toEqual(
      getContactIndexDefaultUrl(containerUrl, GROUP_CONTACT)
    );
  });

  it("also handles newly created address books (without any saved datasets)", async () => {
    const newAddressBook = createAddressBook(containerUrl, webIdUrl);
    await expect(
      addContactIndexToAddressBook(newAddressBook, GROUP_CONTACT, fetch)
    ).resolves.toEqual(addressBookWithGroups);
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      getSourceUrl(addressBook.dataset),
      expect.any(Object),
      { fetch }
    );
  });
});
