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
import * as SolidClientFns from "@inrupt/solid-client";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../../__testUtils/mockAccessControl";
import ResourceDrawer from "./index";
import useAccessControl from "../../../../../src/hooks/useAccessControl";
import { getAccessControl } from "../../../../../src/accessControl";
import ConfirmationDialog, {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRM_BUTTON,
} from "../../../../confirmationDialog";
import mockSession from "../../../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../../../__testUtils/mockSessionContextProvider";
import { TESTCAFE_ID_REVOKE_ACCESS_BUTTON } from "../revokeAccessButton";

jest.mock("../../../../../src/hooks/useAccessControl");
const mockedUseAccessControl = useAccessControl;
jest.mock("../../../../../src/accessControl");
const mockedGetAccessControl = getAccessControl;

const webId = "https://example.com/profile/card#me";
const resourceIri = "https://example.com/resource/";
const session = mockSession();
const SessionProvider = mockSessionContextProvider(session);
const mockResource = SolidClientFns.mockSolidDatasetFrom(resourceIri);

describe("ResourceDrawer", () => {
  const data = mockAccessControl();
  const error = "Test Error";
  const isValidating = false;
  beforeEach(() => {
    mockedUseAccessControl.mockReturnValue({ data, error, isValidating });
    mockedGetAccessControl.mockResolvedValue(data);
    jest
      .spyOn(SolidClientFns, "getResourceInfo")
      .mockResolvedValue(mockResource);
  });

  it("displays confirmation dialog when clicking the remove access button ", async () => {
    const onClose = jest.fn();
    const accessListEditors = [
      {
        agent: webId,
        allow: [
          "http://www.w3.org/ns/solid/acp#Read",
          "http://www.w3.org/ns/solid/acp#Write",
        ],
        deny: [],
        resource: resourceIri,
      },
    ];
    const { getByTestId } = renderWithTheme(
      <>
        <ResourceDrawer
          open
          onClose={onClose}
          accessList={accessListEditors}
          resourceIri={resourceIri}
        />
        <ConfirmationDialog />
      </>
    );
    const button = getByTestId(TESTCAFE_ID_REVOKE_ACCESS_BUTTON);
    userEvent.click(button);
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).toBeInTheDocument();
    });
  });

  it("calls the remove access function with the corrects values and closes the drawer on confirmation", async () => {
    const onClose = jest.fn();
    const accessListEditors = [
      {
        agent: webId,
        allow: [
          "http://www.w3.org/ns/solid/acp#Read",
          "http://www.w3.org/ns/solid/acp#Write",
        ],
        deny: [],
        resource: resourceIri,
      },
    ];
    const { getByTestId, findByTestId } = renderWithTheme(
      <SessionProvider>
        <ResourceDrawer
          open
          onClose={onClose}
          accessList={accessListEditors}
          resourceIri={resourceIri}
        />
        <ConfirmationDialog />
      </SessionProvider>
    );
    const button = getByTestId(TESTCAFE_ID_REVOKE_ACCESS_BUTTON);
    userEvent.click(button);
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).toBeInTheDocument();
    });
    const confirmationButton = await findByTestId(TESTCAFE_ID_CONFIRM_BUTTON);
    userEvent.click(confirmationButton);
    await waitFor(() => {
      expect(data.removeAgentFromPolicy).toHaveBeenCalledWith(webId, "editors");
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("Renders the ResourceDrawer with correct title and access list", () => {
    const accessList = [
      {
        agent: webId,
        allow: [
          "http://www.w3.org/ns/solid/acp#Read",
          "http://www.w3.org/ns/solid/acp#Write",
          "http://www.w3.org/ns/solid/acp#Append",
          "http://www.w3.org/ns/solid/acp#Control",
        ],
        deny: [],
        resource: resourceIri,
      },
    ];
    const onClose = jest.fn();
    const { asFragment } = renderWithTheme(
      <ResourceDrawer
        open
        onClose={onClose}
        accessList={accessList}
        resourceIri={resourceIri}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
