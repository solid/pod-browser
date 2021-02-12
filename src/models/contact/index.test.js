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
  asUrl,
  createSolidDataset,
  getSourceUrl,
  getStringNoLocale,
  getThingAll,
  getUrl,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import {
  addContactIndexToAddressBook,
  getContactAll,
  getContactIndexDataset,
  getContactIndexDefaultUrl,
  getContactIndexUrl,
  saveContact,
} from "./index";
import * as resourceFns from "../../solidClientHelpers/resource";
import { addGroupToMockedIndexDataset } from "../../../__testUtils/mockGroupContact";
import { addPersonToMockedIndexDataset } from "../../../__testUtils/mockPersonContact";
import { joinPath } from "../../stringHelpers";
import { PERSON_CONTACT } from "./person";
import { addIndexToMockedAddressBook } from "../../../__testUtils/mockContact";
import { GROUP_CONTACT } from "./group";
import { chain } from "../../solidClientHelpers/utils";
import { createAddressBook } from "../addressBook";
import { webIdUrl } from "../../../__testUtils/mockSession";

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
    const dataset = await getContactIndexDataset(
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
      getContactIndexDataset(addressBook, GROUP_CONTACT, fetch)
    ).resolves.toEqual(createSolidDataset());
  });

  it("returns a blank dataset if resource does not exist", async () => {
    mockedGetSolidDataset.mockRejectedValue("404");
    await expect(
      getContactIndexDataset(addressBookWithGroupIndex, GROUP_CONTACT, fetch)
    ).resolves.toEqual(createSolidDataset());
  });

  it("throws an error if call for resource returns anything other than 404", async () => {
    const error = "500";
    mockedGetSolidDataset.mockRejectedValue(error);
    await expect(
      getContactIndexDataset(addressBookWithGroupIndex, GROUP_CONTACT, fetch)
    ).rejects.toEqual(error);
  });
});

describe("getContactAll", () => {
  const addressBook = mockAddressBook();
  const group1Url = "http://example.com/Group/group1/index.ttl#this";
  const group1Name = "Group 1";
  const groupsDatasetUrl = "https://example.com/groups.ttl";
  const groupsDataset = addGroupToMockedIndexDataset(
    mockSolidDatasetFrom(groupsDatasetUrl),
    addressBook,
    group1Name,
    group1Url
  );

  const person1Url = "http://example.com/Person/person1/index.ttl#this";
  const person1Name = "Alice";
  const peopleDatasetUrl = "https://example.com/people.ttl";
  const peopleDataset = addPersonToMockedIndexDataset(
    mockSolidDatasetFrom(peopleDatasetUrl),
    addressBook,
    person1Name,
    person1Url
  );

  const addressBookWithIndices = chain(
    addressBook,
    (a) =>
      addIndexToMockedAddressBook(a, GROUP_CONTACT, {
        indexUrl: groupsDatasetUrl,
      }),
    (a) =>
      addIndexToMockedAddressBook(a, PERSON_CONTACT, {
        indexUrl: peopleDatasetUrl,
      })
  );

  beforeEach(() => {
    jest.spyOn(solidClientFns, "getSolidDataset").mockImplementation((url) => {
      switch (url) {
        case groupsDatasetUrl:
          return groupsDataset;
        case peopleDatasetUrl:
          return peopleDataset;
        default:
          throw new Error(`Index not found: ${url}`);
      }
    });
  });

  it("returns groups with GROUP_CONTACT", async () => {
    const groups = await getContactAll(
      addressBookWithIndices,
      [GROUP_CONTACT],
      fetch
    );
    expect(groups).toHaveLength(1);
    const [group1] = groups;
    expect(asUrl(group1.thing)).toEqual(group1Url);
    expect(getStringNoLocale(group1.thing, vcard.fn)).toEqual(group1Name);
    expect(group1.dataset).toBe(groupsDataset);
  });

  it("returns people with PERSON_CONTACT", async () => {
    const people = await getContactAll(
      addressBookWithIndices,
      [PERSON_CONTACT],
      fetch
    );
    expect(people).toHaveLength(1);
    const [person1] = people;
    expect(asUrl(person1.thing)).toEqual(person1Url);
    expect(getStringNoLocale(person1.thing, vcard.fn)).toEqual(person1Name);
    expect(person1.dataset).toBe(peopleDataset);
  });

  it("combines contacts if multiple types are given", async () => {
    const contacts = await getContactAll(
      addressBookWithIndices,
      [GROUP_CONTACT, PERSON_CONTACT],
      fetch
    );
    expect(contacts).toHaveLength(2);
    const [group1, person1] = contacts;
    expect(group1.dataset).toBe(groupsDataset);
    expect(person1.dataset).toBe(peopleDataset);
  });

  it("returns an empty list for address book without indices", async () => {
    await expect(
      getContactAll(addressBook, [GROUP_CONTACT, PERSON_CONTACT], fetch)
    ).resolves.toEqual([]);
  });

  it("returns an empty list for newly created address book", async () => {
    const newAddressBook = createAddressBook(containerUrl, webIdUrl);
    await expect(
      getContactAll(newAddressBook, [GROUP_CONTACT, PERSON_CONTACT], fetch)
    ).resolves.toEqual([]);
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
// TODO: this currently only tests Person type until we have Groups
describe("saveContact", () => {
  const groupsUrl = "https://example.com/myGroups.ttl";
  const peopleUrl = "https://example.com/myPeople.ttl";
  const addressBook = chain(
    mockAddressBook(),
    (a) =>
      addIndexToMockedAddressBook(a, PERSON_CONTACT, { indexUrl: peopleUrl }),
    (a) =>
      addIndexToMockedAddressBook(a, GROUP_CONTACT, { indexUrl: groupsUrl })
  );
  const addressBookDatasetIri = "https://user.example.com/contacts";
  const webId = "https://user.example.com/card#me";
  const contactDataset = solidClientFns.mockSolidDatasetFrom(webId);
  const peopleIndexIri = `${addressBookDatasetIri}/people.ttl`;
  const peopleIndexDataset = solidClientFns.mockSolidDatasetFrom(
    peopleIndexIri
  );

  const schema = { webId, fn: "Test Person" };
  const errorMessage = "boom";

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(peopleIndexDataset);
  });

  it("saves the contact and the people index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: contactDataset })
      .mockResolvedValueOnce({ response: peopleIndexDataset });

    jest.spyOn(resourceFns, "getResource").mockResolvedValueOnce({
      response: {
        iri: `${addressBookDatasetIri}/people.ttl`,
        dataset: peopleIndexDataset,
      },
    });

    const {
      response: { contact, contacts },
    } = await saveContact(addressBook, schema, PERSON_CONTACT, fetch);

    expect(contact).toEqual(contactDataset);
    expect(contacts).toEqual(peopleIndexDataset);
  });

  it("also handles schema.name", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: contactDataset })
      .mockResolvedValueOnce({ response: peopleIndexDataset });

    jest.spyOn(resourceFns, "getResource").mockResolvedValueOnce({
      response: {
        iri: `${addressBookDatasetIri}/people.ttl`,
        dataset: peopleIndexDataset,
      },
    });

    const {
      response: { contact, contacts },
    } = await saveContact(addressBook, schema, PERSON_CONTACT, fetch);

    expect(contact).toEqual(contactDataset);
    expect(contacts).toEqual(peopleIndexDataset);
  });

  it("returns an error if it can't save the new contact", async () => {
    jest.spyOn(resourceFns, "saveResource").mockResolvedValue({
      error: errorMessage,
    });

    const { error } = await saveContact(
      addressBook,
      schema,
      PERSON_CONTACT,
      fetch
    );

    expect(error).toEqual(errorMessage);
  });

  it("returns an error if it can't save the new contact to the index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: contactDataset })
      .mockResolvedValueOnce({ error: errorMessage });

    const { error } = await saveContact(
      addressBook,
      schema,
      PERSON_CONTACT,
      fetch
    );

    expect(error).toEqual(errorMessage);
  });
});
