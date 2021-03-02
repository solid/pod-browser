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
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import { getContactAll } from "./index";
import { addGroupToMockedIndexDataset } from "../../../__testUtils/mockGroupContact";
import { addPersonToMockedIndexDataset } from "../../../__testUtils/mockPersonContact";
import { PERSON_CONTACT } from "./person";
import { addIndexToMockedAddressBook } from "../../../__testUtils/mockContact";
import { GROUP_CONTACT } from "./group";
import { chain } from "../../solidClientHelpers/utils";
import { createAddressBook } from "../addressBook";
import { webIdUrl } from "../../../__testUtils/mockSession";

const containerUrl = "https://example.pod.com/contacts/";
const fetch = jest.fn();

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
