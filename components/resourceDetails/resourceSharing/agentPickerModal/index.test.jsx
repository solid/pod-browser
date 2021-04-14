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
// eslint-disable-next-line camelcase
import { acp_v2, mockSolidDatasetFrom } from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import AgentPickerModal, {
  handleConfirmation,
  handleSaveContact,
  handleSubmit,
} from "./index";
import * as AddressBookFns from "../../../../src/addressBook";
import * as personModelFunctions from "../../../../src/models/contact/person";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../__testUtils/mockAccessControl";
import mockPersonContact from "../../../../__testUtils/mockPersonContact";
import mockGroupContact from "../../../../__testUtils/mockGroupContact";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import * as ProfileFns from "../../../../src/solidClientHelpers/profile";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import usePolicyPermissions from "../../../../src/hooks/usePolicyPermissions";
import useAddressBook from "../../../../src/hooks/useAddressBook";
import useContacts from "../../../../src/hooks/useContacts";
import { PUBLIC_AGENT_PREDICATE } from "../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../src/models/contact/authenticated";

jest.mock("../../../../src/hooks/useAddressBook");
const mockedUseAddressBook = useAddressBook;

jest.mock("../../../../src/hooks/usePolicyPermissions");
const mockedUsePolicyPermissions = usePolicyPermissions;

jest.mock("../../../../src/hooks/useContacts");
const mockedUseContacts = useContacts;

const resourceUrl = "http://example.com/resource";

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

describe("handleSubmit", () => {
  const webId = "https://example.org";
  const setLoading = jest.fn();
  const acr = acp_v2.mockAcrFor(resourceUrl);
  const accessControl = mockAccessControl();
  accessControl.addAgentToPolicy.mockResolvedValue({ response: acr });
  accessControl.removeAgentFromPolicy.mockResolvedValue({ response: acr });
  accessControl.setRulePublic.mockResolvedValue({ response: acr });
  accessControl.setRuleAuthenticated.mockResolvedValue({ response: acr });
  const addressBook = mockSolidDatasetFrom("https://example.org/addressBook");
  const mutateResourceInfo = jest.fn();
  const saveAgentToContacts = jest.fn();
  const onClose = jest.fn();
  const fetch = jest.fn();

  beforeEach(() => {});

  it("returns a handler that exits when user does not make any changes", async () => {
    const policyName = "editors";
    const handler = handleSubmit({
      newAgentsWebIds: [],
      webIdsToDelete: [],
      accessControl,
      addressBook,
      mutateResourceInfo,
      saveAgentToContacts,
      onClose,
      setLoading,
      policyName,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.addAgentToPolicy).not.toHaveBeenCalled();
    });

    expect(saveAgentToContacts).not.toHaveBeenCalled();
    expect(mutateResourceInfo).not.toHaveBeenCalled();
  });

  it("returns a handler that submits the new webIds", async () => {
    const policyName = "editors";
    const handler = handleSubmit({
      newAgentsWebIds: [webId],
      webIdsToDelete: [],
      accessControl,
      addressBook,
      mutateResourceInfo,
      saveAgentToContacts,
      onClose,
      setLoading,
      policyName,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.addAgentToPolicy).toHaveBeenCalledWith(
        webId,
        policyName
      );
    });

    expect(saveAgentToContacts).toHaveBeenCalledWith(webId, addressBook, fetch);
    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(onClose).toHaveBeenCalled();
  });

  it("when webId is public agent url, it calls the corresponding setRulePublic with the correct value", async () => {
    const policyName = "editors";
    const handler = handleSubmit({
      newAgentsWebIds: [PUBLIC_AGENT_PREDICATE],
      webIdsToDelete: [],
      accessControl,
      addressBook,
      mutateResourceInfo,
      saveAgentToContacts,
      onClose,
      setLoading,
      policyName,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.setRulePublic).toHaveBeenCalledWith(
        policyName,
        true
      );
    });

    expect(saveAgentToContacts).not.toHaveBeenCalledWith();
    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(onClose).toHaveBeenCalled();
  });

  it("when webId is authenticated agent url, it calls the corresponding setRuleAuthenticated with the correct value", async () => {
    const policyName = "editors";
    const handler = handleSubmit({
      newAgentsWebIds: [AUTHENTICATED_AGENT_PREDICATE],
      webIdsToDelete: [],
      accessControl,
      addressBook,
      mutateResourceInfo,
      saveAgentToContacts,
      onClose,
      setLoading,
      policyName,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.setRuleAuthenticated).toHaveBeenCalledWith(
        policyName,
        true
      );
    });

    expect(saveAgentToContacts).not.toHaveBeenCalledWith();
    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(onClose).toHaveBeenCalled();
  });

  it("returns a handler that submits the webIdsToDelete", async () => {
    const policyName = "editors";
    const handler = handleSubmit({
      newAgentsWebIds: [],
      webIdsToDelete: [webId],
      accessControl,
      addressBook,
      mutateResourceInfo,
      saveAgentToContacts,
      onClose,
      setLoading,
      policyName,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        webId,
        policyName
      );
    });

    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(onClose).toHaveBeenCalled();
  });
  it("when webId to be deleted is public agent url, it calls the corresponding setRulePublic with the correct value", async () => {
    const policyName = "editors";
    const handler = handleSubmit({
      newAgentsWebIds: [],
      webIdsToDelete: [PUBLIC_AGENT_PREDICATE],
      accessControl,
      addressBook,
      mutateResourceInfo,
      saveAgentToContacts,
      onClose,
      setLoading,
      policyName,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.setRulePublic).toHaveBeenCalledWith(
        policyName,
        false
      );
    });

    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(onClose).toHaveBeenCalled();
  });

  it("when webId to be deleted is authenticated agent url, it calls the corresponding setRuleAuthenticated with the correct value", async () => {
    const policyName = "editors";
    const handler = handleSubmit({
      newAgentsWebIds: [],
      webIdsToDelete: [AUTHENTICATED_AGENT_PREDICATE],
      accessControl,
      addressBook,
      mutateResourceInfo,
      saveAgentToContacts,
      onClose,
      setLoading,
      policyName,
      fetch,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.setRuleAuthenticated).toHaveBeenCalledWith(
        policyName,
        false
      );
    });

    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(onClose).toHaveBeenCalled();
  });
});

describe("handleConfirmation", () => {
  const dialogId = "dialogId";
  const setOpen = jest.fn();
  const handleSubmitNewWebIds = jest.fn();
  const setConfirmed = jest.fn();
  const setTitle = jest.fn();
  const setContent = jest.fn();
  const setConfirmationSetup = jest.fn();
  const open = dialogId;

  const handler = handleConfirmation({
    open,
    dialogId,
    setConfirmationSetup,
    setOpen,
    setContent,
    setTitle,
    setConfirmed,
    handleSubmitNewWebIds,
  });

  it("returns a handler which calls a function that submits the webIds when user confirms dialog", () => {
    handler(true, true);

    expect(handleSubmitNewWebIds).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
    expect(setTitle).toHaveBeenCalledWith(null);
    expect(setContent).toHaveBeenCalledWith(null);
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

describe("handleSaveContact", () => {
  const iri = "https://example.org";
  const contacts = [
    mockPersonContact(
      mockAddressBook(),
      "https://example.org/contacts/Person/1234/",
      "Example 1"
    ),
  ];
  const addressBookUrl = "http://example.com/contacts/index.ttl";
  const addressBook = mockSolidDatasetFrom(addressBookUrl);
  const fetch = jest.fn();
  it("exits if no iri", () => {
    handleSaveContact(null, contacts, addressBook, fetch);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
  it("cancels the operation if webId is already in contacts", () => {
    handleSaveContact(iri, contacts, addressBook, fetch);
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });

    jest
      .spyOn(personModelFunctions, "findPersonContactInAddressBook")
      .mockResolvedValue([iri]);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
  it("saves the contact", () => {
    handleSaveContact(iri, contacts, addressBook, fetch);
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });

    jest
      .spyOn(personModelFunctions, "findPersonContactInAddressBook")
      .mockResolvedValue([]);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
});

describe("AgentPickerModal without contacts", () => {
  beforeEach(() => {
    mockedUseAddressBook.mockReturnValue({ data: mockAddressBook() });
  });
  const onClose = jest.fn();
  const accessControl = mockAccessControl();
  const setLoading = jest.fn();

  it("updates the temporary row with profile data when available", async () => {
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = "https://somewebid.com";
    mockedUseContacts.mockReturnValue({ data: [] });

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const { getByTestId, findByTestId, findByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text={{ editText: "Edit Editors", saveText: "Save Editors" }}
          onClose={onClose}
          setLoading={setLoading}
        />
      </AccessControlContext.Provider>
    );
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
    mockedUseContacts.mockReturnValue({ data: [] });

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const webId = "https://somewebid.com";
    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValue({ error: "error" });

    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text={{ editText: "Edit Editors", saveText: "Save Editors" }}
          onClose={onClose}
          setLoading={setLoading}
        />
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
  it("renders a table with tabs, searchbox, 'Anyone' and 'Anyone signed in' when there are no contacts", () => {
    mockedUseContacts.mockReturnValue({ data: [] });

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const { asFragment, queryAllByTestId } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text={{ editText: "Edit Editors", saveText: "Save Editors" }}
        onClose={onClose}
        setLoading={setLoading}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryAllByTestId("agent-webid")).toHaveLength(2);
    expect(queryAllByTestId("agent-webid")[0]).toHaveTextContent("Anyone");
    expect(queryAllByTestId("agent-webid")[1]).toHaveTextContent(
      "Anyone signed in"
    );
  });
  it("opens a confirmation dialog", async () => {
    mockedUseContacts.mockReturnValue({ data: [] });

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
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
            text={{ editText: "Edit Editors", saveText: "Save Editors" }}
            onClose={onClose}
            setLoading={setLoading}
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
  it("confirms without dialog if webIds to be added are only public and/or authenticated agents", async () => {
    mockedUseContacts.mockReturnValue({ data: [] });

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const setOpen = jest.fn();
    const setTitle = jest.fn();
    const setConfirmed = jest.fn();

    const contextValue = {
      confirmed: false,
      content: null,
      open: false,
      setConfirmed,
      setContent: jest.fn(),
      setOpen,
      setTitle,
      title: "Confirmation",
    };

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });

    const { getByTestId, getAllByRole } = renderWithTheme(
      <ConfirmationDialogContext.Provider value={contextValue}>
        <AccessControlContext.Provider value={{ accessControl }}>
          <AgentPickerModal
            type="editors"
            text={{ editText: "Edit Editors", saveText: "Save Editors" }}
            onClose={onClose}
            setLoading={setLoading}
          />
        </AccessControlContext.Provider>
      </ConfirmationDialogContext.Provider>
    );

    const checkBoxes = getAllByRole("checkbox");
    userEvent.click(checkBoxes[0]);
    const submitWebIdsButton = getByTestId("submit-webids-button");
    userEvent.click(submitWebIdsButton);
    expect(setConfirmed).toHaveBeenCalledWith(true);
  });
  it("renders the correct confirmation message for more than 1 agent", async () => {
    mockedUseContacts.mockReturnValue({ data: [] });

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
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
            text={{ editText: "Edit Editors", saveText: "Save Editors" }}
            onClose={onClose}
            setLoading={setLoading}
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
    mockedUseContacts.mockReturnValue({ data: [] });

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
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
    const { getByTestId, getAllByRole } = renderWithTheme(
      <ConfirmationDialogContext.Provider value={contextValue}>
        <AccessControlContext.Provider value={{ accessControl }}>
          <AgentPickerModal
            type="editors"
            text={{ editText: "Edit Editors", saveText: "Save Editors" }}
            onClose={onClose}
            setLoading={setLoading}
          />
        </AccessControlContext.Provider>
      </ConfirmationDialogContext.Provider>
    );

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const checkBoxes = getAllByRole("checkbox");
    expect(checkBoxes[0]).toBeChecked();
    userEvent.click(checkBoxes[0]);
    expect(checkBoxes[0]).toBeChecked();
  });
  it("renders a warning when trying to submit a webId that is already in the policy", async () => {
    mockedUseContacts.mockReturnValue({ data: [] });

    const webId = "https://somewebid.com";
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text={{ editText: "Edit Editors", saveText: "Save Editors" }}
          onClose={onClose}
          setLoading={setLoading}
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

describe("AgentPickerModal with contacts", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedUseAddressBook.mockReturnValue({ data: mockAddressBook() });
  });

  const onClose = jest.fn();
  it("renders a table with the available contacts, Anyone and Anyone signed in", () => {
    mockedUseContacts.mockReturnValue({
      data: [
        mockPersonContact(
          mockAddressBook(),
          "https://example.org/contacts/Person/1234/",
          "Example 1"
        ),
        mockPersonContact(
          mockAddressBook(),
          "https://example.org/contacts/Person/3456/",
          "Example 2"
        ),
      ],
    });
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const { asFragment, queryAllByTestId } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text={{ editText: "Edit Editors", saveText: "Save Editors" }}
        onClose={onClose}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    waitFor(() => {
      expect(queryAllByTestId("agent-webid")).toHaveLength(2);
    });
  });
  it("search bar filters by name", () => {
    const containerUrl = "https://example.com/contacts/";
    const emptyAddressBook = mockAddressBook({ containerUrl });
    mockedUseContacts.mockReturnValue({
      data: [
        mockPersonContact(
          emptyAddressBook,
          "https://example.org/contacts/Person/1234/",
          "Example 1"
        ),
        mockPersonContact(
          emptyAddressBook,
          "https://example.org/contacts/Person/3456/",
          "Example 2"
        ),
        mockGroupContact(emptyAddressBook, "Group 1", { id: "1234" }),
      ],
    });
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const {
      getByTestId,
      queryAllByTestId,
      findByText,
      queryByText,
    } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text={{ editText: "Edit Editors", saveText: "Save Editors" }}
        onClose={onClose}
      />
    );
    const searchBar = getByTestId("search-input");
    userEvent.type(searchBar, "Example 1");
    expect(queryAllByTestId("agent-webid")).toHaveLength(1);
    expect(findByText("Example 1")).not.toBeNull();
    expect(queryByText("Example 2")).toBeNull();
    userEvent.clear(searchBar);
    expect(queryAllByTestId("agent-webid")).toHaveLength(5);
  });
  it("clicking the tabs filters by person or group contact", () => {
    const containerUrl = "https://example.com/contacts/";
    const emptyAddressBook = mockAddressBook({ containerUrl });
    mockedUseContacts.mockReturnValue({
      data: [
        mockPersonContact(
          emptyAddressBook,
          "https://example.org/contacts/Person/1234/",
          "Example 1"
        ),
        mockPersonContact(
          emptyAddressBook,
          "https://example.org/contacts/Person/3456/",
          "Example 2"
        ),
        mockGroupContact(emptyAddressBook, "Group 1", { id: "1234" }),
      ],
    });
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const { getByTestId, queryAllByTestId } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text={{ editText: "Edit Editors", saveText: "Save Editors" }}
        onClose={onClose}
      />
    );
    const peopleTab = getByTestId("tab-people");
    userEvent.click(peopleTab);
    expect(queryAllByTestId("agent-webid")).toHaveLength(2);
    const groupsTab = getByTestId("tab-groups");
    userEvent.click(groupsTab);
    // TODO: we will call this testid differently when we have groups
    expect(queryAllByTestId("agent-webid")).toHaveLength(1);
  });
  it("clicking on group tab with no results renders correct empty state text", () => {
    const containerUrl = "https://example.com/contacts/";
    const emptyAddressBook = mockAddressBook({ containerUrl });
    mockedUseContacts.mockReturnValue({
      data: [
        mockPersonContact(
          emptyAddressBook,
          "https://example.org/contacts/Person/1234/",
          "Example 1"
        ),
        mockPersonContact(
          emptyAddressBook,
          "https://example.org/contacts/Person/3456/",
          "Example 2"
        ),
      ],
    });
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const { getByTestId, queryAllByTestId, queryByText } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text={{ editText: "Edit Editors", saveText: "Save Editors" }}
        onClose={onClose}
      />
    );
    const groupsTab = getByTestId("tab-groups");
    userEvent.click(groupsTab);
    // TODO: we will call this testid differently when we have groups
    expect(queryAllByTestId("agent-webid")).toHaveLength(0);
    expect(queryByText("No groups found")).not.toBeNull();
  });
  it("clicking on people tab with no results renders correct empty state text", () => {
    const containerUrl = "https://example.com/contacts/";
    const emptyAddressBook = mockAddressBook({ containerUrl });
    mockedUseContacts.mockReturnValue({
      data: [mockGroupContact(emptyAddressBook, "Group 1", { id: "1234" })],
    });
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
      mutate: jest.fn(),
    });
    const { getByTestId, queryAllByTestId, queryByText } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text={{ editText: "Edit Editors", saveText: "Save Editors" }}
        onClose={onClose}
      />
    );
    const peopleTab = getByTestId("tab-people");
    userEvent.click(peopleTab);
    // TODO: we will call this testid differently when we have groups
    expect(queryAllByTestId("agent-webid")).toHaveLength(0);
    expect(queryByText("No people found")).not.toBeNull();
  });
});
