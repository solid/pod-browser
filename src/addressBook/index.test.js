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

import { foaf, rdf, vcard } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import {
  createThing,
  getStringNoLocale,
  getUrl,
  asUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import * as resourceFns from "../solidClientHelpers/resource";
import * as addressBookFns from ".";
import {
  aliceAlternativeProfileUrl,
  aliceAlternativeWebIdUrl,
  aliceProfileUrl,
  aliceWebIdUrl,
  bobAlternateProfileUrl,
  bobAlternateWebIdUrl,
  bobProfileUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  mockWebIdNode,
} from "../../__testUtils/mockPersonResource";
import mockPersonContactThing from "../../__testUtils/mockPersonContactThing";
import {
  contactsContainerIri,
  findContactInAddressBook,
  getContacts,
  getContactsIndexIri,
  getProfiles,
  getSchemaFunction,
  getSchemaOperations,
  mapSchema,
  schemaFunctionMappings,
  shortId,
  vcardExtras,
} from "./index";
import { chain } from "../solidClientHelpers/utils";
import { joinPath } from "../stringHelpers";

describe("getSchemaFunction", () => {
  test("it returns a function for the given key, value", () => {
    const value = mockWebIdNode("https://user.example.com/card#me")
      .webIdNodeUrl;
    const options = { name: "this" };
    const fn = getSchemaFunction("webId", value);
    const thing = fn(createThing(options));

    expect(getUrl(thing, vcard.url)).toEqual(value);
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
    const fetch = jest.fn();

    const mockIndexFileDatasetIri =
      "https://user.example.com/contacts/people.ttl";
    const mockIndexFileDataset = chain(
      solidClientFns.mockSolidDatasetFrom(mockIndexFileDatasetIri),
      (d) => solidClientFns.setThing(d, mockPersonDatasetAlice()),
      (d) => solidClientFns.setThing(d, mockPersonDatasetBob())
    );

    const personContainer1 = "https://user.example.com/contacts/Person/1234/";
    const personDoc1 = joinPath(personContainer1, "index.ttl");
    const personIri1 = `${personDoc1}#me`;
    const expectedPerson1 = {
      dataset: chain(mockSolidDatasetFrom(personDoc1), (d) =>
        setThing(d, mockPersonContactThing(personIri1))
      ),
      iri: personIri1,
    };
    const personContainer2 = "https://user.example.com/contacts/Person/5678/";
    const personDoc2 = joinPath(personContainer2, "index.ttl");
    const personIri2 = `${personDoc2}#me`;
    const expectedPerson2 = {
      dataset: chain(mockSolidDatasetFrom(personDoc2), (d) =>
        setThing(d, mockPersonContactThing(personIri2))
      ),
      iri: personIri2,
    };

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: expectedPerson1 })
      .mockResolvedValueOnce({ response: expectedPerson2 });

    const [person1, person2] = await getContacts(
      mockIndexFileDataset,
      vcard.Individual,
      fetch
    );

    expect(person1).toEqual(expectedPerson1);
    expect(person2).toEqual(expectedPerson2);
  });

  test("it filters out the contacts that it cannot fetch due to an error", async () => {
    const personContainer1 = "https://user.example.com/contacts/Person/1234/";
    const personDoc1 = joinPath(personContainer1, "index.ttl");
    const personIri1 = `${personDoc1}#me`;
    const expectedPerson1 = {
      dataset: chain(mockSolidDatasetFrom(personDoc1), (d) =>
        setThing(d, mockPersonContactThing(personIri1))
      ),
      iri: personIri1,
    };

    const mockIndexFileDatasetIri =
      "https://user.example.com/contacts/people.ttl";
    const mockIndexFileDataset = chain(
      solidClientFns.mockSolidDatasetFrom(mockIndexFileDatasetIri),
      (d) => solidClientFns.setThing(d, mockPersonDatasetAlice()),
      (d) => solidClientFns.setThing(d, mockPersonDatasetBob())
    );
    const fetch = jest.fn();

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({ response: expectedPerson1 })
      .mockResolvedValueOnce({ error: "There was an error" });

    const results = await getContacts(
      mockIndexFileDataset,
      vcard.Individual,
      fetch
    );

    expect(results).toHaveLength(1);
  });

  it("returns an empty array if indexFileDataset is not given", async () => {
    const response = await getContacts();
    expect(response).toEqual([]);
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

    expect(addressBookFns.getWebIdUrl(personDataset, aliceWebIdUrl)).toEqual(
      webIdUrl
    );
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

    expect(addressBookFns.getWebIdUrl(personDataset, bobWebIdUrl)).toEqual(
      foafId
    );
  });
});

describe("getProfiles", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it fetches the profiles of the given people contacts", async () => {
    const fetch = jest.fn();
    const person1 = {
      dataset: chain(mockSolidDatasetFrom(aliceProfileUrl), (d) =>
        setThing(d, mockPersonDatasetAlice())
      ),
      iri: aliceWebIdUrl,
    };
    const person2 = {
      dataset: chain(mockSolidDatasetFrom(bobProfileUrl), (d) =>
        setThing(d, mockPersonDatasetBob())
      ),
      iri: bobWebIdUrl,
    };

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: {
          dataset: chain(
            mockSolidDatasetFrom(aliceAlternativeProfileUrl),
            (d) =>
              setThing(
                d,
                chain(
                  solidClientFns.mockThingFrom(aliceAlternativeWebIdUrl),
                  (t) => setUrl(t, rdf.type, foaf.Person)
                )
              )
          ),
          iri: aliceAlternativeWebIdUrl,
        },
      })
      .mockResolvedValueOnce({
        response: {
          dataset: chain(mockSolidDatasetFrom(bobAlternateProfileUrl), (d) =>
            setThing(
              d,
              chain(solidClientFns.mockThingFrom(bobAlternateWebIdUrl), (t) =>
                setUrl(t, rdf.type, foaf.Person)
              )
            )
          ),
          iri: bobAlternateWebIdUrl,
        },
      });

    const [profile1, profile2] = await getProfiles([person1, person2], fetch);

    expect(asUrl(profile1)).toEqual(aliceAlternativeWebIdUrl);
    expect(asUrl(profile2)).toEqual(bobAlternateWebIdUrl);
  });

  test("it filters out people for which the resource couldn't be fetched", async () => {
    const fetch = jest.fn();
    const person1Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person1 = {
      dataset: chain(mockSolidDatasetFrom(person1Iri), (d) =>
        setThing(
          d,
          chain(mockThingFrom(person1Iri), (t) =>
            setUrl(t, rdf.type, foaf.Person)
          )
        )
      ),
      iri: person1Iri,
    };
    const person2Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person2 = {
      dataset: chain(mockSolidDatasetFrom(person2Iri), (d) =>
        setThing(
          d,
          chain(mockThingFrom(person2Iri), (t) =>
            setUrl(t, rdf.type, foaf.Person)
          )
        )
      ),
      iri: person2Iri,
    };

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: { dataset: person1.dataset, iri: person1.iri },
      })
      .mockResolvedValueOnce({
        error: "There was an error",
      });

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
  const people = [
    { dataset: webId1, iri: webId1Url },
    { dataset: webId2, iri: webId2Url },
  ];
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

describe("schemaFunctionMappings", () => {
  test("webId sets a vcard.url", () => {
    const webId = "https://user.example.com/card#me";
    const options = { name: "this" };
    const { webIdNode, webIdNodeUrl } = mockWebIdNode(webId);
    const thing = schemaFunctionMappings.webId(webIdNodeUrl)(
      createThing(options)
    );
    expect(getUrl(thing, vcard.url)).toEqual(webIdNodeUrl);
    expect(getUrl(webIdNode, vcard.value)).toEqual(webId);
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

describe("getContactsIndexIri", () => {
  it("returns the URL for the central index file for contacts", () => {
    expect(getContactsIndexIri("/contacts/")).toEqual("/contacts/index.ttl");
  });
});
