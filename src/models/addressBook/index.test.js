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

import { acl, dc, foaf, rdf, schema } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import {
  getThingAll,
  getStringNoLocale,
  getUrl,
  mockSolidDatasetFrom,
  setThing,
  mockThingFrom,
  setUrl,
} from "@inrupt/solid-client";
import * as resourceFns from "../../solidClientHelpers/resource";
import {
  createAddressBook,
  getAddressBookGroupIndexUrl,
  getAddressBookIndex,
  getAddressBookMainIndexUrl,
  getAddressBookPersonIndexUrl,
  saveNewAddressBook,
  loadAddressBook,
} from "./index";
import { vcardExtras } from "../../addressBook";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import { chain } from "../../solidClientHelpers/utils";

describe("createAddressBook", () => {
  it("creates all the datasets that an addressBook needs, with a default title", () => {
    const iri = "https://example.pod.com/contacts";
    const owner = "https://example.pod.com/card#me";

    const { containerIri, people, groups, index } = createAddressBook(
      iri,
      owner
    );

    expect(containerIri).toEqual(iri);

    expect(getThingAll(groups.dataset)).toHaveLength(0);

    expect(getThingAll(people.dataset)).toHaveLength(0);

    expect(index.iri).toEqual(`${iri}/index.ttl#this`);
    const mainIndexThing = getThingAll(index.dataset)[0];
    expect(getStringNoLocale(mainIndexThing, dc.title)).toEqual("Contacts");
    expect(getUrl(mainIndexThing, rdf.type)).toEqual(
      vcardExtras("AddressBook")
    );
    expect(getUrl(mainIndexThing, acl.owner)).toEqual(owner);
    expect(getUrl(mainIndexThing, vcardExtras("nameEmailIndex"))).toEqual(
      "https://example.pod.com/contacts/people.ttl"
    );
    expect(getUrl(mainIndexThing, vcardExtras("groupIndex"))).toEqual(
      "https://example.pod.com/contacts/groups.ttl"
    );
  });

  it("creates all the datasets that an addressBook needs, with a given title", () => {
    const iri = "https://example.pod.com/contacts";
    const owner = "https://example.pod.com/card#me";
    const title = "My Address Book";

    const { containerIri, people, groups, index } = createAddressBook(
      iri,
      owner,
      title
    );

    expect(containerIri).toBe(iri);

    expect(getThingAll(groups.dataset)).toHaveLength(0);

    expect(getThingAll(people.dataset)).toHaveLength(0);

    expect(index.iri).toEqual(`${iri}/index.ttl#this`);
    const mainIndexThing = getThingAll(index.dataset)[0];
    expect(getStringNoLocale(mainIndexThing, dc.title)).toEqual(title);
    expect(getUrl(mainIndexThing, rdf.type)).toEqual(
      vcardExtras("AddressBook")
    );
    expect(getUrl(mainIndexThing, acl.owner)).toEqual(owner);
    expect(getUrl(mainIndexThing, vcardExtras("nameEmailIndex"))).toEqual(
      "https://example.pod.com/contacts/people.ttl"
    );
    expect(getUrl(mainIndexThing, vcardExtras("groupIndex"))).toEqual(
      "https://example.pod.com/contacts/groups.ttl"
    );
  });
});

describe("getAddressBookIndex", () => {
  const containerIri = "http://example.com/contacts";

  it("returns a specific index based on type", () => {
    const addressBook = mockAddressBook({ containerIri });
    expect(getAddressBookIndex(addressBook)).toBe(addressBook.index);
    expect(getAddressBookIndex(addressBook, foaf.Person)).toBe(
      addressBook.people
    );
    expect(getAddressBookIndex(addressBook, schema.Person)).toBe(
      addressBook.people
    );
  });
});

describe("loadAddressBook", () => {
  const containerIri = "http://example.com/contacts";
  const mainIndexUrl = getAddressBookMainIndexUrl({ containerIri });
  const mainIndexThingUrl = `${mainIndexUrl}#this`;
  const groupsIndexUrl = getAddressBookGroupIndexUrl({ containerIri });
  const peopleIndexUrl = getAddressBookPersonIndexUrl({ containerIri });
  const emptyDataset = mockSolidDatasetFrom("http://example.com");
  const fetch = "fetch";
  const existingDataset = chain(mockSolidDatasetFrom(mainIndexUrl), (d) =>
    setThing(
      d,
      chain(
        mockThingFrom(mainIndexThingUrl),
        (t) => setUrl(t, vcardExtras("groupIndex"), groupsIndexUrl),
        (t) => setUrl(t, vcardExtras("nameEmailIndex"), peopleIndexUrl)
      )
    )
  );

  it("loads missing datasets for an address book", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(existingDataset)
      .mockResolvedValueOnce(emptyDataset)
      .mockResolvedValueOnce(emptyDataset);
    await expect(loadAddressBook(containerIri, fetch)).resolves.toEqual({
      containerIri,
      index: {
        dataset: existingDataset,
        iri: mainIndexThingUrl,
      },
      groups: {
        dataset: emptyDataset,
        iri: groupsIndexUrl,
      },
      people: {
        dataset: emptyDataset,
        iri: peopleIndexUrl,
      },
    });
  });

  it("returns error if it main index is missing", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(emptyDataset);
    await expect(loadAddressBook(containerIri, fetch)).rejects.toEqual(
      new Error("Unable to load main index")
    );
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

  it("saves a new address at the given iri, for the given owner, with a default title", async () => {
    const addressBook = createAddressBook(iri, owner);

    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: addressBook.index })
      .mockResolvedValueOnce({ response: addressBook.groups })
      .mockResolvedValueOnce({ response: addressBook.people });

    const { containerIri, index, groups, people } = await saveNewAddressBook({
      containerIri: iri,
      owner,
    });

    expect(containerIri).toBe(iri);
    expect(index).toEqual(addressBook.index);
    expect(groups).toEqual(addressBook.groups);
    expect(people).toEqual(addressBook.people);

    const [
      saveIndexArgs,
      saveGroupsArgs,
      savePeopleArgs,
    ] = resourceFns.saveResource.mock.calls;

    expect(saveIndexArgs[0].iri).toEqual(addressBook.index.iri);
    expect(saveIndexArgs[0].iri).toEqual(addressBook.index.iri);
    expect(saveGroupsArgs[0].iri).toEqual(addressBook.groups.iri);
    expect(savePeopleArgs[0].iri).toEqual(addressBook.people.iri);
  });

  it("returns an error if the user is unauthorized", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ error: error401 })
      .mockResolvedValueOnce({ error: error401 })
      .mockResolvedValueOnce({ error: error401 });

    await expect(
      saveNewAddressBook({ containerIri: iri, owner })
    ).rejects.toEqual(
      new Error("You do not have permission to create an address book")
    );
  });

  it("returns an error if the address book already exists", async () => {
    resourceFns.getResource.mockResolvedValue({
      response: "existing address book",
    });

    await expect(
      saveNewAddressBook({ containerIri: iri, owner }, jest.fn())
    ).rejects.toEqual(new Error("Address book already exists."));
  });

  it("passes the error on if it isn't a 401 error", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ error: error500 })
      .mockResolvedValueOnce({ error: error401 })
      .mockResolvedValueOnce({ error: error401 });

    await expect(
      saveNewAddressBook({ containerIri: iri, owner })
    ).rejects.toEqual(error500);
  });

  it("returns an error if it fails to save group index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: "index" })
      .mockResolvedValueOnce({ error: error500 })
      .mockResolvedValueOnce({ response: "people" });

    await expect(
      saveNewAddressBook({ containerIri: iri, owner })
    ).rejects.toEqual(error500);
  });

  it("returns an error if it fails to save people index", async () => {
    jest
      .spyOn(resourceFns, "saveResource")
      .mockResolvedValueOnce({ response: "index" })
      .mockResolvedValueOnce({ response: "group" })
      .mockResolvedValueOnce({ error: error500 });

    await expect(
      saveNewAddressBook({ containerIri: iri, owner })
    ).rejects.toEqual(error500);
  });
});
