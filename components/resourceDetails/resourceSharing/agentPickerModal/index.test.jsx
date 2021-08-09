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
import { act } from "react-dom/test-utils";
import AgentPickerModal, {
  handleSaveContact,
  handleSubmit,
  TESTCAFE_SUBMIT_WEBIDS_BUTTON,
} from "./index";
import * as AddressBookFns from "../../../../src/addressBook";
import * as personModelFunctions from "../../../../src/models/contact/person";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../__testUtils/mockAccessControl";
import mockPersonContact from "../../../../__testUtils/mockPersonContact";
import mockGroupContact from "../../../../__testUtils/mockGroupContact";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import AccessControlContext from "../../../../src/contexts/accessControlContext";
import mockPermissionsContextProvider from "../../../../__testUtils/mockPermissionsContextProvider";
import * as ProfileFns from "../../../../src/solidClientHelpers/profile";
import { ConfirmationDialogProvider } from "../../../../src/contexts/confirmationDialogContext";
import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
} from "../../../confirmationDialog";
import usePolicyPermissions from "../../../../src/hooks/usePolicyPermissions";
import useAllPermissions from "../../../../src/hooks/useAllPermissions";
import useAddressBook from "../../../../src/hooks/useAddressBook";
import useContacts from "../../../../src/hooks/useContacts";
import { PUBLIC_AGENT_PREDICATE } from "../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../src/models/contact/authenticated";
import {
  TESTCAFE_ID_ADD_WEBID_BUTTON,
  TESTCAFE_ID_WEBID_INPUT,
} from "../addAgentRow";
import { TESTCAFE_ADD_WEBID_BUTTON } from "./addWebIdButton";
import { TESTCAFE_ID_SEARCH_INPUT } from "../agentsSearchBar";

jest.mock("../../../../src/hooks/useAddressBook");
const mockedUseAddressBook = useAddressBook;

jest.mock("../../../../src/hooks/usePolicyPermissions");
const mockedUsePolicyPermissions = usePolicyPermissions;

jest.mock("../../../../src/hooks/useContacts");
const mockedUseContacts = useContacts;

jest.mock("../../../../src/hooks/useAllPermissions");

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
    alias: "editors",
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
    alias: "editors",
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
    alias: "editors",
  },
  {
    acl: {
      read: true,
      write: true,
      append: false,
      control: false,
    },
    alias: "editors",
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
      permissions,
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
      permissions,
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
      permissions,
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
      permissions,
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
      permissions,
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
      permissions,
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
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });

    jest
      .spyOn(personModelFunctions, "findPersonContactInAddressBook")
      .mockResolvedValue([iri]);

    handleSaveContact(iri, contacts, addressBook, fetch);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
  it("saves the contact", () => {
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = iri;

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });

    jest
      .spyOn(personModelFunctions, "findPersonContactInAddressBook")
      .mockResolvedValue([]);

    handleSaveContact(iri, contacts, addressBook, fetch);

    expect(jest.spyOn(AddressBookFns, "saveContact")).not.toHaveBeenCalled();
  });
});

const PermissionsContextProvider = mockPermissionsContextProvider();

describe("AgentPickerModal without contacts", () => {
  beforeEach(() => {
    mockedUseAddressBook.mockReturnValue({ data: mockAddressBook() });
    mockedUseContacts.mockReturnValue({ data: [] });
  });
  const onClose = jest.fn();
  const accessControl = mockAccessControl();
  const setLoading = jest.fn();
  it("renders a table with tabs, searchbox, 'Anyone' and 'Anyone signed in' when there are no contacts", async () => {
    const { asFragment, queryAllByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <AgentPickerModal
          type="editors"
          text={{ editText: "Edit Editors", saveText: "Save Editors" }}
          onClose={onClose}
          setLoading={setLoading}
        />
      </PermissionsContextProvider>
    );
    await waitFor(() => {
      expect(queryAllByTestId("agent-webid")).toHaveLength(2);
      expect(queryAllByTestId("agent-webid")[0]).toHaveTextContent("Anyone");
      expect(queryAllByTestId("agent-webid")[1]).toHaveTextContent(
        "Anyone signed in"
      );
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("simply closes the modal if no agents are selected", async () => {
    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessControlContext.Provider value={{ accessControl }}>
          <PermissionsContextProvider>
            <AgentPickerModal
              type="editors"
              text={{ editText: "Edit Editors", saveText: "Save Editors" }}
              onClose={onClose}
            />
          </PermissionsContextProvider>
        </AccessControlContext.Provider>
      </ConfirmationDialogProvider>
    );
    const submitButton = getByTestId(TESTCAFE_SUBMIT_WEBIDS_BUTTON);
    userEvent.click(submitButton);
    expect(onClose).toHaveBeenCalled();
  });

  it("updates the temporary row with profile data when available", async () => {
    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = "https://somewebid.com";
    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockResolvedValue({ name, avatar, webId });
    const { getByTestId, getByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <PermissionsContextProvider>
          <AgentPickerModal
            type="editors"
            text={{ editText: "Edit Editors", saveText: "Save Editors" }}
            onClose={onClose}
            setLoading={setLoading}
          />
        </PermissionsContextProvider>
      </AccessControlContext.Provider>
    );
    const addWebIdButton = getByTestId(TESTCAFE_ADD_WEBID_BUTTON);
    userEvent.click(addWebIdButton);
    const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
    userEvent.type(input, webId);
    const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
    userEvent.click(addButton);
    await waitFor(() => {
      const agentWebId = getByText("Example");
      expect(agentWebId).not.toBeNull();
    });
  });

  it("opens a confirmation dialog with correct title and content", async () => {
    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });
    const { getByTestId, findByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <ConfirmationDialogProvider>
          <PermissionsContextProvider>
            <AgentPickerModal
              type="editors"
              text={{ editText: "Edit Editors", saveText: "Save Editors" }}
              onClose={onClose}
              setLoading={setLoading}
            />
          </PermissionsContextProvider>
        </ConfirmationDialogProvider>
      </AccessControlContext.Provider>
    );

    const webId = "https://somewebid.com";
    const addWebIdButton = getByTestId(TESTCAFE_ADD_WEBID_BUTTON);
    userEvent.click(addWebIdButton);

    const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
    userEvent.type(input, webId);
    const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
    userEvent.click(addButton);
    await waitFor(() => {
      expect(findByText(webId).resolves).not.toBeNull();
    });
    const submitWebIdsButton = getByTestId(TESTCAFE_SUBMIT_WEBIDS_BUTTON);
    userEvent.click(submitWebIdsButton);
    await waitFor(() => {
      const dialog = getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
      expect(dialog).toBeInTheDocument();
      expect(
        getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
      ).toHaveTextContent("Change permissions for 1 person");
    });
  });

  it("renders a warning when trying to submit a webId that is already in the policy", async () => {
    const webId = "https://example4.com/profile/card#me";
    const { getByTestId, findByText, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <PermissionsContextProvider>
          <AgentPickerModal
            type="editors"
            text={{ editText: "Edit Editors", saveText: "Save Editors" }}
            onClose={onClose}
            setLoading={setLoading}
          />
        </PermissionsContextProvider>
      </AccessControlContext.Provider>
    );

    const addWebIdButton = getByTestId(TESTCAFE_ADD_WEBID_BUTTON);
    userEvent.click(addWebIdButton);
    const input = await findByTestId(TESTCAFE_ID_WEBID_INPUT);
    userEvent.type(input, webId);
    const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
    userEvent.click(addButton);

    await waitFor(() => {
      const submitWebIdsButton = getByTestId(TESTCAFE_SUBMIT_WEBIDS_BUTTON);
      userEvent.click(submitWebIdsButton);
      expect(findByText("That WebID has already been added")).not.toBeNull();
    });
  });
  it("confirms without dialog if webIds to be added are only public and/or authenticated agents", async () => {
    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });

    const { getByTestId, getAllByRole, queryByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <ConfirmationDialogProvider>
          <AccessControlContext.Provider value={{ accessControl }}>
            <AgentPickerModal
              type="editors"
              text={{ editText: "Edit Editors", saveText: "Save Editors" }}
              onClose={onClose}
              setLoading={setLoading}
            />
          </AccessControlContext.Provider>
        </ConfirmationDialogProvider>
      </PermissionsContextProvider>
    );
    await waitFor(() => {
      const checkBoxes = getAllByRole("checkbox");
      userEvent.click(checkBoxes[0]);
    });
    const submitWebIdsButton = getByTestId(TESTCAFE_SUBMIT_WEBIDS_BUTTON);

    userEvent.click(submitWebIdsButton);
    await waitFor(() => {
      expect(
        queryByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)
      ).not.toBeInTheDocument();
    });
  });

  it("updates the temporary row with webId only when profile is unavailable", async () => {
    const webId = "https://somewebid.com";
    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValue({ error: "error" });

    const { getByTestId, getByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <PermissionsContextProvider>
          <AgentPickerModal
            type="editors"
            text={{ editText: "Edit Editors", saveText: "Save Editors" }}
            onClose={onClose}
            setLoading={setLoading}
          />
        </PermissionsContextProvider>
      </AccessControlContext.Provider>
    );
    const addWebIdButton = getByTestId(TESTCAFE_ADD_WEBID_BUTTON);
    userEvent.click(addWebIdButton);
    const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
    userEvent.type(input, webId);
    const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
    userEvent.click(addButton);

    await waitFor(() => {
      const agentWebId = getByText(webId);
      expect(agentWebId).not.toBeNull();
    });
  });

  it("cannot uncheck checkbox for the agent being added", async () => {
    const { getByTestId, getAllByRole } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessControlContext.Provider value={{ accessControl }}>
          <PermissionsContextProvider>
            <AgentPickerModal
              type="editors"
              text={{ editText: "Edit Editors", saveText: "Save Editors" }}
              onClose={onClose}
              setLoading={setLoading}
            />
          </PermissionsContextProvider>
        </AccessControlContext.Provider>
      </ConfirmationDialogProvider>
    );

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValueOnce({ error: "error" });
    const addWebIdButton = getByTestId(TESTCAFE_ADD_WEBID_BUTTON);
    userEvent.click(addWebIdButton);

    await waitFor(() => {
      const checkBoxes = getAllByRole("checkbox");
      expect(checkBoxes[0]).toBeChecked();
      userEvent.click(checkBoxes[0]);
      expect(checkBoxes[0]).toBeChecked();
    });
  });

  it("renders the correct confirmation message for more than 1 agent", async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessControlContext.Provider value={{ accessControl }}>
          <PermissionsContextProvider>
            <AgentPickerModal
              type="editors"
              text={{ editText: "Edit Editors", saveText: "Save Editors" }}
              onClose={onClose}
              setLoading={setLoading}
            />
          </PermissionsContextProvider>
        </AccessControlContext.Provider>
      </ConfirmationDialogProvider>
    );

    const webId1 = "https://somewebid.com";
    const webId2 = "https://someotherwebid.com";

    jest
      .spyOn(ProfileFns, "fetchProfile")
      .mockRejectedValue({ error: "error" });

    const addWebIdButton = getByTestId(TESTCAFE_ADD_WEBID_BUTTON);

    userEvent.click(addWebIdButton);
    const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
    userEvent.type(input, webId1);
    const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
    userEvent.click(addButton);
    await waitFor(() => {
      const agentWebId1 = getByText(webId1);
      expect(agentWebId1).not.toBeNull();
      expect(addWebIdButton).not.toBeDisabled();
    });
    userEvent.click(addWebIdButton);
    const input2 = getByTestId(TESTCAFE_ID_WEBID_INPUT);
    userEvent.type(input2, webId2);
    const addButton2 = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
    userEvent.click(addButton2);
    await waitFor(() => {
      const agentWebId2 = getByText(webId2);
      expect(agentWebId2).not.toBeNull();
    });
    const submitWebIdsButton = getByTestId(TESTCAFE_SUBMIT_WEBIDS_BUTTON);
    userEvent.click(submitWebIdsButton);
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent("Change permissions for 2 people");
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
    ).toHaveTextContent(
      "Continuing will change 2 people permissions to Edit Editors"
    );
  });
});

describe("AgentPickerModal with contacts", () => {
  const onClose = jest.fn();
  it("renders a table with the available contacts, Anyone and Anyone signed in", async () => {
    mockedUseAddressBook.mockReturnValue({ data: mockAddressBook() });
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
    const { asFragment, queryAllByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <AgentPickerModal
          type="editors"
          text={{ editText: "Edit Editors", saveText: "Save Editors" }}
          onClose={onClose}
        />
      </PermissionsContextProvider>
    );
    await waitFor(() => {
      expect(queryAllByTestId("agent-webid")).toHaveLength(4);
    });
    expect(asFragment()).toMatchSnapshot();
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

    const {
      getByTestId,
      queryAllByTestId,
      findByText,
      queryByText,
    } = renderWithTheme(
      <PermissionsContextProvider>
        <AgentPickerModal
          type="editors"
          text={{ editText: "Edit Editors", saveText: "Save Editors" }}
          onClose={onClose}
        />
      </PermissionsContextProvider>
    );
    const searchBar = getByTestId(TESTCAFE_ID_SEARCH_INPUT);

    userEvent.type(searchBar, "Example 1");

    waitFor(() => {
      expect(queryAllByTestId("agent-webid")).toHaveLength(1);
      expect(findByText("Example 1")).not.toBeNull();
      expect(queryByText("Example 2")).toBeNull();
      userEvent.clear(searchBar);
      expect(queryAllByTestId("agent-webid")).toHaveLength(5);
    });
  });
  // TODO: the tabs have slightly changed so these tests need to be updated when the agent tabs are restored
  it.skip("clicking the tabs filters by person or group contact", () => {
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
    // FIXME: change these test ids
    const peopleTab = getByTestId("tab-people");
    const groupsTab = getByTestId("tab-groups");
    userEvent.click(peopleTab);
    expect(queryAllByTestId("agent-webid")).toHaveLength(2);
    userEvent.click(groupsTab);
    // TODO: we will call this testid differently when we have groups
    expect(queryAllByTestId("agent-webid")).toHaveLength(1);
  });
  it.skip("clicking on group tab with no results renders correct empty state text", () => {
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
    // FIXME: change these test id
    const groupsTab = getByTestId("tab-groups");
    userEvent.click(groupsTab);
    // TODO: we will call this testid differently when we have groups
    expect(queryAllByTestId("agent-webid")).toHaveLength(0);
    expect(queryByText("No groups found")).not.toBeNull();
  });
  it.skip("clicking on people tab with no results renders correct empty state text", () => {
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
    // FIXME: change these test id
    const peopleTab = getByTestId("tab-people");
    userEvent.click(peopleTab);
    // TODO: we will call this testid differently when we have groups
    expect(queryAllByTestId("agent-webid")).toHaveLength(0);
    expect(queryByText("No people found")).not.toBeNull();
  });
});
