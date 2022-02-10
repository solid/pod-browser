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
import ContactsDrawer from "./index";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT,
} from "../../confirmationDialog";
import { ConfirmationDialogProvider } from "../../../src/contexts/confirmationDialogContext";

describe("ContactsDrawer", () => {
  const onClose = () => {};
  const onDelete = () => {};
  const selectedContactName = "Alice";
  const profileIri = "https://example.com/profile#alice";

  it("renders", () => {
    const renderResult = renderWithTheme(
      <ContactsDrawer
        open
        onClose={onClose}
        onDelete={onDelete}
        selectedContactName={selectedContactName}
        profileIri={profileIri}
      />
    );
    expect(renderResult.asFragment()).toMatchSnapshot();
  });
});

describe("Delete contact button confirmation dialog", () => {
  const testWebId = "testWebId";
  const onClose = () => {};
  const onDelete = () => {};
  const profileIri = "https://example.com/profile#alice";

  test("the delete confirmation shows webId if no name is available", async () => {
    const selectedContactName = null;
    const { findByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ContactsDrawer
          open
          onClose={onClose}
          onDelete={onDelete}
          selectedContactName={selectedContactName}
          selectedContactWebId={testWebId}
          profileIri={profileIri}
        />
      </ConfirmationDialogProvider>
    );
    const deleteButton = await findByTestId("delete-button");
    userEvent.click(deleteButton);
    const dialog = await findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    const dialogText = await findByTestId(
      TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT
    );

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
      expect(dialogText).toBeInTheDocument();
      expect(dialogText).toHaveTextContent("testWebId");
    });
  });

  test("it shows name if name is available", async () => {
    const selectedContactName = "Alice";
    const { findByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ContactsDrawer
          open
          onClose={onClose}
          onDelete={onDelete}
          selectedContactName={selectedContactName}
          selectedContactWebId={testWebId}
          profileIri={profileIri}
        />
      </ConfirmationDialogProvider>
    );
    const deleteButton = await findByTestId("delete-button");
    userEvent.click(deleteButton);
    const dialog = await findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    const dialogText = await findByTestId(
      TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT
    );

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
      expect(dialogText).toBeInTheDocument();
      expect(dialogText).toHaveTextContent("Alice");
    });
  });
});
