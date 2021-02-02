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
import "@testing-library/jest-dom/extend-expect";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import AgentPickerModal, {
  handleConfirmation,
  handleSaveContact,
  handleSubmit,
} from "./index";
import {
  findContactInAddressBook,
  saveContact,
} from "../../../../../src/addressBook";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../../__testUtils/mockAccessControl";
import mockPersonContactThing from "../../../../../__testUtils/mockPersonContactThing";

import AccessControlContext from "../../../../../src/contexts/accessControlContext";
import { fetchProfile } from "../../../../../src/solidClientHelpers/profile";
import ConfirmationDialogContext from "../../../../../src/contexts/confirmationDialogContext";

jest.mock("../../../../../src/solidClientHelpers/profile");
jest.mock("../../../../../src/addressBook");

describe("AgentPickerModal", () => {
  const onClose = jest.fn();
  const mutatePermissions = jest.fn();
  const permissions = [];
  const accessControl = mockAccessControl();

  it("updates the temporary row with webId only when profile is unavailable", async () => {
    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </AccessControlContext.Provider>
    );

    const webId = "https://somewebid.com";

    fetchProfile.mockRejectedValueOnce({ error: "error" });

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = await findByTestId("webid-input");
    userEvent.type(input, webId);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);
    const agentWebId = await findByText(webId);

    expect(agentWebId).not.toBeNull();
  });

  it("updates the temporary row with profile data when available", async () => {
    const { getByTestId, findByTestId, findByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </AccessControlContext.Provider>
    );

    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = "https://somewebid.com";

    fetchProfile.mockResolvedValueOnce({ name, avatar, webId });

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = await findByTestId("webid-input");
    userEvent.type(input, webId);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);

    const agentWebId = await findByText("Example");

    expect(agentWebId).not.toBeNull();
  });
  // update this when we actually pass the contacts to the table
  it("renders a table with tabs, searchbox and an empty state message when there are no contacts", () => {
    const { asFragment } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text="Add Editors"
        onClose={onClose}
        mutatePermissions={mutatePermissions}
        permissions={permissions}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it("renders a warning when trying to submit without adding a webId", () => {
    const { getByTestId, getByRole } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </AccessControlContext.Provider>
    );

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const submitWebIdsButton = getByTestId("submit-webids-button");
    userEvent.click(submitWebIdsButton);

    expect(getByRole("alert")).not.toBeNull();
  });

  it("opens a confirmation dialog", async () => {
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
            mutatePermissions={mutatePermissions}
            permissions={permissions}
          />
        </AccessControlContext.Provider>
      </ConfirmationDialogContext.Provider>
    );

    const webId = "https://somewebid.com";

    await fetchProfile.mockRejectedValue({ error: "error" });

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
  it("renders a warning when trying to submit a webId that is already in the policy", async () => {
    const webId = "https://somewebid.com";

    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={[{ webId }]}
        />
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

  test("it returns a handler which calls a function that the webIds when user confirms dialog", () => {
    handler(true, true);

    expect(handleSubmitNewWebIds).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
  });
  test("it returns a handler that exits when user cancels the operation", () => {
    handler(true, false);

    expect(setOpen).toHaveBeenCalledWith(null);
    expect(handleSubmitNewWebIds).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
  });
  test("it returns a handler that exits when user starts confirmation but hasn't selected an option", () => {
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

  test("it returns a handler that submits the new webIds", async () => {
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

  test("it calls setNoAgentsAlert when array of agents if empty", () => {
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
  test("it exits if no iri", () => {
    handleSaveContact(null, people, addressBook, fetch);

    expect(saveContact).not.toHaveBeenCalled();
  });
  test("it cancels the operation if webId is already in contacts", () => {
    handleSaveContact(iri, people, addressBook, fetch);
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    fetchProfile.mockResolvedValue({ name, avatar, webId });

    findContactInAddressBook.mockResolvedValue([iri]);

    expect(saveContact).not.toHaveBeenCalled();
  });
  test("it saves the contact", () => {
    handleSaveContact(iri, people, addressBook, fetch);
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    fetchProfile.mockResolvedValue({ name, avatar, webId });

    findContactInAddressBook.mockResolvedValue([]);

    expect(saveContact).not.toHaveBeenCalled();
  });
});
