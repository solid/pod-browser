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
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockConsentRequestContext from "../../__testUtils/mockConsentRequestContext";
import ConsentRequestForm, {
  TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON,
} from "./index";
import { TESTCAFE_ID_CONFIRMATION_DIALOG } from "../confirmationDialog";
import { ConfirmationDialogProvider } from "../../src/contexts/confirmationDialogContext";

const ConsentRequestContextProvider = mockConsentRequestContext();

describe("Consent Request Form", () => {
  test("Renders a consent request form", () => {
    const { asFragment } = renderWithTheme(
      <ConsentRequestContextProvider>
        <ConsentRequestForm />
      </ConsentRequestContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
  test("when submitting form without selecting access, it displays a confirmation dialog", () => {
    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentRequestContextProvider>
          <ConsentRequestForm />
        </ConsentRequestContextProvider>
      </ConfirmationDialogProvider>
    );
    const button = getByTestId(TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON);
    userEvent.click(button);
    const dialog = getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
  });
  test("does not display confirmation dialog if at least one access is selected", async () => {
    const { getByTestId, getAllByRole, findByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentRequestContextProvider>
          <ConsentRequestForm />
        </ConsentRequestContextProvider>
      </ConfirmationDialogProvider>
    );
    const toggle = getAllByRole("checkbox")[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON);
    userEvent.click(button);
    await expect(findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).rejects.toEqual(
      expect.anything()
    );
  });
});
