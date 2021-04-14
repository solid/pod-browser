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
import userEvent from "@testing-library/user-event";
// eslint-disable-next-line camelcase
import { acp_v2 } from "@inrupt/solid-client";
import { renderWithTheme } from "../../../../../../__testUtils/withTheme";
import mockConfirmationDialogContextProvider from "../../../../../../__testUtils/mockConfirmationDialogContextProvider";
import mockAccessControl from "../../../../../../__testUtils/mockAccessControl";
import RemoveButton, {
  handleConfirmation,
  handleRemovePermissions,
} from "./index";
import { PUBLIC_AGENT_PREDICATE } from "../../../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../../../src/models/contact/authenticated";

const resourceIri = "/iri/";
const resourceUrl = "http://example.com/resource";
const webId = "https://example.com/profile/card#me";
const name = "Example Agent";
const profile = {
  avatar: null,
  name,
  webId,
};
const permission = { webId, alias: "editors" };

describe("AgentAccessOptionsMenu", () => {
  test("it renders a button which triggers the opening of the menu", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <RemoveButton
        resourceIri={resourceIri}
        permission={permission}
        profile={profile}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    const button = getByTestId("remove-button");
    expect(button).toBeDefined();
  });
  test("clicking on delete button calls setOpen with the correct id and setTitle with agent's name", () => {
    const setOpen = jest.fn();
    const setTitle = jest.fn();
    const ConfirmationDialogProvider = mockConfirmationDialogContextProvider({
      open: "remove-agent",
      setOpen,
      setTitle,
      setContent: jest.fn(),
      confirmed: null,
    });
    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <RemoveButton
          resourceIri={resourceIri}
          permission={permission}
          profile={profile}
          setLoading={jest.fn()}
          setLocalAccess={jest.fn()}
        />
      </ConfirmationDialogProvider>
    );
    const button = getByTestId("remove-button");
    userEvent.click(button);
    expect(setTitle).toHaveBeenCalledWith(`Remove ${name}'s access from iri`);
    expect(setOpen).toHaveBeenCalledWith("remove-agent");
  });
  test("if no profile is available, setTitle is called with agent's webId", () => {
    const setOpen = jest.fn();
    const setTitle = jest.fn();
    const ConfirmationDialogProvider = mockConfirmationDialogContextProvider({
      open: "remove-agent",
      setOpen,
      setTitle,
      setContent: jest.fn(),
      confirmed: null,
    });
    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <RemoveButton
          resourceIri={resourceIri}
          permission={permission}
          profile={null}
          setLoading={jest.fn()}
          setLocalAccess={jest.fn()}
        />
      </ConfirmationDialogProvider>
    );
    const button = getByTestId("remove-button");
    userEvent.click(button);
    expect(setTitle).toHaveBeenCalledWith(`Remove ${webId}'s access from iri`);
    expect(setOpen).toHaveBeenCalledWith("remove-agent");
  });
});
describe("handleConfirmation", () => {
  const dialogId = "dialogId";
  const setOpen = jest.fn();
  const handleRemoveAgent = jest.fn();
  const setConfirmed = jest.fn();
  const policyName = "editors";
  const setConfirmationSetup = jest.fn();
  const open = dialogId;
  const setConfirmText = jest.fn();

  const handler = handleConfirmation({
    open,
    dialogId,
    bypassDialog: false,
    setConfirmationSetup,
    setOpen,
    setConfirmed,
    handleRemoveAgent,
    setConfirmText,
  });

  test("it returns a handler that submits the webIds when user confirms dialog", () => {
    handler(webId, policyName, true, true);

    expect(handleRemoveAgent).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
    expect(setConfirmText).toHaveBeenCalledWith(null);
  });

  test("it returns a handler that submits the webIds of bypassDialog is true", () => {
    const bypassDialogHandle = handleConfirmation({
      open,
      dialogId,
      bypassDialog: true,
      setConfirmationSetup,
      setOpen,
      setConfirmed,
      handleRemoveAgent,
      setConfirmText,
    });
    bypassDialogHandle(webId, policyName, true, true);

    expect(handleRemoveAgent).toHaveBeenCalledWith(webId, policyName);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
    expect(setConfirmText).toHaveBeenCalledWith(null);
  });
  test("it returns a handler that exits when user cancels the operation", () => {
    handler(webId, policyName, true, false);

    expect(setOpen).toHaveBeenCalledWith(null);
    expect(handleRemoveAgent).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setConfirmText).toHaveBeenCalledWith(null);
  });
  test("it returns a handler that exits when user starts confirmation but hasn't selected an option", () => {
    handler(webId, policyName, true, null);

    expect(handleRemoveAgent).not.toHaveBeenCalled();
  });
});

describe("handleRemovePermissions", () => {
  const setLoading = jest.fn();
  const accessControl = mockAccessControl();
  const mutateResourceInfo = jest.fn();
  const setLocalAccess = jest.fn();
  const policyName = "editors";
  const acr = acp_v2.mockAcrFor(resourceUrl);

  const handler = handleRemovePermissions({
    setLoading,
    accessControl,
    mutateResourceInfo,
    setLocalAccess,
  });

  beforeEach(() => {
    accessControl.removeAgentFromPolicy.mockResolvedValue({ response: acr });
  });

  test("it returns a handler that removes the agent", async () => {
    handler(webId, policyName);

    expect(setLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        webId,
        policyName
      );
    });
    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(setLocalAccess).toHaveBeenCalledWith(null);
  });

  it("handles the public agent", async () => {
    handler(PUBLIC_AGENT_PREDICATE, policyName);

    expect(setLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        PUBLIC_AGENT_PREDICATE,
        policyName
      );
    });
    expect(accessControl.setRulePublic).toHaveBeenCalledWith(policyName, false);
    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(setLocalAccess).toHaveBeenCalledWith(null);
  });

  it("handles the authenticated agent", async () => {
    handler(AUTHENTICATED_AGENT_PREDICATE, policyName);

    expect(setLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        AUTHENTICATED_AGENT_PREDICATE,
        policyName
      );
    });
    expect(accessControl.setRuleAuthenticated).toHaveBeenCalledWith(
      policyName,
      false
    );
    expect(mutateResourceInfo).toHaveBeenCalledWith(acr, false);
    expect(setLocalAccess).toHaveBeenCalledWith(null);
  });
});
