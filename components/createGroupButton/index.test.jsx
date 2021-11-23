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
import { useSession } from "@inrupt/solid-ui-react";
import { useRouter } from "next/router";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";
import useAddressBook from "../../src/hooks/useAddressBook";
import useContacts from "../../src/hooks/useContacts";
import useGroup from "../../src/hooks/useGroup";
import mockAddressBook from "../../__testUtils/mockAddressBook";
import renderGroupsPage from "../../__testUtils/renderGroupsPage";
import CreateGroupButton, { TESTCAFE_ID_CREATE_GROUP_BUTTON } from "./index";
import * as contactGroupModelFns from "../../src/models/contact/group";
import mockGroup from "../../__testUtils/mockGroup";
import { TESTCAFE_ID_SPINNER } from "../spinner";
import mockGroupIndex from "../../__testUtils/mockGroupIndex";
import { getContactAllFromContactsIndex } from "../../src/models/contact";

jest.mock("../../src/hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

jest.mock("../../src/hooks/useGroup");
const mockedGroupHook = useGroup;

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
const mockedSessionHook = useSession;

jest.mock("next/router");
const mockedRouterHook = useRouter;

const addressBook = mockAddressBook();
const fetch = jest.fn();
const buttonText = "test";

describe("CreateGroupButton", () => {
  let mutateAddressBook;
  let mutateGroups;
  let mutateGroup;
  let pushRouter;

  beforeEach(() => {
    mutateAddressBook = jest.fn();
    mutateGroups = jest.fn();
    mutateGroup = jest.fn();
    pushRouter = jest.fn();

    mockedAddressBookHook.mockReturnValue({
      data: addressBook,
      error: null,
      mutate: mutateAddressBook,
    });
    mockedContactsHook.mockReturnValue({
      data: [],
      error: null,
      mutate: mutateGroups,
    });
    mockedGroupHook.mockReturnValue({ mutate: mutateGroup });
    mockedSessionHook.mockReturnValue({ fetch });
    mockedRouterHook.mockReturnValue({ push: pushRouter, query: {} });
  });

  it("renders a button", () => {
    const { asFragment, getByTestId } = renderGroupsPage(
      <CreateGroupButton>{buttonText}</CreateGroupButton>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_CREATE_GROUP_BUTTON).innerHTML).toContain(
      buttonText
    );
  });

  describe("loading", () => {
    it("renders nothing if AddressBook is not loaded", () => {
      mockedAddressBookHook.mockReturnValue({ data: null, error: null });
      const { queryByTestId } = renderGroupsPage(
        <CreateGroupButton>{buttonText}</CreateGroupButton>
      );
      expect(queryByTestId(TESTCAFE_ID_CREATE_GROUP_BUTTON)).toBeNull();
    });

    it("renders nothing if groups are not loaded", () => {
      mockedContactsHook.mockReturnValue({ data: null, error: null });
      const { queryByTestId } = renderGroupsPage(
        <CreateGroupButton>{buttonText}</CreateGroupButton>
      );
      expect(queryByTestId(TESTCAFE_ID_CREATE_GROUP_BUTTON)).toBeNull();
    });
  });

  describe("clicking the button", () => {
    const updatedAddressBook = mockAddressBook();
    const group1Name = "Group 1";
    const group1Url = "http://example.com/group1.ttl#this";
    const updatedGroup = mockGroup(group1Name, group1Url);
    const updatedGroupIndex = mockGroupIndex(updatedAddressBook, [
      updatedGroup,
    ]);
    const redirectedUrl = `/groups/${encodeURIComponent(group1Url)}?created`;

    let mockedSaveGroup;

    beforeEach(() => {
      mockedSaveGroup = jest
        .spyOn(contactGroupModelFns, "saveGroup")
        .mockResolvedValue({
          addressBook: updatedAddressBook,
          group: updatedGroup,
          groupIndex: updatedGroupIndex,
        });
    });

    it("creates a group and redirects to it", async () => {
      const { getByTestId } = renderGroupsPage(
        <CreateGroupButton>{buttonText}</CreateGroupButton>
      );
      userEvent.click(getByTestId(TESTCAFE_ID_CREATE_GROUP_BUTTON));

      await waitFor(() =>
        expect(pushRouter).toHaveBeenCalledWith(redirectedUrl)
      );
      expect(mockedSaveGroup).toHaveBeenCalledWith(
        addressBook,
        "Group 1",
        fetch
      );
      expect(mutateAddressBook).toHaveBeenCalledWith(updatedAddressBook);
      expect(mutateGroups).toHaveBeenCalledWith(
        getContactAllFromContactsIndex(updatedGroupIndex)
      );
      expect(mutateGroup).toHaveBeenCalledWith(updatedGroup);
    });

    it("renders a loading indicator while processing", async () => {
      const { getByTestId, queryByTestId } = renderGroupsPage(
        <CreateGroupButton>{buttonText}</CreateGroupButton>
      );
      userEvent.click(getByTestId(TESTCAFE_ID_CREATE_GROUP_BUTTON));

      expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
      expect(queryByTestId(TESTCAFE_ID_CREATE_GROUP_BUTTON)).toBeNull();

      await waitFor(() =>
        expect(pushRouter).toHaveBeenCalledWith(redirectedUrl)
      );
    });
  });
});
