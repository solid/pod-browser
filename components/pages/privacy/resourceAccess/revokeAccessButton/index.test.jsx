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
import * as SolidClientFns from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import RevokeAccessButton, { TESTCAFE_ID_REVOKE_ACCESS_BUTTON } from "./index";
import ConfirmationDialog, {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRM_BUTTON,
} from "../../../../confirmationDialog";
import { ConfirmationDialogProvider } from "../../../../../src/contexts/confirmationDialogContext";
import mockSession from "../../../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../../../__testUtils/mockSessionContextProvider";
import mockAccessControl from "../../../../../__testUtils/mockAccessControl";
import useAccessControl from "../../../../../src/hooks/useAccessControl";
import { getAccessControl } from "../../../../../src/accessControl";

jest.mock("../../../../../src/hooks/useAccessControl");
const mockedUseAccessControl = useAccessControl;
jest.mock("../../../../../src/accessControl");
const mockedGetAccessControl = getAccessControl;

describe("RevokeAccessButton", () => {
  const resourceIri = "https://example.org/resource.txt";
  const webId = "https://example.org/profile/card#me";
  const onClose = jest.fn();
  const accessList = [
    {
      agent: webId,
      allow: ["http://www.w3.org/ns/solid/acp#Read"],
      deny: [],
      resource: resourceIri,
    },
  ];

  const setShouldUpdate = jest.fn();
  test("it renders correct text for drawer button", async () => {
    const { asFragment, getByText } = renderWithTheme(
      <RevokeAccessButton
        variant="drawer"
        resources={[resourceIri]}
        onClose={onClose}
        accessList={accessList}
        setShouldUpdate={setShouldUpdate}
      />
    );
    await waitFor(() => {
      expect(getByText("Remove Access to resource.txt?")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });
  test("it renders correct text for in menu button", async () => {
    const { asFragment, getByText } = renderWithTheme(
      <RevokeAccessButton
        variant="in-menu"
        resources={[resourceIri]}
        onClose={onClose}
        accessList={accessList}
        setShouldUpdate={setShouldUpdate}
      />
    );
    await waitFor(() => {
      expect(getByText("Revoke access")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });
  test("it renders correct text for Revoke All Access button", async () => {
    const { asFragment, getByText } = renderWithTheme(
      <RevokeAccessButton
        variant="all-access"
        resources={[resourceIri, resourceIri]}
        onClose={onClose}
        accessList={accessList}
        setShouldUpdate={setShouldUpdate}
      />
    );
    await waitFor(() => {
      expect(getByText("Revoke All Access")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });
  test("it displays confirmation dialog on click", async () => {
    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <RevokeAccessButton
          variant="all-access"
          resources={[resourceIri, resourceIri]}
          onClose={onClose}
          accessList={accessList}
          setShouldUpdate={setShouldUpdate}
        />
        <ConfirmationDialog />
      </ConfirmationDialogProvider>
    );
    const button = getByTestId(TESTCAFE_ID_REVOKE_ACCESS_BUTTON);
    userEvent.click(button);
    await waitFor(() =>
      expect(getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).toBeInTheDocument()
    );
  });
  test("clicking confirm button calls remove access function", async () => {
    const resource = SolidClientFns.mockSolidDatasetFrom(resourceIri);
    const accessControl = mockAccessControl();
    mockedUseAccessControl.mockReturnValue({ accessControl });
    mockedGetAccessControl.mockResolvedValue(accessControl);
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    jest.spyOn(SolidClientFns, "getResourceInfo").mockResolvedValue(resource);
    const { getByTestId } = renderWithTheme(
      <SessionProvider>
        <ConfirmationDialogProvider>
          <RevokeAccessButton
            variant="all-access"
            resources={[resourceIri, resourceIri]}
            onClose={onClose}
            accessList={accessList}
            setShouldUpdate={setShouldUpdate}
          />
          <ConfirmationDialog />
        </ConfirmationDialogProvider>
      </SessionProvider>
    );
    const button = getByTestId(TESTCAFE_ID_REVOKE_ACCESS_BUTTON);
    userEvent.click(button);
    await waitFor(() =>
      expect(getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).toBeInTheDocument()
    );
    const confirmButton = getByTestId(TESTCAFE_ID_CONFIRM_BUTTON);
    userEvent.click(confirmButton);
    await waitFor(() => {
      expect(accessControl.removeAgentFromPolicy).toHaveBeenCalledTimes(2);
    });
  });
});
