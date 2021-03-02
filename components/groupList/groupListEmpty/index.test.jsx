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
import useAddressBook from "../../../src/hooks/useAddressBook";
import useContacts from "../../../src/hooks/useContacts";
import useGroup from "../../../src/hooks/useGroup";
import renderGroupsPage from "../../../__testUtils/renderGroupsPage";
import GroupListEmpty, { TESTCAFE_ID_GROUP_LIST_EMPTY } from "./index";

jest.mock("../../../src/hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("../../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

jest.mock("../../../src/hooks/useGroup");
const mockedGroupHook = useGroup;

jest.mock("next/router");
const mockedRouterHook = useRouter;

describe("GroupListEmpty", () => {
  beforeEach(() => {
    mockedAddressBookHook.mockReturnValue({});
    mockedContactsHook.mockReturnValue({});
    mockedGroupHook.mockReturnValue({});
    mockedRouterHook.mockReturnValue({ query: {} });
  });

  it("renders", () => {
    const { asFragment, getByTestId } = renderGroupsPage(<GroupListEmpty />);
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_GROUP_LIST_EMPTY)).toBeDefined();
  });
});
