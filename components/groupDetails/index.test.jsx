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

import React from "react";
import { useRouter } from "next/router";
import useAddressBook from "../../src/hooks/useAddressBook";
import useContacts from "../../src/hooks/useContacts";
import useGroup from "../../src/hooks/useGroup";
import mockGroup from "../../__testUtils/mockGroup";
import renderGroupsPage from "../../__testUtils/renderGroupsPage";
import GroupDetails, { TESTCAFE_ID_GROUP_DETAILS } from "./index";

jest.mock("../../src/hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

jest.mock("../../src/hooks/useGroup");
const mockedGroupHook = useGroup;

jest.mock("next/router");
const mockedRouterHook = useRouter;

const group1Name = "Group 1";
const group1Url = "http://example.com/group1.ttl#this";
const group1 = mockGroup(group1Name, group1Url);

describe("GroupDetails", () => {
  beforeEach(() => {
    mockedAddressBookHook.mockReturnValue({});
    mockedContactsHook.mockReturnValue({ data: [group1] });
    mockedGroupHook.mockReturnValue({});
    mockedRouterHook.mockReturnValue({ query: { iri: group1Url } });
  });

  it("renders", () => {
    const { asFragment, getByTestId } = renderGroupsPage(<GroupDetails />);
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS)).toBeDefined();
  });
});
