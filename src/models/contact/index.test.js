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
import { getStringNoLocale, getThingAll, getUrl } from "@inrupt/solid-client";
import { mockWebIdNode } from "../../../__testUtils/mockPersonResource";
import * as addressBookFns from "../../addressBook";
import { VCARD_WEBID_PREDICATE, vcardExtras } from "../../addressBook";
import {
  createContact,
  createContactTypeNotFoundError,
  deleteContact,
  saveContact,
} from "./index";
import { chain } from "../../solidClientHelpers/utils";
import mockPersonContactThing, {
  addContactsToAddressBook,
} from "../../../__testUtils/mockPersonContactThing";
import * as resourceFns from "../../solidClientHelpers/resource";
import mockAddressBook from "../../../__testUtils/mockAddressBook";

describe("createContact", () => {
  const addressBookIri = "https://user.example.com/contacts";
  const addressBook = mockAddressBook({ containerIri: addressBookIri });
  const webId = "https://user.example.com/card";
  const mockWebIdNodeFn = jest
    .spyOn(addressBookFns, "createWebIdNodeFn")
    .mockImplementation(mockWebIdNode);

  it("creates a new contact with a given schema object", () => {
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
    const { dataset, iri } = createContact(
      addressBook,
      schema,
      [foaf.Person],
      mockWebIdNodeFn
    );

    expect(iri).toBeDefined();

    const things = getThingAll(dataset); // TODO: Should be able to refer to the various thing via getThing and a specific URL
    const contact = things[0];
    const emailHome = things[1];
    const emailWork = things[2];
    const address = things[3];
    const telephone = things[4];
    const webIdNode = things[5];

    // contact itself
    expect(getStringNoLocale(contact, vcard.fn)).toEqual(schema.fn);
    expect(
      getStringNoLocale(contact, vcardExtras("organization-name"))
    ).toEqual(schema.organizationName);
    expect(getStringNoLocale(contact, vcard.role)).toEqual(schema.role);

    // home email
    expect(getStringNoLocale(emailHome, rdf.type)).toEqual(
      schema.emails[0].type
    );
    expect(getStringNoLocale(emailHome, vcard.value)).toEqual(
      schema.emails[0].value
    );

    // work email
    expect(getStringNoLocale(emailWork, rdf.type)).toEqual(
      schema.emails[1].type
    );
    expect(getStringNoLocale(emailWork, vcard.value)).toEqual(
      schema.emails[1].value
    );

    // telephone
    expect(getStringNoLocale(telephone, rdf.type)).toEqual(
      schema.telephones[0].type
    );
    expect(getStringNoLocale(telephone, vcard.value)).toEqual(
      schema.telephones[0].value
    );

    // the address
    const addressSchema = schema.addresses[0];
    expect(getStringNoLocale(address, vcardExtras("country-name"))).toEqual(
      addressSchema.countryName
    );
    expect(getStringNoLocale(address, vcard.locality)).toEqual(
      addressSchema.locality
    );
    expect(getStringNoLocale(address, vcardExtras("postal-code"))).toEqual(
      addressSchema.postalCode
    );
    expect(getStringNoLocale(address, vcard.region)).toEqual(
      addressSchema.region
    );
    expect(getStringNoLocale(address, vcardExtras("street-address"))).toEqual(
      addressSchema.streetAddress
    );

    // the webId node
    expect(mockWebIdNodeFn).toHaveBeenCalledWith(webId, expect.anything());
    expect(getUrl(webIdNode, rdf.type)).toEqual(VCARD_WEBID_PREDICATE);
    expect(getUrl(webIdNode, vcard.value)).toEqual(schema.webId);
  });

  it("throws an error if no container is found", () => {
    const contact = { type: "type" };
    expect(() => createContact(addressBook, contact, [])).toThrow(
      createContactTypeNotFoundError(contact)
    );
  });
});

describe("saveContact", () => {
  const addressBookIri = "https://user.example.com/contacts";
  const webId = "https://user.example.com/card#me";
  const contactDataset = solidClientFns.mockSolidDatasetFrom(webId);
  const schema = { webId, fn: "Test Person" };
  const errorMessage = "boom";

  let fetch;
  let addressBook;

  beforeEach(() => {
    addressBook = mockAddressBook();
    fetch = jest.fn();
  });

  it("saves the contact and updates the people index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: contactDataset })
      .mockResolvedValueOnce({ response: addressBook.people.dataset });

    jest.spyOn(resourceFns, "getResource").mockResolvedValueOnce({
      response: {
        iri: `${addressBookIri}/people.ttl`,
        dataset: addressBook.people.dataset,
      },
    });

    const {
      response: { iri, dataset },
    } = await saveContact(addressBook, schema, [foaf.Person], fetch);

    expect(resourceFns.saveResource).toHaveBeenCalledTimes(2);

    expect(iri).toMatch(/https:\/\/user.example.com\/contacts\/Person\//);
    expect(dataset).toEqual(contactDataset);
  });

  it("also handles schema.name", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: contactDataset })
      .mockResolvedValueOnce({ response: addressBook.people.dataset });

    jest.spyOn(resourceFns, "getResource").mockResolvedValueOnce({
      response: {
        iri: `${addressBookIri}/people.ttl`,
        dataset: addressBook.people.dataset,
      },
    });

    const {
      response: { iri, dataset },
    } = await saveContact(
      addressBook,
      { webId, name: "Test Person" },
      [foaf.Person],
      fetch
    );

    expect(iri).toMatch(/https:\/\/user.example.com\/contacts\/Person\//);
    expect(dataset).toEqual(contactDataset);
  });

  it("returns an error if it can't save the new contact", async () => {
    jest.spyOn(resourceFns, "saveResource").mockResolvedValue({
      error: errorMessage,
    });

    const { error } = await saveContact(
      addressBook,
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
      addressBook,
      schema,
      [foaf.Person],
      fetch
    );

    expect(error).toEqual(errorMessage);
  });
});

describe("deleteContact", () => {
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

  let fetch;
  let mockDeleteFile;
  let mockSaveResource;
  let addressBook;
  let updatedPeopleIndexDataset;

  beforeEach(() => {
    addressBook = addContactsToAddressBook(mockAddressBook(), [
      mockContactToDelete,
      mockPersonContactThing(),
    ]);
    fetch = jest.fn();

    mockDeleteFile = jest
      .spyOn(solidClientFns, "deleteFile")
      .mockResolvedValue();
    updatedPeopleIndexDataset = chain(
      solidClientFns.mockSolidDatasetFrom(addressBook.people.iri),
      (d) => solidClientFns.setThing(d, mockPersonContactThing())
    );
    mockSaveResource = jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValue(updatedPeopleIndexDataset);
  });

  it("deletes the contact file and its containing folder", async () => {
    await deleteContact(addressBook, contactToDelete, foaf.Person, fetch);

    expect(mockDeleteFile).toHaveBeenCalledTimes(2);
    expect(mockDeleteFile).toHaveBeenNthCalledWith(1, contactUrl, { fetch });
    expect(mockDeleteFile).toHaveBeenNthCalledWith(2, contactContainerUrl, {
      fetch,
    });
  });

  it("updates the people index", async () => {
    await deleteContact(addressBook, contactToDelete, foaf.Person, fetch);

    expect(mockSaveResource).toHaveBeenCalledWith(
      { dataset: expect.any(Object), iri: addressBook.people.iri },
      fetch
    );
    const savedDataset = mockSaveResource.mock.calls[0][0].dataset;
    expect(getThingAll(savedDataset)).toHaveLength(1);
  });

  it("throws an error if saving resource fails", async () => {
    const error = "error";
    mockSaveResource.mockResolvedValue({ error });

    await expect(
      deleteContact(addressBook, contactToDelete, foaf.Person, fetch)
    ).rejects.toEqual(error);
  });
});
