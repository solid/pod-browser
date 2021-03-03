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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { waitFor } from "@testing-library/react";
import useAddressBook from "../../../src/hooks/useAddressBook";
import useContacts from "../../../src/hooks/useContacts";
import useGroup from "../../../src/hooks/useGroup";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import mockGroup from "../../../__testUtils/mockGroup";
import renderGroupsPage from "../../../__testUtils/renderGroupsPage";
import GroupDeleteModal, {
  MESSAGE_GROUP_DELETE_MODAL_BODY,
  TESTCAFE_ID_GROUP_DELETE_MODAL,
  TESTCAFE_ID_GROUP_DELETE_MODAL_BODY,
  TESTCAFE_ID_GROUP_DELETE_MODAL_CANCEL_BUTTON,
  TESTCAFE_ID_GROUP_DELETE_MODAL_SAVE_BUTTON,
  TESTCAFE_ID_GROUP_DELETE_MODAL_TITLE,
} from "./index";
import * as contactGroupModelFns from "../../../src/models/contact/group";
import { chain } from "../../../src/solidClientHelpers/utils";
import { addGroupToMockedIndexDataset } from "../../../__testUtils/mockGroupContact";
import { GROUP_CONTACT } from "../../../src/models/contact/group";
import { TESTCAFE_ID_SPINNER } from "../../spinner";

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

const group2Name = "Group 2";
const group2DatasetUrl = "https://example.com/contacts/Group/5678/index.ttl";
const group2Url = `${group2DatasetUrl}#this`;
const group2 = mockGroup(group2Name, group2Url);

const groupsDatasetUrl = "https://example.com/groups.ttl";
const groupIndexWithGroup2Dataset = chain(
  mockSolidDatasetFrom(groupsDatasetUrl),
  (d) => addGroupToMockedIndexDataset(d, addressBook, group2Name, group2Url)
);

describe("GroupDeleteModal", () => {
  let mutateGroups;
  let handleClose;
  let pushRouter;

  beforeEach(() => {
    mutateGroups = jest.fn();
    handleClose = jest.fn();
    pushRouter = jest.fn();

    mockedAddressBookHook.mockReturnValue({
      data: addressBook,
    });
    mockedContactsHook.mockReturnValue({
      data: [group1],
      mutate: mutateGroups,
    });
    mockedGroupHook.mockReturnValue({
      data: group1,
    });
    mockedSessionHook.mockReturnValue({ fetch });
    mockedRouterHook.mockReturnValue({
      push: pushRouter,
      query: { iri: group1Url },
    });
  });

  it("renders", () => {
    const { getByTestId } = renderGroupsPage(
      <GroupDeleteModal open handleClose={handleClose} />
    );
    expect(getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL)).toBeDefined();
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL_TITLE).innerHTML
    ).toContain(`Delete&nbsp;${group1Name}`);
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL_BODY).innerHTML
    ).toContain(MESSAGE_GROUP_DELETE_MODAL_BODY);
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL_CANCEL_BUTTON)
    ).toBeDefined();
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL_SAVE_BUTTON)
    ).toBeDefined();
  });

  it("closes modal when clicking the cancel button", () => {
    const { getByTestId } = renderGroupsPage(
      <GroupDeleteModal open handleClose={handleClose} />
    );
    userEvent.click(getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL_CANCEL_BUTTON));
    expect(handleClose).toHaveBeenCalled();
  });

  describe("clicking the delete button", () => {
    let mockedDeleteGroup;

    beforeEach(() => {
      mockedDeleteGroup = jest
        .spyOn(contactGroupModelFns, "deleteGroup")
        .mockResolvedValue({
          dataset: groupIndexWithGroup2Dataset,
          type: GROUP_CONTACT,
        });
    });

    it("deletes the group, updates dependencies, and redirects", async () => {
      const { getByTestId } = renderGroupsPage(
        <GroupDeleteModal open handleClose={handleClose} />
      );
      userEvent.click(getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL_SAVE_BUTTON));
      expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
      await waitFor(() =>
        expect(
          getByTestId(TESTCAFE_ID_GROUP_DELETE_MODAL_SAVE_BUTTON)
        ).toBeDefined()
      );
      expect(mockedDeleteGroup).toHaveBeenCalledWith(
        addressBook,
        group1,
        fetch
      );
      expect(mutateGroups).toHaveBeenCalledWith();
      expect(pushRouter).toHaveBeenCalledWith("/groups");
    });
  });
});
