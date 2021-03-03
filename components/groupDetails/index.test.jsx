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
import GroupDetails, {
  MESSAGE_GROUP_DETAILS_DESCRIPTION_FALLBACK,
  TESTCAFE_ID_GROUP_DETAILS,
  TESTCAFE_ID_GROUP_DETAILS_BACK_LINK,
  TESTCAFE_ID_GROUP_DETAILS_DESCRIPTION,
  TESTCAFE_ID_GROUP_DETAILS_NAME,
} from "./index";
import { TESTCAFE_ID_SPINNER } from "../spinner";

jest.mock("../../src/hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

jest.mock("../../src/hooks/useGroup");
const mockedGroupHook = useGroup;

jest.mock("next/router");
const mockedRouterHook = useRouter;

const group1Name = "Group 1";
const group1Description = "Group 1 description";
const group1Url = "http://example.com/group1.ttl#this";
const group1 = mockGroup(group1Name, group1Url, {
  description: group1Description,
});

const group2Name = "Group 2";
const group2Url = "http://example.com/group2.ttl#this";
const group2 = mockGroup(group2Name, group2Url);

describe("GroupDetails", () => {
  beforeEach(() => {
    mockedAddressBookHook.mockReturnValue({});
    mockedContactsHook.mockReturnValue({ data: [group1] });
    mockedGroupHook.mockReturnValue({ data: group1 });
    mockedRouterHook.mockReturnValue({ query: { iri: group1Url } });
  });

  it("renders", () => {
    const { asFragment, getByTestId } = renderGroupsPage(<GroupDetails />);
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_BACK_LINK)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME).innerHTML).toContain(
      group1Name
    );
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DETAILS_DESCRIPTION).innerHTML
    ).toContain(group1Description);
  });

  it("renders a spinner while loading", () => {
    mockedGroupHook.mockReturnValue({ isValidating: true });
    const { getByTestId } = renderGroupsPage(<GroupDetails />);
    expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
  });

  it("offers a fallback for groups without description", () => {
    mockedContactsHook.mockReturnValue({ data: [group2] });
    mockedGroupHook.mockReturnValue({ data: group2 });
    mockedRouterHook.mockReturnValue({ query: { iri: group2Url } });
    const { getByTestId } = renderGroupsPage(<GroupDetails />);
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DETAILS_DESCRIPTION).innerHTML
    ).toContain(MESSAGE_GROUP_DETAILS_DESCRIPTION_FALLBACK);
  });
});
