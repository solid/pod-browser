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
import { useSession } from "@inrupt/solid-ui-react";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";
import useAddressBook from "../../../src/hooks/useAddressBook";
import useContacts from "../../../src/hooks/useContacts";
import useGroup from "../../../src/hooks/useGroup";
import mockGroup from "../../../__testUtils/mockGroup";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import renderGroupsPage from "../../../__testUtils/renderGroupsPage";
import GroupDetailsName, {
  MESSAGE_GROUP_DETAILS_NAME_REQUIRED,
  TESTCAFE_ID_GROUP_DETAILS_NAME,
  TESTCAFE_ID_GROUP_DETAILS_NAME_BUTTON,
  TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD,
} from "./index";
import { TESTCAFE_ID_SPINNER } from "../../spinner";
import { TESTCAFE_ID_ERROR_MESSAGE } from "../../errorMessage";
import * as contactGroupFns from "../../../src/models/contact/group";
import mockGroupIndex from "../../../__testUtils/mockGroupIndex";
import { getContactAllFromContactsIndex } from "../../../src/models/contact";

jest.mock("../../../src/hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("../../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

jest.mock("../../../src/hooks/useGroup");
const mockedGroupHook = useGroup;

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

jest.mock("next/router");
const mockedRouterHook = useRouter;

const addressBook = mockAddressBook();
const fetch = jest.fn();

const group1Name = "Group 1";
const group1Url = "http://example.com/group1.ttl#this";
const group1 = mockGroup(group1Name, group1Url);
const updatedGroup = mockGroup("New name", group1Url);
const updatedGroupIndex = mockGroupIndex(addressBook, [updatedGroup]);

describe("GroupDetailsName", () => {
  let mutateAddressBook;
  let mutateGroups;
  let mutateGroup;

  beforeEach(() => {
    mutateAddressBook = jest.fn();
    mutateGroups = jest.fn();
    mutateGroup = jest.fn();

    mockedAddressBookHook.mockReturnValue({
      data: addressBook,
      error: null,
      mutate: mutateAddressBook,
    });
    mockedContactsHook.mockReturnValue({
      data: [group1],
      error: null,
      mutate: mutateGroups,
    });
    mockedGroupHook.mockReturnValue({
      data: group1,
      error: null,
      mutate: mutateGroup,
    });
    mockedSessionHook.mockReturnValue({ fetch });
    mockedRouterHook.mockReturnValue({ query: { iri: group1Url } });
  });

  it("renders a form", () => {
    const { asFragment, getByTestId } = renderGroupsPage(<GroupDetailsName />);
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD).value).toEqual(
      group1Name
    );
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD)).not.toBe(
      document.activeElement
    );
  });

  it("sets focus on input field when newly created", () => {
    mockedRouterHook.mockReturnValue({
      query: { iri: group1Url, created: "" },
    });
    const { getByTestId } = renderGroupsPage(<GroupDetailsName />);
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD)).toBe(
      document.activeElement
    );
  });

  it("renders a spinner while loading group", () => {
    mockedGroupHook.mockReturnValue({});
    const { getByTestId } = renderGroupsPage(<GroupDetailsName />);
    expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
  });

  it("renders an error if something goes wrong", () => {
    const errorMessage = "error";
    mockedContactsHook.mockReturnValue({ error: new Error(errorMessage) });
    const { getByTestId } = renderGroupsPage(<GroupDetailsName />);
    expect(getByTestId(TESTCAFE_ID_ERROR_MESSAGE)).toBeDefined();
  });

  describe("submitting the form", () => {
    let mockedRenameGroup;

    beforeEach(() => {
      mockedRenameGroup = jest
        .spyOn(contactGroupFns, "renameGroup")
        .mockResolvedValue({
          group: updatedGroup,
          groupIndex: mockGroupIndex(addressBook, [updatedGroup]),
        });
    });

    it("updates the name of the group", async () => {
      const { getByTestId } = renderGroupsPage(<GroupDetailsName />);
      userEvent.type(
        getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD),
        "{selectall}{del}New name{enter}"
      );

      await waitFor(() => {
        expect(
          getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_BUTTON)
        ).toBeDefined();
      });
      expect(mockedRenameGroup).toHaveBeenCalledWith(
        addressBook,
        group1,
        "New name",
        fetch
      );
      expect(mutateGroup).toHaveBeenCalledWith(updatedGroup);
      expect(mutateGroups).toHaveBeenCalledWith(
        getContactAllFromContactsIndex(updatedGroupIndex)
      );
    });

    it("renders a spinner while processing", async () => {
      const { getByTestId } = renderGroupsPage(<GroupDetailsName />);
      userEvent.type(
        getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD),
        "{selectall}{del}New name{enter}"
      );

      expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();

      await waitFor(() => {
        expect(
          getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_BUTTON)
        ).toBeDefined();
      });
    });

    it("won't allow empty names", () => {
      const { getByTestId, getByText } = renderGroupsPage(<GroupDetailsName />);
      userEvent.type(
        getByTestId(TESTCAFE_ID_GROUP_DETAILS_NAME_FIELD),
        "{selectall}{del}{enter}"
      );
      expect(getByText(MESSAGE_GROUP_DETAILS_NAME_REQUIRED)).toBeDefined();
      expect(mockedRenameGroup).not.toHaveBeenCalled();
    });
  });
});
