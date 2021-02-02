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

import { v4 as uuid } from "uuid";
import * as solidClientFns from "@inrupt/solid-client";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { createPersonDatasetUrl, getPersonAll, PERSON_CONTACT } from "./index";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import { chain } from "../../../solidClientHelpers/utils";
import { addIndexToMockedAddressBook } from "../../../../__testUtils/mockContact";
import mockPersonContact, {
  addPersonToMockedIndexDataset,
} from "../../../../__testUtils/mockPersonContact";

jest.mock("uuid");
const mockedUuid = uuid;

const containerUrl = "https://example.com/contacts/";
const emptyAddressBook = mockAddressBook({ containerUrl });
const peopleIndexDatasetUrl = "https://example.com/people.ttl";
const fetch = jest.fn();

const person1DatasetUrl = "https://example.com/contacts/Person/1234/index.ttl";
const person1Url = `${person1DatasetUrl}#this`;
const person1Name = "Person 1";

const person2DatasetUrl = "https://example.com/contacts/Person/5678/index.ttl";

const personIndexWithPerson1Dataset = chain(
  mockSolidDatasetFrom(peopleIndexDatasetUrl),
  (d) =>
    addPersonToMockedIndexDataset(d, emptyAddressBook, person1Name, person1Url)
);
const addressBookWithPeopleIndex = addIndexToMockedAddressBook(
  emptyAddressBook,
  PERSON_CONTACT,
  { indexUrl: peopleIndexDatasetUrl }
);
const person1 = mockPersonContact(emptyAddressBook, person1Url, person1Name);

describe("createPersonDatasetUrl", () => {
  it("creates a unique person URL", () => {
    mockedUuid.mockReturnValueOnce("1234").mockReturnValueOnce("5678");
    expect(createPersonDatasetUrl(emptyAddressBook)).toEqual(person1DatasetUrl);
    expect(createPersonDatasetUrl(emptyAddressBook)).toEqual(person2DatasetUrl);
  });

  it("allows specifying ID", () => {
    expect(createPersonDatasetUrl(emptyAddressBook, "unique")).toEqual(
      "https://example.com/contacts/Person/unique/index.ttl"
    );
  });
});

describe("getPersonAll", () => {
  it("lists all people", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(personIndexWithPerson1Dataset);
    await expect(
      getPersonAll(addressBookWithPeopleIndex, fetch)
    ).resolves.toEqual([person1]);
  });

  it("lists no people for address book with no people index", async () => {
    await expect(getPersonAll(emptyAddressBook, fetch)).resolves.toEqual([]);
  });

  it("lists no people when people index is empty", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(mockSolidDatasetFrom(peopleIndexDatasetUrl));
    await expect(
      getPersonAll(addressBookWithPeopleIndex, fetch)
    ).resolves.toEqual([]);
  });
});
