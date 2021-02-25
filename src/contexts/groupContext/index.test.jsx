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

import { useRouter } from "next/router";
import React, { useContext } from "react";
import { render } from "@testing-library/react";
import useGroup from "../../hooks/useGroup";
import useContacts from "../../hooks/useContacts";
import mockGroup from "../../../__testUtils/mockGroup";
import GroupAllContext, { GroupAllProvider } from "../groupAllContext";
import { GROUP_CONTACT } from "../../models/contact/group";
import GroupContext, { GroupProvider } from "./index";
import { getGroupName } from "../../models/group";

jest.mock("../../hooks/useGroup");
const mockedGroupHook = useGroup;

jest.mock("next/router");
const mockedRouterHook = useRouter;

jest.mock("../../hooks/useContacts");
const mockedContactsHook = useContacts;

const group1Name = "Group 1";
const group1Url = "http://example.com/group1.ttl#this";
const group1 = mockGroup(group1Name, group1Url);
const group2 = mockGroup("Group 2", "http://example.com/group2.ttl#this");

const TESTID = "test";
const NOGROUP = "No group";

function ChildComponent() {
  const group = useContext(GroupContext);
  return (
    <div data-testid={TESTID}>{group ? getGroupName(group) : NOGROUP}</div>
  );
}

describe("GroupContext", () => {
  it("get group from URL", () => {
    mockedContactsHook.mockReturnValue({ data: [group1, group2] });

    const groupUrl = "groupUrl";
    mockedRouterHook.mockReturnValue({ query: { iri: groupUrl } });

    mockedGroupHook.mockReturnValue(group1);

    const { getByTestId } = render(
      <GroupAllProvider>
        <GroupProvider>
          <ChildComponent />
        </GroupProvider>
      </GroupAllProvider>
    );
    expect(getByTestId(TESTID).innerHTML).toEqual(group1Name);
    expect(mockedContactsHook).toHaveBeenCalledWith([GROUP_CONTACT]);
    expect(mockedGroupHook).toHaveBeenCalledWith(groupUrl);
  });

  it("gets first group if no URL is given", () => {
    mockedContactsHook.mockReturnValue({ data: [group2, group1] });

    mockedRouterHook.mockReturnValue({ query: { iri: null } });

    mockedGroupHook.mockReturnValue(group1);

    const { getByTestId } = render(
      <GroupAllProvider>
        <GroupProvider>
          <ChildComponent />
        </GroupProvider>
      </GroupAllProvider>
    );
    expect(getByTestId(TESTID).innerHTML).toEqual(group1Name);
    expect(mockedGroupHook).toHaveBeenCalledWith(group1Url);
  });

  it("gets nothing if no group is available", () => {
    mockedContactsHook.mockReturnValue({ data: [] });
    mockedRouterHook.mockReturnValue({ query: { iri: null } });
    mockedGroupHook.mockReturnValue(null);

    const { getByTestId } = render(
      <GroupAllProvider>
        <GroupProvider>
          <ChildComponent />
        </GroupProvider>
      </GroupAllProvider>
    );
    expect(getByTestId(TESTID).innerHTML).toEqual(NOGROUP);
    expect(mockedGroupHook).toHaveBeenCalledWith(null);
  });
});
