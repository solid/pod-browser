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
  getSourceUrl,
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
  addGroupMember,
  createGroup,
  createGroupDatasetUrl,
  getGroup,
  getGroupMembers,
  removeGroupMember,
  renameGroup,
} from "./index";
import mockGroup, {
  addGroupToIndexDataset,
} from "../../../__testUtils/mockGroup";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
} from "../../../__testUtils/mockPersonResource";
import { getAddressBookIndexUrl, vcardExtras } from "../addressBook";
import { chain } from "../../solidClientHelpers/utils";

jest.mock("uuid");
const mockedUuid = uuid;

const addressBookContainerIri = "https://example.com/contacts/";
const addressBook = mockAddressBook({ containerIri: addressBookContainerIri });
const groupsDatasetIri = getAddressBookIndexUrl(addressBook, vcard.Group);
const fetch = jest.fn();

const agent1 = aliceWebIdUrl;
const agent2 = bobWebIdUrl;

const group1Name = "Group 1";
const mockedGroup1 = mockGroup(addressBook, group1Name, { id: "1234" });
const group1DatasetUri = "https://example.com/contacts/Group/1234/index.ttl";
const group1Uri = `${group1DatasetUri}#this`;

const group2Name = "Group 2";
const mockedGroup2 = mockGroup(addressBook, group2Name, {
  id: "5678",
  members: [agent1],
});
const group2DatasetUri = "https://example.com/contacts/Group/5678/index.ttl";
const group2Uri = `${group2DatasetUri}#this`;

const groupsDataset = chain(
  mockSolidDatasetFrom(groupsDatasetIri),
  (d) => addGroupToIndexDataset(d, addressBook, group1Name, group1Uri),
  (d) => addGroupToIndexDataset(d, addressBook, group2Name, group2Uri)
);

let mockedSaveSolidDatasetAt;

beforeEach(() => {
  mockedUuid.mockReturnValueOnce("1234").mockReturnValueOnce("5678");
  mockedSaveSolidDatasetAt = jest
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
      .mockImplementation((iri) => mockSolidDatasetFrom(iri));
  });

  it("creates a group and adds it to the index", async () => {
    const group = await createGroup(addressBook, "test", fetch);
    expect(getSourceUrl(group.dataset)).toEqual(group1DatasetUri);
    expect(asUrl(group.thing, group1DatasetUri)).toEqual(group1Uri);

    // first save request is the group itself
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group1DatasetUri,
      expect.any(Object),
      { fetch }
    );
    const groupDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[0][1]
    ); // TODO: Remove when we have support for getThingLocal
    const groupThing = groupDatasetThings[0];
    expect(getUrl(groupThing, rdf.type)).toEqual(vcard.Group);
    expect(getStringNoLocale(groupThing, vcard.fn)).toEqual("test");
    const groupIncludesTriple = groupDatasetThings[1];
    expect(getUrl(groupIncludesTriple, vcardExtras("includesGroup"))).toEqual(
      group1Uri
    );

    // second save request is the group index
    expect(
      mockedSaveSolidDatasetAt
    ).toHaveBeenCalledWith(
      getAddressBookIndexUrl(addressBook, vcard.Group),
      expect.any(Object),
      { fetch }
    );
    const indexDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[1][1]
    ); // TODO: Remove when we have support for getThingLocal
    const indexThing = indexDatasetThings[0];
    expect(getUrl(indexThing, rdf.type)).toEqual(vcard.Group);
    expect(getStringNoLocale(indexThing, vcard.fn)).toEqual("test");
    const indexIncludesTriple = indexDatasetThings[1];
    expect(getUrl(indexIncludesTriple, vcardExtras("includesGroup"))).toEqual(
      group1Uri
    );
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

describe("renameGroup", () => {
  const newName = "New name";
  const mockUpdatedGroup = mockGroup(addressBook, newName, { id: "1234" });

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(groupsDataset);
    mockedSaveSolidDatasetAt.mockResolvedValue(mockUpdatedGroup.dataset);
  });

  it("updates the group itself and the index", async () => {
    const updatedGroup = await renameGroup(
      mockedGroup1,
      newName,
      addressBook,
      fetch
    );
    expect(updatedGroup).toEqual(mockUpdatedGroup);

    // first save request is the group itself
    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group1DatasetUri,
      expect.any(Object),
      { fetch }
    );
    const groupDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[0][1]
    ); // TODO: Remove when we have support for getThingLocal
    const groupThing = groupDatasetThings[1];
    expect(getStringNoLocale(groupThing, vcard.fn)).toEqual(newName);

    // second save request is the group index
    expect(
      mockedSaveSolidDatasetAt
    ).toHaveBeenCalledWith(
      getAddressBookIndexUrl(addressBook, vcard.Group),
      expect.any(Object),
      { fetch }
    );
    const indexDatasetThings = getThingAll(
      mockedSaveSolidDatasetAt.mock.calls[1][1]
    ); // TODO: Remove when we have support for getThingLocal
    const indexThing = indexDatasetThings[2];
    expect(getStringNoLocale(indexThing, vcard.fn)).toEqual(newName);
  });
});

describe("addGroupMember", () => {
  it("adds a member to an existing group", async () => {
    mockedSaveSolidDatasetAt.mockResolvedValue(mockedGroup2.dataset);
    const group = await addGroupMember(mockedGroup2, agent2, fetch);
    expect(group).toEqual(mockedGroup2);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group2DatasetUri,
      expect.any(Object),
      { fetch }
    );
    const groupThing = getThing(
      mockedSaveSolidDatasetAt.mock.calls[0][1],
      group2Uri
    );
    expect(getUrlAll(groupThing, vcard.hasMember)).toHaveLength(2);
  });
});

describe("removeGroupMember", () => {
  it("removes a member from an existing group", async () => {
    mockedSaveSolidDatasetAt.mockResolvedValue(mockedGroup2.dataset);
    const group = await removeGroupMember(mockedGroup2, agent1, fetch);
    expect(group).toEqual(mockedGroup2);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group2DatasetUri,
      expect.any(Object),
      { fetch }
    );
    const groupThing = getThing(
      mockedSaveSolidDatasetAt.mock.calls[0][1],
      group2Uri
    );
    expect(getUrlAll(groupThing, vcard.hasMember)).toHaveLength(0);
  });
});

describe("getGroupMembers", () => {
  it("lists members from a group", () => {
    expect(getGroupMembers(mockedGroup1)).toHaveLength(0);
    const group2Members = getGroupMembers(mockedGroup2);
    expect(group2Members).toHaveLength(1);
    expect(group2Members).toEqual([agent1]);
  });
});
