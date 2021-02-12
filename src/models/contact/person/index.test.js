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
import { vcard } from "rdf-namespaces";
import { vcardExtras } from "../../../addressBook";
import {
  aliceAlternativeWebIdUrl,
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  mockWebIdNode,
} from "../../../../__testUtils/mockPersonResource";
import {
  PERSON_CONTACT,
  createPersonContact,
  createPersonDatasetUrl,
  findPersonContactInAddressBook,
  getWebIdUrl,
  getPersonAll,
} from "./index";
import * as contactModel from "..";
import * as profileModel from "../../profile";

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
const person2Url = `${person2DatasetUrl}#this`;

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

describe("getWebIdUrl", () => {
  it("returns the webId for a given person dataset", () => {
    const webIdUrl = "http://example.com/alice#me";
    const { webIdNode } = mockWebIdNode(webIdUrl, aliceAlternativeWebIdUrl);
    const personDataset = chain(
      mockSolidDatasetFrom("http://example.com/alice"),
      (d) => solidClientFns.setThing(d, mockPersonDatasetAlice()),
      (d) => solidClientFns.setThing(d, webIdNode)
    );

    expect(getWebIdUrl(personDataset, aliceWebIdUrl)).toEqual(webIdUrl);
  });
});

describe("createPersonContact", () => {
  const addressBookIri = "https://user.example.com/contacts";
  const webIdUrl = "https://user.example.com/card";

  beforeEach(() => {
    mockedUuid
      .mockReturnValue("1234")
      .mockReturnValueOnce("5678")
      .mockReturnValueOnce("9012");
  });

  test("it creates a new contact with a given schema object", async () => {
    const schema = {
      webId: webIdUrl,
      addresses: [
        {
          countryName: "Fake Country",
          locality: "Fake Town",
          postalCode: "55555",
          region: "Fake State",
          streetAddress: "123 Fake St.",
        },
      ],
      fn: "Test Person",
      emails: [
        {
          type: "Home",
          value: "test@example.com",
        },
        {
          type: "Work",
          value: "test.person@example.com",
        },
      ],
      telephones: [
        {
          type: "Home",
          value: "555-555-5555",
        },
      ],
      organizationName: "Test Company",
      role: "Developer",
    };

    const { dataset } = await createPersonContact(addressBookIri, schema);

    const things = solidClientFns.getThingAll(dataset);
    const webId = things[0]; // always the first thing in this dataset
    const addressesThing = things[4];
    const emailsAndPhones = things.reduce(
      (memo, t) =>
        memo.concat(solidClientFns.getStringNoLocaleAll(t, vcard.value)),
      []
    );
    const webIdThing = things[1];
    expect(solidClientFns.getUrl(webIdThing, vcard.value)).toEqual(webIdUrl);
    expect(solidClientFns.getStringNoLocale(webId, vcard.fn)).toEqual(
      "Test Person"
    );
    expect(
      solidClientFns.getStringNoLocale(webId, vcardExtras("organization-name"))
    ).toEqual("Test Company");
    expect(solidClientFns.getStringNoLocale(webId, vcard.role)).toEqual(
      "Developer"
    );
    expect(emailsAndPhones).toContain("test@example.com");
    expect(emailsAndPhones).toContain("test.person@example.com");
    expect(emailsAndPhones).toContain("555-555-5555");
    expect(
      solidClientFns.getStringNoLocale(
        addressesThing,
        vcardExtras("country-name")
      )
    ).toEqual("Fake Country");
    expect(
      solidClientFns.getStringNoLocale(addressesThing, vcard.locality)
    ).toEqual("Fake Town");
    expect(
      solidClientFns.getStringNoLocale(
        addressesThing,
        vcardExtras("postal-code")
      )
    ).toEqual("55555");
    expect(
      solidClientFns.getStringNoLocale(addressesThing, vcard.region)
    ).toEqual("Fake State");
    expect(
      solidClientFns.getStringNoLocale(
        addressesThing,
        vcardExtras("street-address")
      )
    ).toEqual("123 Fake St.");
  });
});

describe("findPersonContactInAddressBook", () => {
  const addressBook = mockAddressBook();
  const webId1Url = aliceWebIdUrl;
  const webId2Url = bobWebIdUrl;
  const webId1 = mockPersonDatasetAlice();
  const person1Thing = mockPersonContact(addressBook, person1Url);
  const webId2 = mockPersonDatasetBob();
  const person2Thing = mockPersonContact(addressBook, person2Url);
  const people = [
    { dataset: webId1, thing: person1Thing },
    { dataset: webId2, thing: person2Thing },
  ];
  const profiles = [
    solidClientFns.mockThingFrom(webId1Url),
    solidClientFns.mockThingFrom(webId2Url),
  ];

  beforeEach(() => {
    jest.spyOn(contactModel, "getContactAll").mockResolvedValue(people);
    jest
      .spyOn(profileModel, "getProfilesForPersonContacts")
      .mockResolvedValue(profiles);
  });

  it("finds a given WebId from a list of profiles fetched from a list of datasets about people", async () => {
    const [profile1] = await findPersonContactInAddressBook(
      addressBook,
      webId1Url,
      fetch
    );
    expect(solidClientFns.asUrl(profile1)).toEqual(webId1Url);
  });

  it("returns an empty list if no profile is found", async () => {
    await expect(
      findPersonContactInAddressBook(addressBook, webId2, fetch)
    ).resolves.toEqual([]);
  });
});
