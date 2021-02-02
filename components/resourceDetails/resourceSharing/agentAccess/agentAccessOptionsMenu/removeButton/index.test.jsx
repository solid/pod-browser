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
import { renderWithTheme } from "../../../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../../../__testUtils/mockAccessControl";

import RemoveButton, {
  handleConfirmation,
  handleRemovePermissions,
} from "./index";

const resourceIri = "/iri/";
const webId = "https://example.com/profile/card#me";
const profile = {
  avatar: null,
  name: "Example Agent",
  webId,
};
const permission = { webId, profile, alias: "editors" };

describe("AgentAccessOptionsMenu", () => {
  test("it renders a button which triggers the opening of the menu", () => {
    const { asFragment } = renderWithTheme(
      <RemoveButton
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
        mutatePermissions={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
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

  const handler = handleConfirmation({
    open,
    dialogId,
    setConfirmationSetup,
    setOpen,
    setConfirmed,
    handleRemoveAgent,
  });

  test("it returns a handler that submits the webIds when user confirms dialog", () => {
    handler(webId, policyName, true, true);

    expect(handleRemoveAgent).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
  });
  test("it returns a handler that exits when user cancels the operation", () => {
    handler(webId, policyName, true, false);

    expect(setOpen).toHaveBeenCalledWith(null);
    expect(handleRemoveAgent).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
  });
  test("it returns a handler that exits when user starts confirmation but hasn't selected an option", () => {
    handler(webId, policyName, true, null);

    expect(handleRemoveAgent).not.toHaveBeenCalled();
  });
});

describe("handleRemovePermissions", () => {
  const setLoading = jest.fn();
  const accessControl = mockAccessControl();
  const mutatePermissions = jest.fn();
  const setLocalAccess = jest.fn();
  const policyName = "editors";

  const handler = handleRemovePermissions({
    setLoading,
    accessControl,
    mutatePermissions,
    setLocalAccess,
  });

  test("it returns a handler that removes the agent", async () => {
    handler(webId, policyName);

    expect(setLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(accessControl.removeAgentFromNamedPolicy).toHaveBeenCalledWith(
        webId,
        policyName
      );
    });
    expect(mutatePermissions).toHaveBeenCalled();
    expect(setLocalAccess).toHaveBeenCalledWith(null);
  });
});
