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
import { vcard } from "rdf-namespaces";
import useAddressBook from "../../../src/hooks/useAddressBook";
import useContacts from "../../../src/hooks/useContacts";
import useGroup from "../../../src/hooks/useGroup";
import mockGroup from "../../../__testUtils/mockGroup";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import renderGroupsPage from "../../../__testUtils/renderGroupsPage";
import { TESTCAFE_ID_SPINNER } from "../../spinner";
import { TESTCAFE_ID_ERROR_MESSAGE } from "../../errorMessage";
import * as contactGroupFns from "../../../src/models/contact/group";
import mockGroupIndex from "../../../__testUtils/mockGroupIndex";
import { getContactAllFromContactsIndex } from "../../../src/models/contact";
import GroupDetailsModal, {
  LIMITATION_GROUP_DETAILS_MODAL_DESCRIPTION_MAX_LENGTH,
  LIMITATION_GROUP_DETAILS_MODAL_NAME_MAX_LENGTH,
  MESSAGE_GROUP_DETAILS_MODAL_NAME_REQUIRED,
  TESTCAFE_ID_GROUP_DETAILS_MODAL,
  TESTCAFE_ID_GROUP_DETAILS_MODAL_CANCEL_BUTTON,
  TESTCAFE_ID_GROUP_DETAILS_MODAL_DESCRIPTION_FIELD,
  TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD,
  TESTCAFE_ID_GROUP_DETAILS_MODAL_SAVE_BUTTON,
} from "./index";

jest.mock("../../../src/hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("../../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

jest.mock("../../../src/hooks/useGroup");
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

const group1Name = "Group 1";
const group1Url = "http://example.com/group1.ttl#this";
const group1Description = "Old description";
const group1 = mockGroup(group1Name, group1Url, {
  description: group1Description,
});

const updatedGroup = mockGroup("New name", group1Url, {
  description: "New description",
});
const updatedGroupIndex = mockGroupIndex(addressBook, [updatedGroup]);

describe("GroupDetailsModal", () => {
  let mutateAddressBook;
  let mutateGroups;
  let mutateGroup;
  let handleClose;

  beforeEach(() => {
    mutateAddressBook = jest.fn();
    mutateGroups = jest.fn();
    mutateGroup = jest.fn();
    handleClose = jest.fn();

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
    const { getByTestId } = renderGroupsPage(
      <GroupDetailsModal open handleClose={handleClose} />
    );
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL)).toBeDefined();
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD)
    ).toBeDefined();
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD).value
    ).toEqual(group1Name);
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD).getAttribute(
        "maxlength"
      )
    ).toEqual(LIMITATION_GROUP_DETAILS_MODAL_NAME_MAX_LENGTH.toString());
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_DESCRIPTION_FIELD)
    ).toBeDefined();
    expect(
      getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_DESCRIPTION_FIELD).value
    ).toEqual(group1Description);
    expect(
      getByTestId(
        TESTCAFE_ID_GROUP_DETAILS_MODAL_DESCRIPTION_FIELD
      ).getAttribute("maxlength")
    ).toEqual(LIMITATION_GROUP_DETAILS_MODAL_DESCRIPTION_MAX_LENGTH.toString());
  });

  it("sets focus on name input field", () => {
    const { getByTestId } = renderGroupsPage(
      <GroupDetailsModal open handleClose={handleClose} />
    );
    expect(getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD)).toBe(
      document.activeElement
    );
  });

  it("renders a spinner while loading group", () => {
    mockedGroupHook.mockReturnValue({ isValidating: true });
    const { getByTestId } = renderGroupsPage(
      <GroupDetailsModal open handleClose={handleClose} />
    );
    expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
  });

  it("renders an error if something goes wrong", () => {
    const errorMessage = "error";
    mockedContactsHook.mockReturnValue({ error: new Error(errorMessage) });
    const { getByTestId } = renderGroupsPage(
      <GroupDetailsModal open handleClose={handleClose} />
    );
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

    it("updates the name and description of the group", async () => {
      const { getByTestId } = renderGroupsPage(
        <GroupDetailsModal open handleClose={handleClose} />
      );
      userEvent.type(
        getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_DESCRIPTION_FIELD),
        "{selectall}{del}New description"
      );
      userEvent.type(
        getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD),
        "{selectall}{del}New name{enter}"
      );

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledWith();
      });
      expect(mockedRenameGroup).toHaveBeenCalledWith(
        addressBook,
        group1,
        "New name",
        fetch,
        {
          [vcard.note]: "New description",
        }
      );
      expect(mutateGroup).toHaveBeenCalledWith(updatedGroup);
      expect(mutateGroups).toHaveBeenCalledWith(
        getContactAllFromContactsIndex(updatedGroupIndex)
      );
    });

    it("renders a spinner while processing", async () => {
      const { getByTestId } = renderGroupsPage(
        <GroupDetailsModal open handleClose={handleClose} />
      );
      userEvent.type(
        getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD),
        "{selectall}{del}New name{enter}"
      );

      expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledWith();
      });
    });

    it("won't allow empty names", () => {
      const { getByTestId, getByText } = renderGroupsPage(
        <GroupDetailsModal open handleClose={handleClose} />
      );
      userEvent.type(
        getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_NAME_FIELD),
        "{selectall}{del}{enter}"
      );
      expect(
        getByText(MESSAGE_GROUP_DETAILS_MODAL_NAME_REQUIRED)
      ).toBeDefined();
      expect(mockedRenameGroup).not.toHaveBeenCalled();
    });

    it("also submits form by clicking the Save button", async () => {
      const { getByTestId } = renderGroupsPage(
        <GroupDetailsModal open handleClose={handleClose} />
      );
      userEvent.click(getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_SAVE_BUTTON));

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledWith();
      });
      expect(mockedRenameGroup).toHaveBeenCalled();
    });
  });

  it("calls handleClose when clicking the Cancel button", () => {
    const { getByTestId } = renderGroupsPage(
      <GroupDetailsModal open handleClose={handleClose} />
    );
    userEvent.click(getByTestId(TESTCAFE_ID_GROUP_DETAILS_MODAL_CANCEL_BUTTON));
    expect(handleClose).toHaveBeenCalledWith();
  });
});
