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
import { foaf, vcard } from "rdf-namespaces";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import {
  addContactIndexToAddressBook,
  getContactIndexDefaultUrl,
  getContactIndexUrl,
  getContacts,
  getContactsIndexDataset,
  GROUPS_INDEX_FILE,
  NAME_GROUP_INDEX_PREDICATE,
  PEOPLE_INDEX_FILE,
} from "./index";
import { addGroupToIndexDataset } from "../../../__testUtils/mockGroup";
import { addMockedPersonThingsToIndexDataset } from "../../../__testUtils/mockPerson";
import { joinPath } from "../../stringHelpers";

const containerIri = "https://example.pod.com/contacts/";
const fetch = jest.fn();

describe("getContactIndexDefaultUrl", () => {
  it("returns the default URLs for the various indexes", () => {
    expect(getContactIndexDefaultUrl(containerIri, vcard.Group)).toEqual(
      joinPath(containerIri, GROUPS_INDEX_FILE)
    );
    expect(getContactIndexDefaultUrl(containerIri, foaf.Person)).toEqual(
      joinPath(containerIri, PEOPLE_INDEX_FILE)
    );
  });
});

describe("getContactIndexUrl", () => {
  it("returns the URL that's stored in the model", () => {
    const groupsUrl = "https://example.com/myGroups.ttl";
    const peopleUrl = "https://example.com/myPeople.ttl";
    const addressBook = mockAddressBook({
      groupsUrl,
      peopleUrl,
    });
    expect(getContactIndexUrl(addressBook, vcard.Group)).toEqual(groupsUrl);
    expect(getContactIndexUrl(addressBook, foaf.Person)).toEqual(peopleUrl);
  });

  it("returns default URLs if model data is missing", () => {
    const addressBook = mockAddressBook({
      containerIri,
      groupsUrl: null,
      peopleUrl: null,
    });
    expect(getContactIndexUrl(addressBook, vcard.Group)).toEqual(
      joinPath(containerIri, GROUPS_INDEX_FILE)
    );
    expect(getContactIndexUrl(addressBook, foaf.Person)).toEqual(
      joinPath(containerIri, PEOPLE_INDEX_FILE)
    );
  });
});

describe("getContactsIndexDataset", () => {
  let mockedGetSolidDataset;

  beforeEach(() => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockImplementation((iri) => mockSolidDatasetFrom(iri));
  });

  it("returns the requested resource", async () => {
    const addressBook = mockAddressBook();
    const dataset = await getContactsIndexDataset(
      addressBook,
      vcard.Group,
      fetch
    );
    const groupsIndexUrl = getContactIndexUrl(addressBook, vcard.Group);
    expect(dataset).toEqual(mockSolidDatasetFrom(groupsIndexUrl));
  });

  it("returns a blank dataset if index is not linked to addressBook", async () => {
    const addressBook = mockAddressBook({ peopleUrl: false });
    await expect(
      getContactsIndexDataset(addressBook, foaf.Person, fetch)
    ).resolves.toEqual(createSolidDataset());
  });

  it("returns a blank dataset if resource does not exist", async () => {
    const addressBook = mockAddressBook();
    mockedGetSolidDataset.mockRejectedValue("404");
    await expect(
      getContactsIndexDataset(addressBook, foaf.Person, fetch)
    ).resolves.toEqual(createSolidDataset());
  });

  it("throws an error if call for resource returns anything other than 404", async () => {
    const addressBook = mockAddressBook();
    const error = "500";
    mockedGetSolidDataset.mockRejectedValue(error);
    await expect(
      getContactsIndexDataset(addressBook, foaf.Person, fetch)
    ).rejects.toEqual(error);
  });
});

describe("getContacts", () => {
  const addressBook = mockAddressBook();
  const group1Url = "http://example.com/Group/group1/index.ttl#this";
  const group1Name = "Group 1";
  const groupsDatasetIri = getContactIndexUrl(addressBook, vcard.Group);
  const groupsDataset = addGroupToIndexDataset(
    mockSolidDatasetFrom(groupsDatasetIri),
    addressBook,
    group1Name,
    group1Url
  );

  const person1Url = "http://example.com/Person/person1/index.ttl#this";
  const person1Name = "Alice";
  const peopleDatasetIri = getContactIndexUrl(addressBook, foaf.Person);
  const peopleDataset = addMockedPersonThingsToIndexDataset(
    mockSolidDatasetFrom(peopleDatasetIri),
    addressBook,
    person1Name,
    person1Url
  );

  beforeEach(() => {
    jest.spyOn(solidClientFns, "getSolidDataset").mockImplementation((iri) => {
      switch (iri) {
        case groupsDatasetIri:
          return groupsDataset;
        case peopleDatasetIri:
          return peopleDataset;
        default:
          throw new Error(`Index not found: ${iri}`);
      }
    });
  });

  it("returns groups with vcard:Group", async () => {
    const groups = await getContacts(addressBook, fetch, vcard.Group);
    expect(groups).toHaveLength(1);
    const [group1] = groups;
    expect(asUrl(group1.thing)).toEqual(group1Url);
    expect(getStringNoLocale(group1.thing, vcard.fn)).toEqual(group1Name);
    expect(group1.dataset).toBe(groupsDataset);
  });

  it("returns people with foaf:Person", async () => {
    const people = await getContacts(addressBook, fetch, foaf.Person);
    expect(people).toHaveLength(1);
    const [person1] = people;
    expect(asUrl(person1.thing)).toEqual(person1Url);
    expect(getStringNoLocale(person1.thing, vcard.fn)).toEqual(person1Name);
    expect(person1.dataset).toBe(peopleDataset);
  });

  it("returns all contacts when no type is given", async () => {
    const contacts = await getContacts(addressBook, fetch);
    expect(contacts).toHaveLength(2);
    const [group1, person1] = contacts;
    expect(group1.dataset).toBe(groupsDataset);
    expect(person1.dataset).toBe(peopleDataset);
  });
});

describe("addContactIndexToAddressBook", () => {
  const addressBook = mockAddressBook({ containerIri, groupsUrl: false });
  let mockedSaveSolidDatasetAt;

  beforeEach(() => {
    mockedSaveSolidDatasetAt = jest
      .spyOn(solidClientFns, "saveSolidDatasetAt")
      .mockResolvedValue();
  });

  it("adds the contacts index to the address book", async () => {
    const indexUrl = getContactIndexDefaultUrl(containerIri, vcard.Group);
    await expect(
      addContactIndexToAddressBook(addressBook, vcard.Group, fetch)
    ).resolves.toEqual(indexUrl);
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      getSourceUrl(addressBook.dataset),
      expect.any(Object),
      { fetch }
    );
    const updatedDataset = mockedSaveSolidDatasetAt.mock.calls[0][1];
    const [mainIndex] = getThingAll(updatedDataset);
    expect(getUrl(mainIndex, NAME_GROUP_INDEX_PREDICATE)).toEqual(indexUrl);
  });
});
