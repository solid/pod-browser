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

/* eslint-disable camelcase */
import { ldp, rdf, acl, dc, foaf, vcard } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import { asUrl } from "@inrupt/solid-client";
import * as resourceFns from "../solidClientHelpers/resource";
import * as addressBookFns from ".";

import {
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
} from "../../__testUtils/mockPersonResource";
import { mockPersonContactDataset } from "../../__testUtils/mockContactResource";

import {
  createAddressBook,
  createContact,
  getGroups,
  getContacts,
  getProfiles,
  getSchemaFunction,
  mapSchema,
  getSchemaOperations,
  saveContact,
  saveNewAddressBook,
  schemaFunctionMappings,
  shortId,
  vcardExtras,
  contactsContainerIri,
  deleteContact,
  createContactTypeNotFoundError,
  findContactInAddressBook,
} from "./index";
import { chain, defineDataset } from "../solidClientHelpers/utils";

const {
  createThing,
  getStringNoLocale,
  getStringNoLocaleAll,
  getUrl,
  getUrlAll,
} = solidClientFns;

describe("createAddressBook", () => {
  test("it creates all the datasets that an addressBook needs, with a default title", () => {
    const iri = "https://example.pod.com/contacts";
    const owner = "https://example.pod.com/card#me";

    const { people, groups, index } = createAddressBook({ iri, owner });

    expect(getUrlAll(groups.dataset, ldp.contains)).toHaveLength(0);
    expect(groups.iri).toEqual(`${iri}/groups.ttl`);

    expect(getUrlAll(people.dataset, ldp.contains)).toHaveLength(0);
    expect(people.iri).toEqual(`${iri}/people.ttl`);

    expect(index.iri).toEqual(`${iri}/index.ttl`);
    expect(getStringNoLocale(index.dataset, dc.title)).toEqual("Contacts");
    expect(getUrl(index.dataset, rdf.type)).toEqual(vcardExtras("AddressBook"));
    expect(getUrl(index.dataset, acl.owner)).toEqual(owner);
    expect(getUrl(index.dataset, vcardExtras("nameEmailIndex"))).toEqual(
      "https://example.pod.com/contacts/people.ttl"
    );
    expect(getUrl(index.dataset, vcardExtras("groupIndex"))).toEqual(
      "https://example.pod.com/contacts/groups.ttl"
    );
  });

  test("it creates all the datasets that an addressBook needs, with a given title", () => {
    const iri = "https://example.pod.com/contacts";
    const owner = "https://example.pod.com/card#me";
    const title = "My Address Book";

    const { people, groups, index } = createAddressBook({ iri, owner, title });

    expect(getUrlAll(groups.dataset, ldp.contains)).toHaveLength(0);
    expect(groups.iri).toEqual(`${iri}/groups.ttl`);

    expect(getUrlAll(people.dataset, ldp.contains)).toHaveLength(0);
    expect(people.iri).toEqual(`${iri}/people.ttl`);

    expect(index.iri).toEqual(`${iri}/index.ttl`);
    expect(getStringNoLocale(index.dataset, dc.title)).toEqual(title);
    expect(getUrl(index.dataset, rdf.type)).toEqual(vcardExtras("AddressBook"));
    expect(getUrl(index.dataset, acl.owner)).toEqual(owner);
    expect(getUrl(index.dataset, vcardExtras("nameEmailIndex"))).toEqual(
      "https://example.pod.com/contacts/people.ttl"
    );
    expect(getUrl(index.dataset, vcardExtras("groupIndex"))).toEqual(
      "https://example.pod.com/contacts/groups.ttl"
    );
  });
});

describe("createContact", () => {
  const addressBookIri = "https://user.example.com/contacts";
  const webId = "https://user.example.com/card";

  test("it creates a new contact with a given schema object", () => {
    const schema = {
      webId,
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

    const { dataset } = createContact(addressBookIri, schema, [foaf.Person]);
    const emailsAndPhones = getStringNoLocaleAll(dataset, vcard.value);

    expect(getStringNoLocale(dataset, vcard.fn)).toEqual("Test Person");
    expect(getUrl(dataset, foaf.openid)).toEqual(webId);
    expect(
      getStringNoLocale(dataset, vcardExtras("organization-name"))
    ).toEqual("Test Company");
    expect(getStringNoLocale(dataset, vcard.role)).toEqual("Developer");
    expect(emailsAndPhones).toContain("test@example.com");
    expect(emailsAndPhones).toContain("test.person@example.com");
    expect(emailsAndPhones).toContain("555-555-5555");
    expect(getStringNoLocale(dataset, vcardExtras("country-name"))).toEqual(
      "Fake Country"
    );
    expect(getStringNoLocale(dataset, vcard.locality)).toEqual("Fake Town");
    expect(getStringNoLocale(dataset, vcardExtras("postal-code"))).toEqual(
      "55555"
    );
    expect(getStringNoLocale(dataset, vcard.region)).toEqual("Fake State");
    expect(getStringNoLocale(dataset, vcardExtras("street-address"))).toEqual(
      "123 Fake St."
    );
  });

  it("throws an error if no container is found", () => {
    const contact = { type: "type" };
    expect(() => createContact(addressBookIri, contact, [])).toThrow(
      createContactTypeNotFoundError(contact)
    );
  });
});

describe("getGroups", () => {
  test("it fetches the groups for a given address book", async () => {
    const containerIri = "https://user.example.com/contacts";
    const fetch = jest.fn();

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: "dataset" });

    jest
      .spyOn(solidClientFns, "getStringNoLocaleAll")
      .mockReturnValueOnce(["Group1", "Group2"]);

    jest
      .spyOn(solidClientFns, "getUrlAll")
      .mockReturnValueOnce([
        "https://example.com/Group1.ttl",
        "https://example.com/Group2.ttl",
      ]);

    const {
      response: [group1, group2],
    } = await getGroups(containerIri, fetch);

    expect(group1.iri).toEqual("https://example.com/Group1.ttl");
    expect(group1.name).toEqual("Group1");
    expect(group2.iri).toEqual("https://example.com/Group2.ttl");
    expect(group2.name).toEqual("Group2");
  });

  test("it returns an error if the group index does not exist", async () => {
    const containerIri = "https://user.example.com/contacts";
    const fetch = jest.fn();

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ error: "There was an error" });

    const { error } = await getGroups(containerIri, fetch);

    expect(error).toEqual("There was an error");
  });
});

describe("getSchemaFunction", () => {
  test("it returns a function for the given key, value", () => {
    const value = "https://user.example.com/card#me";
    const options = { name: "this" };
    const fn = getSchemaFunction("webId", value);
    const thing = fn(createThing(options));

    expect(getUrl(thing, foaf.openid)).toEqual(value);
  });

  test("it returns an identity function if the key does not exist in the map", () => {
    const value = "value";
    const options = { name: "this" };
    const thing = createThing(options);
    const fn = getSchemaFunction("invalid", value);
    const newThing = fn(thing);

    expect(newThing).toEqual(thing);
  });
});

describe("mapSchema", () => {
  test("it maps the schema to a thing with a generated name with a prefix", () => {
    const schema = { fn: "test" };
    const fn = mapSchema("prefix");
    const { name, thing } = fn(schema);

    expect(name).toMatch(/prefix-[\w\d]{7}/);
    expect(getStringNoLocale(thing, vcard.fn)).toEqual("test");
  });
});

describe("getSchemaOperations", () => {
  test("it returns a list of operations bound to the given values", () => {
    const schema = { fn: "Test", name: "Test" };
    const operations = getSchemaOperations(schema);

    expect(operations).toHaveLength(2);
  });

  test("it returns an emtpy arry if no schema is given", () => {
    const operations = getSchemaOperations();

    expect(operations).toHaveLength(0);
  });

  test("it only returns operations for string values", () => {
    const schema = { fn: "Test", name: "Test", address: [] };
    const operations = getSchemaOperations(schema);

    expect(operations).toHaveLength(2);
  });
});

describe("getContacts", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it fetches the people in the address book", async () => {
    const mockIndexFileDatasetIri =
      "https://user.example.com/contacts/people.ttl";

    const fetch = jest.fn();
    const personContainer1 = "https://user.example.com/contacts/Person/1234/";
    const personContainer2 = "https://user.example.com/contacts/Person/5678/";
    const expectedPerson1 = {
      dataset: mockPersonContactDataset(),
      iri: `${personContainer1}index.ttl`,
    };
    const expectedPerson2 = {
      dataset: mockPersonContactDataset(),
      iri: `${personContainer2}index.ttl`,
    };

    const mockIndexFileDataset = chain(
      solidClientFns.mockSolidDatasetFrom(mockIndexFileDatasetIri),
      (indexDataset) =>
        solidClientFns.setThing(indexDataset, mockPersonDatasetAlice()),
      (indexDataset) =>
        solidClientFns.setThing(indexDataset, mockPersonDatasetBob())
    );

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: expectedPerson1 })
      .mockResolvedValueOnce({ response: expectedPerson2 });

    const {
      response: [person1, person2],
    } = await getContacts(mockIndexFileDataset, vcard.Individual, fetch);

    expect(person1).toEqual(expectedPerson1);
    expect(person2).toEqual(expectedPerson2);
  });

  test("it filters out the contacts that it cannot fetch due to an error", async () => {
    const personContainer1 = "https://user.example.com/contacts/Person/1234/";
    const expectedPerson1 = {
      dataset: mockPersonContactDataset(),
      iri: `${personContainer1}index.ttl`,
    };
    const mockIndexFileDatasetIri =
      "https://user.example.com/contacts/people.ttl";
    const mockIndexFileDataset = chain(
      solidClientFns.mockSolidDatasetFrom(mockIndexFileDatasetIri),
      (indexDataset) =>
        solidClientFns.setThing(indexDataset, mockPersonDatasetAlice()),
      (indexDataset) =>
        solidClientFns.setThing(indexDataset, mockPersonDatasetBob())
    );
    const fetch = jest.fn();

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: expectedPerson1 })
      .mockResolvedValueOnce({ error: "There was an error" });

    const { response: results } = await getContacts(
      mockIndexFileDataset,
      vcard.Individual,
      fetch
    );

    expect(results).toHaveLength(1);
  });

  it("returns an empty array if indexFileDataset is not given", async () => {
    const { response } = await getContacts();
    expect(response).toEqual([]);
  });
});

describe("getProfiles", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("it fetches the profiles of the given people contacts", async () => {
    const fetch = jest.fn();
    const person1 = {
      dataset: "Person 1",
      iri: "https://user.example.com/contacts/Person/1234/index.ttl",
    };
    const person2 = {
      dataset: "Person 2",
      iri: "https://user.example.com/contacts/Person/1234/index.ttl",
    };
    const expectedProfile1 = {
      webId: "http://testperson.example.com/profile/card#me",
    };
    const expectedProfile2 = {
      webId: "http://anotherperson.example.com/profile/card#me",
    };

    const mockThingProfile1 = solidClientFns.mockThingFrom(
      expectedProfile1.webId
    );
    const mockThingProfile2 = solidClientFns.mockThingFrom(
      expectedProfile2.webId
    );

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: { dataset: "Profile 1", iri: expectedProfile1.webId },
      })
      .mockResolvedValueOnce({
        response: { dataset: "Profile 2", iri: expectedProfile2.webId },
      });

    jest
      .spyOn(solidClientFns, "addStringNoLocale")
      .mockReturnValueOnce(mockThingProfile1)
      .mockReturnValueOnce(mockThingProfile2);

    jest
      .spyOn(solidClientFns, "getUrl")
      .mockReturnValueOnce(expectedProfile1.webId)
      .mockReturnValueOnce(expectedProfile2.webId);

    const [profile1, profile2] = await getProfiles([person1, person2], fetch);

    expect(profile1.internal_url).toEqual(expectedProfile1.webId);
    expect(profile2.internal_url).toEqual(expectedProfile2.webId);
  });
  test("it filters out people for which the resource couldn't be fetched", async () => {
    const fetch = jest.fn();
    const person1 = {
      dataset: "Person 1",
      iri: "https://user.example.com/contacts/Person/1234/index.ttl",
    };
    const person2 = {
      dataset: "Person 2",
      iri: "https://user.example.com/contacts/Person/1234/index.ttl",
    };
    const expectedProfile = {
      webId: "http://testperson.example.com/profile/card#me",
    };
    const mockThingProfile = solidClientFns.mockThingFrom(
      expectedProfile.webId
    );

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: { dataset: "Profile 1", iri: expectedProfile.webId },
      })
      .mockResolvedValueOnce({
        error: "There was an error",
      });

    jest
      .spyOn(solidClientFns, "addStringNoLocale")
      .mockReturnValueOnce(mockThingProfile);

    jest
      .spyOn(solidClientFns, "getUrl")
      .mockReturnValueOnce(expectedProfile.webId);

    const profiles = await getProfiles([person1, person2], fetch);

    expect(profiles).toHaveLength(1);
  });
});

describe("findContactInAddressBook", () => {
  const webId1Url = aliceWebIdUrl;
  const webId1 = mockPersonDatasetAlice();
  const webId2Url = bobWebIdUrl;
  const webId2 = mockPersonDatasetBob();
  const webId3Url = "http://example.com/#webId3";
  const people = [{ dataset: webId1 }, { dataset: webId2 }];
  const fetch = "fetch";

  beforeEach(() => {
    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: { dataset: webId1, iri: webId1Url } })
      .mockResolvedValueOnce({ response: { dataset: webId2, iri: webId2Url } });
  });

  it("finds a given WebId from a list of profiles fetched from a list of datasets about people", async () => {
    const [profile1] = await findContactInAddressBook(people, webId1Url, fetch);
    expect(asUrl(profile1)).toEqual(webId1Url);
  });

  it("returns an empty list if no profile is found", async () => {
    await expect(
      findContactInAddressBook(people, webId3Url, fetch)
    ).resolves.toEqual([]);
  });
});

describe("saveContact", () => {
  const addressBookIri = "https://user.example.com/contacts";
  const mockAddressBook = solidClientFns.mockSolidDatasetFrom(addressBookIri);
  const webId = "https://user.example.com/card#me";
  const contactDataset = solidClientFns.mockSolidDatasetFrom(webId);
  const peopleIndexIri = `${addressBookIri}/people.ttl`;
  const peopleIndexDataset = solidClientFns.mockSolidDatasetFrom(
    peopleIndexIri
  );
  const schema = { webId, fn: "Test Person" };
  const errorMessage = "boom";

  let fetch;

  beforeEach(() => {
    fetch = jest.fn();

    jest
      .spyOn(addressBookFns, "getIndexDatasetFromAddressBook")
      .mockResolvedValue({ response: peopleIndexDataset });

    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(peopleIndexDataset);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("saves the contact and the people index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: contactDataset })
      .mockResolvedValueOnce({ response: peopleIndexDataset });

    jest.spyOn(resourceFns, "getResource").mockResolvedValueOnce({
      response: {
        iri: `${addressBookIri}/people.ttl`,
        dataset: peopleIndexDataset,
      },
    });

    const {
      response: { contact, contacts },
    } = await saveContact(mockAddressBook, schema, [foaf.Person], fetch);

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
        iri: `${addressBookIri}/people.ttl`,
        dataset: peopleIndexDataset,
      },
    });

    const {
      response: { contact, contacts },
    } = await saveContact(
      mockAddressBook,
      { webId, name: "Test Person" },
      [foaf.Person],
      fetch
    );

    expect(contact).toEqual(contactDataset);
    expect(contacts).toEqual(peopleIndexDataset);
  });

  it("returns an error if it can't save the new contact", async () => {
    jest.spyOn(resourceFns, "saveResource").mockResolvedValue({
      error: errorMessage,
    });

    const { error } = await saveContact(
      mockAddressBook,
      schema,
      [foaf.Person],
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
      mockAddressBook,
      schema,
      [foaf.Person],
      fetch
    );

    expect(error).toEqual(errorMessage);
  });
});

describe("deleteContact", () => {
  const addressBookUrl = "https://example.com/contacts";
  const contactContainerUrl = "http://example.com/contact/id-001/";
  const contactUrl = `${contactContainerUrl}index.ttl`;
  const mockContactToDelete = chain(
    solidClientFns.mockThingFrom(contactUrl),
    (t) => solidClientFns.addUrl(t, rdf.type, vcard.Individual),
    (t) => solidClientFns.addUrl(t, foaf.openid, contactUrl)
  );

  const contactToDelete = {
    iri: contactUrl,
    dataset: mockContactToDelete,
  };

  const peopleIndexIri = `${addressBookUrl}/people.ttl`;

  const peopleIndexDataset = chain(
    solidClientFns.mockSolidDatasetFrom(peopleIndexIri),
    (indexDataset) =>
      solidClientFns.setThing(indexDataset, mockContactToDelete),
    (indexDataset) =>
      solidClientFns.setThing(indexDataset, mockPersonContactDataset())
  );

  const updatedPeopleIndexDataset = chain(
    solidClientFns.mockSolidDatasetFrom(peopleIndexIri),
    (indexDataset) =>
      solidClientFns.setThing(indexDataset, mockPersonContactDataset())
  );

  let fetch;
  let mockDeleteFile;
  let mockSaveResource;

  beforeEach(() => {
    fetch = jest.fn();

    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(peopleIndexDataset);

    mockDeleteFile = jest
      .spyOn(solidClientFns, "deleteFile")
      .mockResolvedValue();

    mockSaveResource = jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValue(updatedPeopleIndexDataset);
  });

  afterEach(() => jest.restoreAllMocks());

  test("it deletes the contact file and its containing folder", async () => {
    await deleteContact(addressBookUrl, contactToDelete, foaf.Person, fetch);

    expect(mockDeleteFile).toHaveBeenCalledTimes(2);
    expect(mockDeleteFile).toHaveBeenNthCalledWith(1, contactUrl, { fetch });
    expect(mockDeleteFile).toHaveBeenNthCalledWith(2, contactContainerUrl, {
      fetch,
    });
  });

  test("it updates the people index", async () => {
    await deleteContact(addressBookUrl, contactToDelete, foaf.Person, fetch);

    expect(mockSaveResource).toHaveBeenCalledWith(
      { dataset: updatedPeopleIndexDataset, iri: peopleIndexIri },
      fetch
    );
  });

  it("throws an error if saving resource fails", async () => {
    const error = "error";
    mockSaveResource.mockResolvedValue({ error });

    await expect(
      deleteContact(addressBookUrl, contactToDelete, foaf.Person, fetch)
    ).rejects.toEqual(error);
  });
});

describe("saveNewAddressBook", () => {
  const iri = "https://example.pod.com/contacts";
  const owner = "https://example.pod.com/card#me";
  const error401 = "401 Unauthorized";
  const error500 = "500 Server error";

  beforeEach(() => {
    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValue({ error: "There was an error" });
  });

  test("it saves a new address at the given iri, for the given owner, with a default title", async () => {
    const addressBook = createAddressBook({ iri, owner });

    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: addressBook.index })
      .mockResolvedValueOnce({ response: addressBook.groups })
      .mockResolvedValueOnce({ response: addressBook.people });

    await saveNewAddressBook({ iri, owner });

    const { calls } = resourceFns.saveResource.mock;

    const [saveIndexArgs, saveGroupsArgs, savePeopleArgs] = calls;

    expect(saveIndexArgs[0].iri).toEqual(addressBook.index.iri);
    expect(saveGroupsArgs[0].iri).toEqual(addressBook.groups.iri);
    expect(savePeopleArgs[0].iri).toEqual(addressBook.people.iri);
  });

  test("it returns an error if the user is unauthorized", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ error: error401 })
      .mockResolvedValueOnce({ error: error401 })
      .mockResolvedValueOnce({ error: error401 });

    const { error } = await saveNewAddressBook({ iri, owner });

    expect(error).toEqual(
      "You do not have permission to create an address book"
    );
  });

  test("it returns an error if the address book already exists", async () => {
    resourceFns.getResource.mockResolvedValue({
      response: "existing address book",
    });

    const { error } = await saveNewAddressBook({ iri, owner }, jest.fn());

    expect(error).toEqual("Address book already exists.");
  });

  it("passes the error on if it isn't a 401 error", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ error: error500 })
      .mockResolvedValueOnce({ error: error401 })
      .mockResolvedValueOnce({ error: error401 });

    const { error } = await saveNewAddressBook({ iri, owner });

    expect(error).toEqual(error500);
  });

  it("returns an error if it fails to save group index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: "index" })
      .mockResolvedValueOnce({ error: error500 })
      .mockResolvedValueOnce({ response: "people" });

    const { error } = await saveNewAddressBook({ iri, owner });

    expect(error).toEqual(error500);
  });

  it("returns an error if it fails to save people index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: "index" })
      .mockResolvedValueOnce({ response: "group" })
      .mockResolvedValueOnce({ error: error500 });

    const { error } = await saveNewAddressBook({ iri, owner });

    expect(error).toEqual(error500);
  });
});

describe("schemaFunctionMappings", () => {
  test("webId sets a foaf.openid", () => {
    const webId = "https://user.example.com/card#me";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.webId(webId)(createThing(options));

    expect(getUrl(thing, foaf.openid)).toEqual(webId);
  });

  test("fn sets a vcard.fn", () => {
    const value = "Test Person";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.fn(value)(createThing(options));

    expect(getStringNoLocale(thing, vcard.fn)).toEqual(value);
  });

  test("name sets a foaf.name", () => {
    const value = "Test Person";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.name(value)(createThing(options));

    expect(getStringNoLocale(thing, foaf.name)).toEqual(value);
  });

  test("organizationName sets a 'vcard' organization-name", () => {
    const value = "Test Org";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.organizationName(value)(
      createThing(options)
    );

    expect(getStringNoLocale(thing, vcardExtras("organization-name"))).toEqual(
      value
    );
  });

  test("role sets a vcard.role", () => {
    const value = "Developer";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.role(value)(createThing(options));

    expect(getStringNoLocale(thing, vcard.role)).toEqual(value);
  });

  test("countryName sets a 'vcard' country-name", () => {
    const value = "Fake Country";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.countryName(value)(
      createThing(options)
    );

    expect(getStringNoLocale(thing, vcardExtras("country-name"))).toEqual(
      value
    );
  });

  test("locality sets a vcard.locality", () => {
    const value = "Fake Town";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.locality(value)(createThing(options));

    expect(getStringNoLocale(thing, vcard.locality)).toEqual(value);
  });

  test("postalCode sets a 'vcard' postal-code", () => {
    const value = "55555";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.postalCode(value)(
      createThing(options)
    );

    expect(getStringNoLocale(thing, vcardExtras("postal-code"))).toEqual(value);
  });

  test("region sets a vcard.region", () => {
    const value = "Fake State";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.region(value)(createThing(options));

    expect(getStringNoLocale(thing, vcard.region)).toEqual(value);
  });

  test("streetAddress sets a 'vcard' street-address", () => {
    const value = "123 Fake St.";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.streetAddress(value)(
      createThing(options)
    );

    expect(getStringNoLocale(thing, vcardExtras("street-address"))).toEqual(
      value
    );
  });

  test("type sets an rdf.type", () => {
    const value = "type";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.type(value)(createThing(options));

    expect(getStringNoLocale(thing, rdf.type)).toEqual(value);
  });

  test("value sets a vcard.value", () => {
    const value = "value";
    const options = { name: "this" };
    const thing = schemaFunctionMappings.value(value)(createThing(options));

    expect(getStringNoLocale(thing, vcard.value)).toEqual(value);
  });
});

describe("shortId", () => {
  test("it creates a short id string", () => {
    expect(shortId()).toMatch(/[\w\d]{7}/);
  });
});

describe("vcardExtras", () => {
  test("it returns an unsupported vcard attribute", () => {
    expect(vcardExtras("attribute")).toEqual(
      "http://www.w3.org/2006/vcard/ns#attribute"
    );
  });
});

describe("contactsContainerIri", () => {
  test("it appends the container path to the given iri", () => {
    expect(contactsContainerIri("http://example.com")).toEqual(
      "http://example.com/contacts/"
    );
  });
});

describe("getIndexDatasetFromAddressBook", () => {
  const addressBookIri = "https://user.example.com/contacts";
  const peopleIndexIri = `${addressBookIri}/people.ttl`;
  const peopleIndexDataset = solidClientFns.mockSolidDatasetFrom(
    peopleIndexIri
  );
  const addressBook = solidClientFns.mockSolidDatasetFrom(addressBookIri);
  const addressBookDataset = defineDataset(
    { url: addressBookIri },
    (t) => solidClientFns.addUrl(t, rdf.type, vcardExtras("AddressBook")),
    (t) =>
      solidClientFns.addUrl(t, vcardExtras("nameEmailIndex"), peopleIndexIri)
  );
  const nameEmailIndex = "http://www.w3.org/2006/vcard/ns#nameEmailIndex";

  beforeAll(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("it gets the index dataset for a given address book and predicate", async () => {
    const fetch = jest.fn();
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(addressBookDataset)
      .mockResolvedValueOnce(peopleIndexDataset);

    const {
      response: results,
    } = await addressBookFns.getIndexDatasetFromAddressBook(
      addressBook,
      nameEmailIndex,
      fetch
    );
    expect(results).toBe(peopleIndexDataset);
  });

  it("returns an error if anything goes wrong", async () => {
    const fetchError = new Error("error");
    jest.spyOn(solidClientFns, "getSolidDataset").mockImplementation(() => {
      throw fetchError;
    });

    const {
      error,
    } = await addressBookFns.getIndexDatasetFromAddressBook(
      addressBook,
      nameEmailIndex,
      () => {}
    );
    expect(error).toEqual(fetchError);
  });
});
