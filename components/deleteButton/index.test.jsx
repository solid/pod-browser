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

import DeleteButton, {
  TESTCAFE_ID_DELETE_BUTTON,
  handleDeleteResource,
} from "./index";
import { renderWithTheme } from "../../__testUtils/withTheme";
import { ConfirmationDialogProvider } from "../../src/contexts/confirmationDialogContext";
import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
  TESTCAFE_ID_CONFIRM_BUTTON,
} from "../confirmationDialog";

jest.mock("@inrupt/solid-client");

const confirmationTitle = "confirmationTitle";
const confirmationContent = "confirmationContent";
const dialogId = "dialogId";
const successMessage = "successMessage";

describe("Delete button", () => {
  test("it renders a delete button", () => {
    const { asFragment } = renderWithTheme(
      <DeleteButton
        onDelete={jest.fn()}
        confirmationTitle={confirmationTitle}
        confirmationContent={confirmationContent}
        dialogId={dialogId}
        successMessage={successMessage}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  test("clicking on delete button opens a confirmation dialog with the correct title and content", () => {
    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <DeleteButton
          onDelete={jest.fn()}
          confirmationTitle={confirmationTitle}
          confirmationContent={confirmationContent}
          dialogId={dialogId}
          successMessage={successMessage}
        />
      </ConfirmationDialogProvider>
    );
    const deletebutton = getByTestId(TESTCAFE_ID_DELETE_BUTTON);
    userEvent.click(deletebutton);
    const dialog = getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent(confirmationTitle);
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
    ).toHaveTextContent(confirmationContent);
  });
  test("if confirmation dialog is confirmed, it deletes the resource", () => {
    const onDelete = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <DeleteButton
          onDelete={onDelete}
          confirmationTitle={confirmationTitle}
          confirmationContent={confirmationContent}
          dialogId={dialogId}
          successMessage={successMessage}
        />
      </ConfirmationDialogProvider>
    );
    const deletebutton = getByTestId(TESTCAFE_ID_DELETE_BUTTON);
    userEvent.click(deletebutton);
    const confirmButton = getByTestId(TESTCAFE_ID_CONFIRM_BUTTON);
    userEvent.click(confirmButton);
    expect(onDelete).toHaveBeenCalled();
  });
});

describe("handleDeleteResource", () => {
  test("it returns a handler that calls the given onDelete", async () => {
    const onDelete = jest.fn();
    const onDeleteError = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleDeleteResource({
      onDelete,
      onDeleteError,
      setAlertOpen,
      setMessage,
      setSeverity,
      successMessage,
    });

    await handler();

    expect(onDelete).toHaveBeenCalled();
  });

  test("it returns a handler that shows an alert if successful", async () => {
    const onDelete = jest.fn();
    const onDeleteError = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleDeleteResource({
      onDelete,
      onDeleteError,
      setAlertOpen,
      setMessage,
      setSeverity,
      successMessage,
    });

    await handler();

    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalledWith(successMessage);
    expect(setAlertOpen).toHaveBeenCalledWith(true);
  });

  test("it returns a handler that calls onError if not successful", async () => {
    const error = new Error("boom");
    const onDelete = jest.fn(() => {
      throw error;
    });
    const onDeleteError = jest.fn();
    const setAlertOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const handler = handleDeleteResource({
      onDelete,
      onDeleteError,
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    await handler();
    expect(onDeleteError).toHaveBeenCalledWith(error);
  });
});
