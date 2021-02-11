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
import { waitFor } from "@testing-library/dom";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import AgentPickerModal, {
  handleConfirmation,
  handleSaveContact,
  handleSubmit,
} from "./index";
import * as AddressBookFns from "../../../../../src/addressBook";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../../__testUtils/mockAccessControl";
import mockPersonContactThing from "../../../../../__testUtils/mockPersonContactThing";

import AccessControlContext from "../../../../../src/contexts/accessControlContext";
import * as ProfileFns from "../../../../../src/solidClientHelpers/profile";
import ConfirmationDialogContext from "../../../../../src/contexts/confirmationDialogContext";
import useNamedPolicyPermissions from "../../../../../src/hooks/useNamedPolicyPermissions";
import usePermissionsWithProfiles from "../../../../../src/hooks/usePermissionsWithProfiles";

jest.mock("../../../../../src/hooks/useNamedPolicyPermissions");
jest.mock("../../../../../src/hooks/usePermissionsWithProfiles");

const permissions = [
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    webId: "https://example1.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 1",
      types: ["https://schema.org/Person"],
    },
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    webId: "https://example2.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 2",
      types: ["https://schema.org/Person"],
    },
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    webId: "https://example3.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 3",
      types: ["https://schema.org/Person"],
    },
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    webId: "https://example4.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 4",
      types: ["https://schema.org/Person"],
    },
  },
];

describe("AgentPickerModal", () => {
  const onClose = jest.fn();
  const accessControl = mockAccessControl();
  it("updates the temporary row with profile data when available", async () => {
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const { getByTestId, findByTestId, findByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal type="editors" text="Add Editors" onClose={onClose} />
      </AccessControlContext.Provider>
    );

    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = "https://somewebid.com";

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValueOnce({ name, avatar, webId });

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = await findByTestId("webid-input");
    userEvent.type(input, webId);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);

    const agentWebId = await findByText("Example");

    expect(agentWebId).not.toBeNull();
  });
  it("updates the temporary row with webId only when profile is unavailable", async () => {
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const webId = "https://somewebid.com";
    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });

    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal type="editors" text="Add Editors" onClose={onClose} />
      </AccessControlContext.Provider>
    );

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = await findByTestId("webid-input");
    userEvent.type(input, webId);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);
    const agentWebId = await findByText(webId);

    expect(agentWebId).not.toBeNull();
  });
  // update this when we actually pass the contacts to the table
  it("renders a table with tabs, searchbox and an empty state message when there are no contacts", () => {
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [],
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <AgentPickerModal type="editors" text="Add Editors" onClose={onClose} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId("empty-state-add-webid-button")).not.toBeNull();
  });
  it("renders a warning when trying to submit without adding a webId", () => {
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const { getByTestId, getByRole } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal type="editors" text="Add Editors" onClose={onClose} />
      </AccessControlContext.Provider>
    );

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const submitWebIdsButton = getByTestId("submit-webids-button");
    userEvent.click(submitWebIdsButton);

    expect(getByRole("alert")).not.toBeNull();
  });
  it("opens a confirmation dialog", async () => {
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const setOpen = jest.fn();
    const setTitle = jest.fn();

    const contextValue = {
      confirmed: false,
      content: null,
      open: false,
      setConfirmed: jest.fn(),
      setContent: jest.fn(),
      setOpen,
      setTitle,
      title: "Confirmation",
    };

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });

    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <ConfirmationDialogContext.Provider value={contextValue}>
        <AccessControlContext.Provider value={{ accessControl }}>
          <AgentPickerModal
            type="editors"
            text="Add Editors"
            onClose={onClose}
          />
        </AccessControlContext.Provider>
      </ConfirmationDialogContext.Provider>
    );

    const webId = "https://somewebid.com";

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = await findByTestId("webid-input");
    userEvent.type(input, webId);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);
    await findByText(webId);
    const submitWebIdsButton = getByTestId("submit-webids-button");
    userEvent.click(submitWebIdsButton);
    expect(setTitle).toHaveBeenCalledWith("Change permissions for 1 person");
    expect(setOpen).toHaveBeenCalledWith("add-new-permissions");
  });
  it("renders the correct confimation message for more than 1 agent", async () => {
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const setOpen = jest.fn();
    const setTitle = jest.fn();

    const contextValue = {
      confirmed: false,
      content: null,
      open: false,
      setConfirmed: jest.fn(),
      setContent: jest.fn(),
      setOpen,
      setTitle,
      title: "Confirmation",
    };
    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <ConfirmationDialogContext.Provider value={contextValue}>
        <AccessControlContext.Provider value={{ accessControl }}>
          <AgentPickerModal
            type="editors"
            text="Add Editors"
            onClose={onClose}
          />
        </AccessControlContext.Provider>
      </ConfirmationDialogContext.Provider>
    );

    const webId1 = "https://somewebid.com";
    const webId2 = "https://someotherwebid.com";

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = await findByTestId("webid-input");
    userEvent.type(input, webId1);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);
    await findByText(webId1);
    expect(addWebIdButton).not.toBeDisabled();
    userEvent.click(addWebIdButton);
    const input2 = await findByTestId("webid-input");
    userEvent.type(input2, webId2);
    const addButton2 = getByTestId("add-button");
    userEvent.click(addButton2);
    await findByText(webId2);

    const submitWebIdsButton = getByTestId("submit-webids-button");
    userEvent.click(submitWebIdsButton);
    expect(setTitle).toHaveBeenCalledWith("Change permissions for 2 people");
    expect(setOpen).toHaveBeenCalledWith("add-new-permissions");
  });
  it("cannot uncheck checkbox for the agent being added", async () => {
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const setOpen = jest.fn();
    const setTitle = jest.fn();

    const contextValue = {
      confirmed: false,
      content: null,
      open: false,
      setConfirmed: jest.fn(),
      setContent: jest.fn(),
      setOpen,
      setTitle,
      title: "Confirmation",
    };
    const { getByTestId, getByRole } = renderWithTheme(
      <ConfirmationDialogContext.Provider value={contextValue}>
        <AccessControlContext.Provider value={{ accessControl }}>
          <AgentPickerModal
            type="editors"
            text="Add Editors"
            onClose={onClose}
          />
        </AccessControlContext.Provider>
      </ConfirmationDialogContext.Provider>
    );

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const checkBox = getByRole("checkbox");
    expect(checkBox).toBeChecked();
    userEvent.click(checkBox);
    expect(checkBox).toBeChecked();
  });
  it("renders a warning when trying to submit a webId that is already in the policy", async () => {
    const webId = "https://somewebid.com";
    useNamedPolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    usePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [{ webId }],
    });

    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal type="editors" text="Add Editors" onClose={onClose} />
      </AccessControlContext.Provider>
    );

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = await findByTestId("webid-input");
    userEvent.type(input, webId);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);
    const submitWebIdsButton = getByTestId("submit-webids-button");
    userEvent.click(submitWebIdsButton);
    await waitFor(() => {
      expect(findByText("That WebID has already been added")).not.toBeNull();
    });
  });
});
describe("handleConfirmation", () => {
  const dialogId = "dialogId";
  const setOpen = jest.fn();
  const handleSubmitNewWebIds = jest.fn();
  const setConfirmed = jest.fn();
  const setConfirmationSetup = jest.fn();
  const open = dialogId;

  const handler = handleConfirmation({
    open,
    dialogId,
    setConfirmationSetup,
    setOpen,
    setConfirmed,
    handleSubmitNewWebIds,
  });

  it("returns a handler which calls a function that the webIds when user confirms dialog", () => {
    handler(true, true);

    expect(handleSubmitNewWebIds).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
  });
  it("returns a handler that exits when user cancels the operation", () => {
    handler(true, false);

    expect(setOpen).toHaveBeenCalledWith(null);
    expect(handleSubmitNewWebIds).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
  });
  it("returns a handler that exits when user starts confirmation but hasn't selected an option", () => {
    handler(true, null);

    expect(handleSubmitNewWebIds).not.toHaveBeenCalled();
  });
});

describe("handleSubmit", () => {
  const webId = "https://example.org";
  const setNoAgentsAlert = jest.fn();
  const accessControl = mockAccessControl();
  const people = [mockPersonContactThing()];
  const addressBook = mockSolidDatasetFrom("https://example.org/addressBook");
  const mutatePermissions = jest.fn();
  const saveAgentToContacts = jest.fn();
  const onClose = jest.fn();
  const type = "editors";
  const fetch = jest.fn();

  it("returns a handler that submits the new webIds", async () => {
    const handler = handleSubmit({
      newAgentsWebIds: [webId],
      setNoAgentsAlert,
      accessControl,
      people,
      addressBook,
      mutatePermissions,
      saveAgentToContacts,
      onClose,
      type,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.addAgentToNamedPolicy).toHaveBeenCalledWith(
        webId,
        type
      );
    });

    expect(saveAgentToContacts).toHaveBeenCalled();
    expect(mutatePermissions).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls setNoAgentsAlert when array of agents if empty", () => {
    const handler = handleSubmit({
      newAgentsWebIds: [],
      setNoAgentsAlert,
      accessControl,
      people,
      addressBook,
      mutatePermissions,
      saveAgentToContacts,
      onClose,
      type,
      fetch,
    });
    handler();

    expect(setNoAgentsAlert).toHaveBeenCalledWith(true);
  });
});

describe("handleSaveContact", () => {
  const iri = "https://example.org";
  const people = [mockPersonContactThing()];
  const addressBookUrl = "http://example.com/contacts/index.ttl";
  const addressBook = mockSolidDatasetFrom(addressBookUrl);
  const fetch = jest.fn();
  it("exits if no iri", () => {
    handleSaveContact(null, people, addressBook, fetch);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
  it("cancels the operation if webId is already in contacts", () => {
    handleSaveContact(iri, people, addressBook, fetch);
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });

    jest
      .spyOn(AddressBookFns, "findContactInAddressBook")
      .mockResolvedValue([iri]);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
  it("saves the contact", () => {
    handleSaveContact(iri, people, addressBook, fetch);
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });

    jest
      .spyOn(AddressBookFns, "findContactInAddressBook")
      .mockResolvedValue([]);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
});
