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
import ContactsDrawer from "./index";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import { waitFor } from "@testing-library/dom";
import { act, screen } from "@testing-library/react";

import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
  TESTCAFE_ID_CONFIRM_BUTTON,
  ConfirmationDialog,
} from "../confirmationDialog";
import userEvent from "@testing-library/user-event";

describe("ContactsDrawer", () => {
  const onClose = () => {};
  const onDelete = () => {};
  const selectedContactName = "Alice";
  const profileIri = "https://example.com/profile#alice";
  let renderResult;
  beforeEach(() => {
    renderResult = renderWithTheme(
      <ContactsDrawer
        open
        onClose={onClose}
        onDelete={onDelete}
        selectedContactName={selectedContactName}
        profileIri={profileIri}
      />
    );
  });
  it("renders", () => {
    expect(renderResult.asFragment()).toMatchSnapshot();
  });
});

describe("Delete contact button confirmation dialog", () => {
  const testWebId = "testWebId";
  let renderResult;
  const onClose = () => {};
  const onDelete = () => {};
  const selectedContactName = "Alice";
  const profileIri = "https://example.com/profile#alice";
  beforeEach(() => {
    renderResult = renderWithTheme(
      <ContactsDrawer
        open
        onClose={onClose}
        onDelete={onDelete}
        selectedContactName={selectedContactName}
        profileIri={profileIri}
      />
    );
  });

  test("the delete confirmation shows webId if no name is available", async () => {
    const testName = null;
    const deleteButton = await screen.findByTestId("delete-button");
    userEvent.click(deleteButton);
    const dialog = await screen.findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);

    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
      expect(
        dialog.getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
      ).toHaveTextContent("testWebId");
    });
  });

  // test("it shows name if name is available", () => {

  // });
});
