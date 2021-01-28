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
  getStringNoLocale,
  getUrl,
  mockSolidDatasetFrom,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import { foaf, vcard, rdf } from "rdf-namespaces";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import {
  CONTACT_ERROR_NO_CONTACT_INDEX_TRIPLE,
  createWebIdNode,
  getContacts,
  getContactsIndex,
  getWebIdUrl,
} from "./index";
import { getAddressBookIndexUrl, VCARD_WEBID_PREDICATE } from "../addressBook";
import { addGroupToIndexDataset } from "../../../__testUtils/mockGroup";
import {
  aliceAlternativeWebIdUrl,
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  mockWebIdNode,
} from "../../../__testUtils/mockPersonResource";
import { chain } from "../../solidClientHelpers/utils";
import { addMockedPersonThingsToIndexDataset } from "../../../__testUtils/mockPerson";

const addressBook = mockAddressBook();
const fetch = jest.fn();

describe("getContactsIndex", () => {
  it("returns the requested resource", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockImplementation((iri) => mockSolidDatasetFrom(iri));

    const groupsIndex = await getContactsIndex(addressBook, vcard.Group, fetch);
    const groupsIndexUrl = getAddressBookIndexUrl(addressBook, vcard.Group);
    expect(groupsIndex).toEqual({
      dataset: mockSolidDatasetFrom(groupsIndexUrl),
      iri: groupsIndexUrl,
    });

    const peopleIndex = await getContactsIndex(addressBook, foaf.Person, fetch);
    const peopleIndexUrl = getAddressBookIndexUrl(addressBook, foaf.Person);
    expect(peopleIndex).toEqual({
      dataset: mockSolidDatasetFrom(peopleIndexUrl),
      iri: peopleIndexUrl,
    });
  });

  it("throws an error if unable to find type index URL in main index", async () => {
    const addressBookWithMissingIndexes = mockAddressBook({ peopleUrl: false });
    await expect(
      getContactsIndex(addressBookWithMissingIndexes, foaf.Person, fetch)
    ).rejects.toEqual(new Error(CONTACT_ERROR_NO_CONTACT_INDEX_TRIPLE));
  });
});

describe("getContacts", () => {
  const group1Url = "http://example.com/Group/group1/index.ttl#this";
  const group1Name = "Group 1";
  const groupsDatasetIri = getAddressBookIndexUrl(addressBook, vcard.Group);
  const groupsDataset = addGroupToIndexDataset(
    mockSolidDatasetFrom(groupsDatasetIri),
    addressBook,
    group1Name,
    group1Url
  );

  const person1Url = "http://example.com/Person/person1/index.ttl#this";
  const person1Name = "Alice";
  const peopleDatasetIri = getAddressBookIndexUrl(addressBook, foaf.Person);
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

describe("getWebIdUrl", () => {
  it("returns the webId for a given person dataset", () => {
    const webIdUrl = "http://example.com/alice#me";
    const { webIdNode } = mockWebIdNode(webIdUrl, aliceAlternativeWebIdUrl);
    const personDataset = chain(
      mockSolidDatasetFrom("http://example.com/alice"),
      (d) => setThing(d, mockPersonDatasetAlice()),
      (d) => setThing(d, webIdNode)
    );

    expect(getWebIdUrl(personDataset, aliceWebIdUrl)).toEqual(webIdUrl);
  });

  it("offers fallback for foaf.openid", () => {
    const foafId = "http://bobspod.com/#me";
    const profile = chain(mockPersonDatasetBob(), (t) =>
      setUrl(t, foaf.openid, foafId)
    );
    const personDataset = chain(
      mockSolidDatasetFrom("https://example.com/bob"),
      (d) => setThing(d, profile)
    );

    expect(getWebIdUrl(personDataset, bobWebIdUrl)).toEqual(foafId);
  });
});

describe("createWebIdNode", () => {
  it("creates a webId node", () => {
    const webId = "http://example.com/#me";
    const webIdNode = createWebIdNode(webId);
    expect(asUrl(webIdNode, "http://test.com/")).toMatch(/http:\/\/test.com\//);
    expect(getUrl(webIdNode, rdf.type)).toEqual(VCARD_WEBID_PREDICATE);
    expect(getUrl(webIdNode, vcard.value)).toEqual(webId);
  });
});
