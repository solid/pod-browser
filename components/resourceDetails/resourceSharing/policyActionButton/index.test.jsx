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
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/dom";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import ConfirmationDialogContext from "../../../../src/contexts/confirmationDialogContext";
import PolicyActionButton, {
  handleConfirmation,
  handleRemoveAllAgents,
  TESTCAFE_ID_REMOVE_POLICY_BUTTON,
  TEXT_POLICY_ACTION_BUTTON_DISABLED_REMOVE_BUTTON,
} from "./index";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../src/models/contact/authenticated";
import mockAccessControl from "../../../../__testUtils/mockAccessControl";

import { PUBLIC_AGENT_PREDICATE } from "../../../../src/models/contact/public";

describe("PolicyActionButton", () => {
  const permissionsEmpty = [];
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
  ];
  const setLoading = jest.fn();
  const type = "editors";
  it("renders an action button that displays a menu with a disabled 'remove all' option when there are no permissions", () => {
    const { asFragment, getByTestId, getByText } = renderWithTheme(
      <PolicyActionButton
        type={type}
        permissions={permissionsEmpty}
        setLoading={setLoading}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    const button = getByTestId(TESTCAFE_ID_REMOVE_POLICY_BUTTON);
    expect(button).toBeDisabled();
    const text = getByText(TEXT_POLICY_ACTION_BUTTON_DISABLED_REMOVE_BUTTON);
    expect(text).not.toBeNull();
  });
  it("renders an action button that displays a menu with a 'remove all' option when there are permissions", () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <PolicyActionButton
        type={type}
        permissions={permissions}
        setLoading={setLoading}
      />
    );
    const button = getByTestId(TESTCAFE_ID_REMOVE_POLICY_BUTTON);
    expect(button).not.toBeDisabled();
    const text = queryByText(TEXT_POLICY_ACTION_BUTTON_DISABLED_REMOVE_BUTTON);
    expect(text).toBeNull();
  });
  it("renders an error if policy type is not recognized", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <PolicyActionButton
        type="examplePolicy"
        permissions={permissionsEmpty}
        setLoading={setLoading}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    const error = getByTestId("error-message");
    expect(error).not.toBeNull();
  });
  it("opens a confirmation dialog", async () => {
    const setOpen = jest.fn();
    const setTitle = jest.fn();
    const setContent = jest.fn();

    const contextValue = {
      confirmed: false,
      content: null,
      open: false,
      setConfirmed: jest.fn(),
      setContent,
      setOpen,
      setTitle,
      title: "Confirmation",
    };

    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogContext.Provider value={contextValue}>
        <PolicyActionButton
          type={type}
          permissions={permissions}
          setLoading={setLoading}
        />
      </ConfirmationDialogContext.Provider>
    );

    const button = getByTestId(TESTCAFE_ID_REMOVE_POLICY_BUTTON);
    userEvent.click(button);
    expect(setTitle).toHaveBeenCalledWith(
      "Remove Editors access from this resource?"
    );
    expect(setContent).toHaveBeenCalledWith(
      "Everyone will be removed from the Editors list."
    );
    expect(setOpen).toHaveBeenCalledWith("remove-policy");
  });
});

describe("handleConfirmation", () => {
  const dialogId = "dialogId";
  const setOpen = jest.fn();
  const removeAllAgents = jest.fn();
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
    removeAllAgents,
  });
  it("returns a handler that exits when user starts confirmation but hasn't selected an option", () => {
    handler(true, null);

    expect(removeAllAgents).not.toHaveBeenCalled();
  });

  it("returns a handler which calls a function that submits the webIds when user confirms dialog", () => {
    handler(true, true);

    expect(removeAllAgents).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
    expect(setTitle).toHaveBeenCalledWith(null);
    expect(setContent).toHaveBeenCalledWith(null);
  });
  it("returns a handler that exits when user cancels the operation", () => {
    handler(true, false);

    expect(setOpen).toHaveBeenCalledWith(null);
    expect(removeAllAgents).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
  });
});

describe("handleRemoveAllAgents", () => {
  const webId1 = "https://example.org";
  const webId2 = "https://example2.org";
  const setLoading = jest.fn();
  const accessControl = mockAccessControl();
  const mutateResourceInfo = jest.fn();
  const saveAgentToContacts = jest.fn();

  it("returns a handler that removes the webIds", async () => {
    const policyName = "editors";
    const handler = handleRemoveAllAgents({
      webIds: [webId1, webId2],
      setLoading,
      accessControl,
      policyToDelete: policyName,
      mutateResourceInfo,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        webId1,
        policyName
      );
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        webId2,
        policyName
      );
    });

    expect(mutateResourceInfo).toHaveBeenCalled();
  });

  it("calls the corresponding custom policy function when the policy is a custom policy", async () => {
    const policyName = "viewAndAdd";
    const handler = handleRemoveAllAgents({
      webIds: [webId1, webId2],
      setLoading,
      accessControl,
      policyToDelete: policyName,
      mutateResourceInfo,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        webId1,
        policyName
      );
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        webId2,
        policyName
      );
    });
    expect(mutateResourceInfo).toHaveBeenCalled();
  });

  it("when webId is public agent url, it calls the corresponding setRulePublic with the correct value", async () => {
    const policyName = "editors";
    const handler = handleRemoveAllAgents({
      webIds: [PUBLIC_AGENT_PREDICATE],
      setLoading,
      accessControl,
      policyToDelete: policyName,
      mutateResourceInfo,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.setRulePublic).toHaveBeenCalledWith(
        policyName,
        false
      );
    });

    expect(saveAgentToContacts).not.toHaveBeenCalledWith();
    expect(mutateResourceInfo).toHaveBeenCalled();
  });

  it("when webId is authenticated agent url, it calls the corresponding setRuleAuthenticated with the correct value", async () => {
    const policyName = "editors";
    const handler = handleRemoveAllAgents({
      webIds: [AUTHENTICATED_AGENT_PREDICATE],
      setLoading,
      accessControl,
      policyToDelete: policyName,
      mutateResourceInfo,
    });
    handler();

    await waitFor(() => {
      expect(accessControl.setRuleAuthenticated).toHaveBeenCalledWith(
        policyName,
        false
      );
    });

    expect(saveAgentToContacts).not.toHaveBeenCalledWith();
    expect(mutateResourceInfo).toHaveBeenCalled();
  });
});
