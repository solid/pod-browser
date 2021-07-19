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
import mockAccessControl from "../../../../../../__testUtils/mockAccessControl";
import RemoveButton, {
  handleRemovePermissions,
  TESTCAFE_ID_REMOVE_BUTTON,
} from "./index";
import { PUBLIC_AGENT_PREDICATE } from "../../../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../../../src/models/contact/authenticated";
import { ConfirmationDialogProvider } from "../../../../../../src/contexts/confirmationDialogContext";
import {
  TESTCAFE_ID_CONFIRM_BUTTON,
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
} from "../../../../../confirmationDialog";
import AccessControlContext from "../../../../../../src/contexts/accessControlContext";

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
  test("clicking on delete button renders a confirmation dialog with the correct title and message", async () => {
    const { getByTestId, findByTestId } = renderWithTheme(
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
    const button = getByTestId(TESTCAFE_ID_REMOVE_BUTTON);
    userEvent.click(button);
    const dialog = await findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent(`Remove ${name}'s access from iri`);
  });
  test("if no profile is available, confirmation dialog title is agent's webId", async () => {
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
    const button = getByTestId(TESTCAFE_ID_REMOVE_BUTTON);
    userEvent.click(button);
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent(`Remove ${webId}'s access from iri`);
  });
  test("if dialog is confirmed, it removes agent from permissions", async () => {
    const accessControl = mockAccessControl();
    const { getByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <ConfirmationDialogProvider>
          <RemoveButton
            resourceIri={resourceIri}
            permission={permission}
            profile={profile}
            setLoading={jest.fn()}
            setLocalAccess={jest.fn()}
          />
        </ConfirmationDialogProvider>
      </AccessControlContext.Provider>
    );
    const button = getByTestId(TESTCAFE_ID_REMOVE_BUTTON);
    userEvent.click(button);
    const confirmButton = getByTestId(TESTCAFE_ID_CONFIRM_BUTTON);
    userEvent.click(confirmButton);
    waitFor(() =>
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledWith(
        webId,
        "editors"
      )
    );
  });
  test("if agent is public agent or authenticated agent, it does not render a dialog and removes it from permissions", async () => {
    const accessControl = mockAccessControl();
    const { getByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <ConfirmationDialogProvider>
          <RemoveButton
            resourceIri={resourceIri}
            permission={{ webId: PUBLIC_AGENT_PREDICATE, alias: "editors" }}
            profile={null}
            setLoading={jest.fn()}
            setLocalAccess={jest.fn()}
          />
        </ConfirmationDialogProvider>
      </AccessControlContext.Provider>
    );
    const button = getByTestId(TESTCAFE_ID_REMOVE_BUTTON);
    userEvent.click(button);
    waitFor(() => {
      expect(
        getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)
      ).not.toBeInTheDocument();
      expect(accessControl.setRulePublic).toHaveBeenCalledWith(
        "editors",
        false
      );
    });
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
