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

import { getThing, getUrlAll } from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces/dist/index";
import * as solidClientFns from "@inrupt/solid-client";
import {
  addGroupMember,
  getGroup,
  getGroupDescription,
  getGroupMemberUrlAll,
  getGroupName,
  getGroupUrl,
  removeGroupMember,
} from "./index";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
} from "../../../__testUtils/mockPersonResource";
import mockGroup, {
  addMembersToMockedGroup,
  removeMembersFromMockedGroup,
} from "../../../__testUtils/mockGroup";

const fetch = jest.fn();

const agent1 = aliceWebIdUrl;
const agent2 = bobWebIdUrl;

const group1Name = "Group 1";
const group1DatasetUrl = "https://example.com/contacts/Group/1234/index.ttl";
const group1Description = "Some description";
const group1Url = `${group1DatasetUrl}#this`;
const mockedGroup1 = mockGroup(group1Name, group1Url, {
  description: group1Description,
});

const group2Name = "Group 2";
const group2DatasetUrl = "https://example.com/contacts/Group/5678/index.ttl";
const group2Url = `${group2DatasetUrl}#this`;
const mockedGroup2 = mockGroup(group2Name, group2Url, { members: [agent1] });

let mockedSaveSolidDatasetAt;

beforeEach(() => {
  mockedSaveSolidDatasetAt = jest.spyOn(solidClientFns, "saveSolidDatasetAt");
});

describe("getGroup", () => {
  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(mockedGroup1.dataset);
  });

  it("loads a specific group", async () => {
    await expect(getGroup(group1Url, fetch)).resolves.toEqual(mockedGroup1);
  });
});

describe("getGroupUrl", () => {
  it("returns URL for group", () => {
    expect(getGroupUrl(mockedGroup1)).toEqual(group1Url);
  });
});

describe("getGroupName", () => {
  it("returns name for group", () => {
    expect(getGroupName(mockedGroup1)).toEqual(group1Name);
  });
});

describe("getGroupDescription", () => {
  it("returns description for group", () => {
    expect(getGroupDescription(mockedGroup1)).toEqual(group1Description);
  });

  it("returns empty string if no description is available", () => {
    expect(getGroupDescription(mockedGroup2)).toEqual("");
  });
});

describe("addGroupMember", () => {
  it("adds a member to an existing group", async () => {
    const updatedMockGroup2 = addMembersToMockedGroup(mockedGroup2, [agent2]);
    mockedSaveSolidDatasetAt.mockResolvedValue(updatedMockGroup2.dataset);

    const updatedGroup = await addGroupMember(mockedGroup2, agent2, fetch);
    expect(updatedGroup).toEqual(updatedMockGroup2);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group2DatasetUrl,
      expect.any(Object),
      { fetch }
    );
    const groupThing = getThing(
      mockedSaveSolidDatasetAt.mock.calls[0][1],
      group2Url
    );
    expect(getUrlAll(groupThing, vcard.hasMember)).toHaveLength(2);
  });
});

describe("removeGroupMember", () => {
  it("removes a member from an existing group", async () => {
    const updatedMockGroup2 = removeMembersFromMockedGroup(mockedGroup2, [
      agent1,
    ]);
    mockedSaveSolidDatasetAt.mockResolvedValue(updatedMockGroup2.dataset);
    const group = await removeGroupMember(mockedGroup2, agent1, fetch);
    expect(group).toEqual(updatedMockGroup2);

    expect(mockedSaveSolidDatasetAt).toHaveBeenCalledWith(
      group2DatasetUrl,
      expect.any(Object),
      { fetch }
    );
    const groupThing = getThing(
      mockedSaveSolidDatasetAt.mock.calls[0][1],
      group2Url
    );
    expect(getUrlAll(groupThing, vcard.hasMember)).toHaveLength(0);
  });
});

describe("getGroupMemberUrlAll", () => {
  it("lists members from a group", () => {
    expect(getGroupMemberUrlAll(mockedGroup1)).toHaveLength(0);
    const group2Members = getGroupMemberUrlAll(mockedGroup2);
    expect(group2Members).toHaveLength(1);
    expect(group2Members).toEqual([agent1]);
  });
});
