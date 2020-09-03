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
import * as resourceFns from "../solidClientHelpers/resource";
import {
  createAddressBook,
  createContact,
  getGroups,
  getPeople,
  getSchemaFunction,
  mapSchema,
  getSchemaOperations,
  saveContact,
  saveNewAddressBook,
  schemaFunctionMappings,
  shortId,
  vcardExtras,
} from "./index";

const {
  createLitDataset,
  createThing,
  getStringNoLocale,
  getStringNoLocaleAll,
  getUrl,
  getUrlAll,
  setThing,
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
  test("it creates a new contact with a given schema object", () => {
    const addressBookIri = "https://user.example.com/contacts";
    const webId = "https://user.example.com/card";
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

    const { dataset } = createContact(addressBookIri, schema);
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

describe("getPeople", () => {
  test("it fetches the people in the address book", async () => {
    const containerIri = "https://user.example.com/contacts";
    const fetch = jest.fn();

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: "people container" })
      .mockResolvedValueOnce({ response: "Person 1" })
      .mockResolvedValueOnce({ response: "Person 2" });

    jest
      .spyOn(solidClientFns, "getUrlAll")
      .mockReturnValueOnce([
        "https://example.com/contacts/Person/1234/",
        "https://example.com/contacts/Person/5678/",
      ]);

    const {
      response: [person1, person2],
    } = await getPeople(containerIri, fetch);

    expect(person1).toEqual("Person 1");
    expect(person2).toEqual("Person 2");
  });

  test("it returns an error if it can't fetch the people container", async () => {
    const containerIri = "https://user.example.com/contacts";
    const fetch = jest.fn();

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ error: "There was an error" });

    const { error } = await getPeople(containerIri, fetch);

    expect(error).toEqual("There was an error");
  });

  test("it filters out people for which the resource couldn't be fetched", async () => {
    const containerIri = "https://user.example.com/contacts";
    const fetch = jest.fn();

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: "people container" })
      .mockResolvedValueOnce({ response: "Person 1" })
      .mockResolvedValueOnce({ error: "There was an error" });

    jest
      .spyOn(solidClientFns, "getUrlAll")
      .mockReturnValueOnce([
        "https://example.com/contacts/Person/1234/",
        "https://example.com/contacts/Person/5678/",
      ]);

    const { response } = await getPeople(containerIri, fetch);

    expect(response).toHaveLength(1);
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

describe("saveContact", () => {
  test("it returns an error if it can't save the dataset", async () => {
    const fetch = jest.fn();
    const addressBookIri = "https://user.example.com/contacts";
    const webId = "https://user.example.com/card#me";
    const contact = { webId, fn: "Test Person" };

    jest
      .spyOn(solidClientFns, "saveSolidDatasetAt")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveContact(addressBookIri, contact, fetch);

    expect(error).toEqual("boom");
  });

  test("it saves the contact and the people index", async () => {
    const fetch = jest.fn();
    const addressBookIri = "https://user.example.com/contacts";
    const webId = "https://user.example.com/card#me";
    const schema = { webId, fn: "Test Person" };
    const contactDataset = setThing(
      createLitDataset(),
      createThing({ name: "this" })
    );
    const peopleIndexDataset = setThing(
      createLitDataset(),
      createThing({ name: "this" })
    );
    const peopleDataset = setThing(
      createLitDataset(),
      createThing({ name: "this" })
    );

    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: contactDataset })
      .mockResolvedValueOnce({ response: peopleDataset });

    jest.spyOn(resourceFns, "getResource").mockResolvedValueOnce({
      response: {
        iri: `${addressBookIri}/people.ttl`,
        dataset: peopleIndexDataset,
      },
    });

    const {
      response: { contact, people },
    } = await saveContact(addressBookIri, schema, fetch);

    expect(contact).toEqual(contactDataset);
    expect(people).toEqual(peopleDataset);
  });
});

describe("saveNewAddressBook", () => {
  test("it saves a new address at the given iri, for the given owner, with a default title", async () => {
    const iri = "https://example.pod.com/contacts";
    const owner = "https://example.pod.com/card#me";
    const addressBook = createAddressBook({ iri, owner });

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ error: "There was an error" });

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

  test("it returns an error if the address book already exists", async () => {
    const iri = "https://example.pod.com/contacts";
    const owner = "https://example.pod.com/card#me";

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: "existing address book" });

    const { error } = await saveNewAddressBook({ iri, owner });

    expect(error).toEqual("Address book already exists.");
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
