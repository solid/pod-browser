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
import * as solidClientFns from "@inrupt/solid-client";
import { renderWithTheme } from "../../../../../../__testUtils/withTheme";
import ConsentDetailsButton, { TESTCAFE_ID_VIEW_DETAILS_BUTTON } from "./index";
import {
  aliceWebIdUrl,
  mockPersonDatasetAlice,
} from "../../../../../../__testUtils/mockPersonResource";
import getSignedVc from "../../../../../../__testUtils/mockSignedVc";
import { ConfirmationDialogProvider } from "../../../../../../src/contexts/confirmationDialogContext";
import ConfirmationDialog, {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
} from "../../../../../confirmationDialog";

const webId = "https://example.com/profile/card#me";

const permission = {
  webId,
  alias: "Editors",
  type: "agent",
  vc: getSignedVc(),
};

describe("View consent details button and modal", () => {
  const profileDataset = mockPersonDatasetAlice();
  const profileThing = solidClientFns.getThing(profileDataset, aliceWebIdUrl);
  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(profileDataset);
    jest.spyOn(solidClientFns, "getThing").mockReturnValue(profileThing);
    jest.spyOn(solidClientFns, "getUrl").mockReturnValue("schema.Person");
  });

  test("it renders a button which triggers the opening of the modal", async () => {
    const { baseElement, getByTestId } = renderWithTheme(
      <ConsentDetailsButton permission={permission} />
    );
    expect(baseElement).toMatchSnapshot();
    const button = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
    expect(button).toBeDefined();
  });
  test("clicking on view details button renders a confirmation dialog with the correct data", async () => {
    const { baseElement, getByTestId, findByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentDetailsButton permission={permission} />
        <ConfirmationDialog />
      </ConfirmationDialogProvider>
    );
    const button = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
    userEvent.click(button);
    const dialog = await findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });
});
