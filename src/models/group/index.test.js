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
  getThing,
  getThingAll,
  getUrl,
  getUrlAll,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import { v4 as uuid } from "uuid";
import { rdf, vcard } from "rdf-namespaces/dist/index";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import {
  addMember,
  createGroup,
  createGroupDatasetUrl,
  getGroup,
  getGroups,
  getMembers,
  removeMember,
  updateGroup,
} from "./index";
import { vcardExtras } from "../../addressBook";
import mockGroup, {
  addGroupsToAddressBook,
} from "../../../__testUtils/mockGroup";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
} from "../../../__testUtils/mockPersonResource";

jest.mock("uuid");
const mockedUuid = uuid;

const addressBookContainerIri = "https://example.com/contacts/";
const addressBook = mockAddressBook({ containerIri: addressBookContainerIri });
const fetch = jest.fn();

const agent1 = aliceWebIdUrl;
const agent2 = bobWebIdUrl;

const mockedGroup1 = mockGroup(addressBook, "Group 1", { id: "1234" });
const group1DatasetUri = "https://example.com/contacts/Group/1234/index.ttl";
const group1Uri = `${group1DatasetUri}#this`;
const group1Dataset = mockSolidDatasetFrom(group1DatasetUri);
const mockedGroup2 = mockGroup(addressBook, "Group 2", {
  id: "5678",
  members: [agent1],
});
const group2DatasetUri = "https://example.com/contacts/Group/5678/index.ttl";
const group2Uri = `${group2DatasetUri}#this`;
const addressBookWithGroups = addGroupsToAddressBook(addressBook, [
  mockedGroup1,
  mockedGroup2,
]);

beforeEach(() => {
  mockedUuid.mockReturnValueOnce("1234").mockReturnValueOnce("5678");
  jest
    .spyOn(solidClientFns, "saveSolidDatasetAt")
    .mockImplementation((iri) => mockSolidDatasetFrom(iri));
});

describe("createGroupDatasetUrl", () => {
  it("creates a unique group URL", () => {
    expect(createGroupDatasetUrl(addressBook)).toEqual(group1DatasetUri);
    expect(createGroupDatasetUrl(addressBook)).toEqual(group2DatasetUri);
  });

  it("allows specifying ID", () => {
    expect(createGroupDatasetUrl(addressBook, "unique")).toEqual(
      "https://example.com/contacts/Group/unique/index.ttl"
    );
  });
});

describe("createGroup", () => {
  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(addressBook.groups.dataset);
  });

  it("creates a group and adds it to the index", async () => {
    const group = await createGroup("test", addressBook, fetch);
    expect(group).toEqual({
      dataset: group1Dataset,
      iri: group1Uri,
    });

    // first save request is the group itself
    expect(
      solidClientFns.saveSolidDatasetAt
    ).toHaveBeenCalledWith(group1DatasetUri, expect.any(Object), { fetch });
    const groupDatasetThings = getThingAll(
      solidClientFns.saveSolidDatasetAt.mock.calls[0][1]
    ); // TODO: Remove when we have support for getThingLocal
    const groupThing = groupDatasetThings[0];
    expect(getUrl(groupThing, rdf.type)).toEqual(vcard.Group);
    expect(getStringNoLocale(groupThing, vcard.fn)).toEqual("test");
    const groupIncludesTriple = groupDatasetThings[1];
    expect(asUrl(groupIncludesTriple)).toEqual(addressBook.index.iri);
    expect(getUrl(groupIncludesTriple, vcardExtras("includesGroup"))).toEqual(
      group1Uri
    );

    // second save request is the group index
    expect(solidClientFns.saveSolidDatasetAt).toHaveBeenCalledWith(
      addressBook.groups.iri,
      expect.any(Object),
      { fetch }
    );
    const indexDatasetThings = getThingAll(
      solidClientFns.saveSolidDatasetAt.mock.calls[1][1]
    ); // TODO: Remove when we have support for getThingLocal
    const indexThing = indexDatasetThings[0];
    expect(getUrl(indexThing, rdf.type)).toEqual(vcard.Group);
    expect(getStringNoLocale(indexThing, vcard.fn)).toEqual("test");
    const indexIncludesTriple = indexDatasetThings[1];
    expect(asUrl(indexIncludesTriple)).toEqual(addressBook.index.iri);
    expect(getUrl(indexIncludesTriple, vcardExtras("includesGroup"))).toEqual(
      group1Uri
    );
  });
});

describe("getGroups", () => {
  it("should list the groups in groups index", () => {
    expect(getGroups(addressBook)).toHaveLength(0);

    const groups = getGroups(addressBookWithGroups);
    expect(groups).toHaveLength(2);
    const [group1, group2] = groups;

    expect(group1).toEqual({
      iri: group1Uri,
      dataset: null,
    });

    expect(group2).toEqual({
      iri: group2Uri,
      dataset: null,
    });
  });
});

describe("getGroup", () => {
  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(mockedGroup1.dataset);
  });

  it("loads a specific group", async () => {
    await expect(getGroup(group1Uri, fetch)).resolves.toEqual(mockedGroup1);
  });
});

describe("updateGroup", () => {
  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(addressBookWithGroups.groups.dataset);
  });

  it("updates the group itself and the index", async () => {
    const newName = "New name";
    await expect(
      updateGroup(mockedGroup1, newName, addressBookWithGroups, fetch)
    ).resolves.toEqual({
      dataset: mockSolidDatasetFrom(mockedGroup1.iri),
      iri: mockedGroup1.iri,
    });

    // first save request is the group itself
    expect(
      solidClientFns.saveSolidDatasetAt
    ).toHaveBeenCalledWith(group1DatasetUri, expect.any(Object), { fetch });
    const groupDatasetThings = getThingAll(
      solidClientFns.saveSolidDatasetAt.mock.calls[0][1]
    ); // TODO: Remove when we have support for getThingLocal
    const groupThing = groupDatasetThings[1];
    expect(getStringNoLocale(groupThing, vcard.fn)).toEqual(newName);

    // second save request is the group index
    expect(solidClientFns.saveSolidDatasetAt).toHaveBeenCalledWith(
      addressBook.groups.iri,
      expect.any(Object),
      { fetch }
    );
    const indexDatasetThings = getThingAll(
      solidClientFns.saveSolidDatasetAt.mock.calls[1][1]
    ); // TODO: Remove when we have support for getThingLocal
    const indexThing = indexDatasetThings[2];
    expect(getStringNoLocale(indexThing, vcard.fn)).toEqual(newName);
  });
});

describe("addMember", () => {
  it("adds a member to an existing group", async () => {
    const group = addMember(mockedGroup2, agent2, fetch);
    await expect(group).resolves.toEqual({
      dataset: mockSolidDatasetFrom(group2DatasetUri),
      iri: mockedGroup2.iri,
    });

    expect(
      solidClientFns.saveSolidDatasetAt
    ).toHaveBeenCalledWith(group2DatasetUri, expect.any(Object), { fetch });
    const groupThing = getThing(
      solidClientFns.saveSolidDatasetAt.mock.calls[0][1],
      mockedGroup2.iri
    );
    expect(getUrlAll(groupThing, vcard.hasMember)).toHaveLength(2);
  });
});

describe("removeMember", () => {
  it("removes a member from an existing group", async () => {
    const group = removeMember(mockedGroup2, agent1, fetch);
    await expect(group).resolves.toEqual({
      dataset: mockSolidDatasetFrom(group2DatasetUri),
      iri: mockedGroup2.iri,
    });

    expect(
      solidClientFns.saveSolidDatasetAt
    ).toHaveBeenCalledWith(group2DatasetUri, expect.any(Object), { fetch });
    const groupThing = getThing(
      solidClientFns.saveSolidDatasetAt.mock.calls[0][1],
      mockedGroup2.iri
    );
    expect(getUrlAll(groupThing, vcard.hasMember)).toHaveLength(0);
  });
});

describe("getMembers", () => {
  it("lists members from a group", () => {
    expect(getMembers(mockedGroup1)).toHaveLength(0);
    const group2Members = getMembers(mockedGroup2);
    expect(group2Members).toHaveLength(1);
    expect(group2Members).toEqual([{ dataset: null, iri: agent1 }]);
  });
});
