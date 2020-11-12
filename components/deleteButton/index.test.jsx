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
import { mount } from "enzyme";
import { mountToJson, WithTheme } from "../../__testUtils/mountWithTheme";
import defaultTheme from "../../src/theme";

import DeleteButton, {
  handleDeleteResource,
  handleConfirmation,
} from "./index";
import mockConfirmationDialogContextProvider from "../../__testUtils/mockConfirmationDialogContextProvider";

jest.mock("@inrupt/solid-client");

const confirmationTitle = "confirmationTitle";
const confirmationContent = "confirmationContent";
const dialogId = "dialogId";
const successMessage = "successMessage";

describe("Delete button", () => {
  test("it renders a delete button", () => {
    const tree = mountToJson(
      <DeleteButton
        onDelete={jest.fn()}
        confirmationTitle={confirmationTitle}
        confirmationContent={confirmationContent}
        dialogId={dialogId}
        successMessage={successMessage}
      />
    );
    expect(tree).toMatchSnapshot();
  });
  test("clicking on delete button calls setOpen with the correct id", () => {
    const setOpen = jest.fn();
    const ConfirmationDialogProvider = mockConfirmationDialogContextProvider({
      open: dialogId,
      setOpen,
      setTitle: jest.fn(),
      setContent: jest.fn(),
      confirmed: null,
    });
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <ConfirmationDialogProvider>
          <DeleteButton
            onDelete={jest.fn()}
            confirmationTitle={confirmationTitle}
            confirmationContent={confirmationContent}
            dialogId={dialogId}
            successMessage={successMessage}
          />
        </ConfirmationDialogProvider>
      </WithTheme>
    );
    const deletebutton = tree.find("button");
    deletebutton.simulate("click");
    expect(setOpen).toHaveBeenCalledWith(dialogId);
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
describe("handleConfirmation", () => {
  const setOpen = jest.fn();
  const deleteResource = jest.fn();
  const setConfirmed = jest.fn();
  const setTitle = jest.fn();
  const setContent = jest.fn();
  const setConfirmationSetup = jest.fn();
  const open = dialogId;

  const handler = handleConfirmation({
    dialogId,
    open,
    setOpen,
    setConfirmed,
    deleteResource,
    setTitle,
    setContent,
    setConfirmationSetup,
  });

  test("it returns a handler that deletes the file when user confirms dialog", async () => {
    await handler(true, true, confirmationTitle, confirmationContent);

    expect(setOpen).toHaveBeenCalledWith(null);
    expect(deleteResource).toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
    expect(setTitle).toHaveBeenCalledWith(confirmationTitle);
    expect(setContent).toHaveBeenCalledWith(<p>{confirmationContent}</p>);
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
  });
  test("it returns a handler that exits when user cancels the operation", async () => {
    await handler(true, false, confirmationTitle, confirmationContent);

    expect(deleteResource).not.toHaveBeenCalled();
    expect(setConfirmed).toHaveBeenCalledWith(null);
  });
  test("it returns a handler that exits when user starts confirmation but hasn't selected an option", async () => {
    await handler(true, null, confirmationTitle, confirmationContent);

    expect(deleteResource).not.toHaveBeenCalled();
    expect(setTitle).not.toHaveBeenCalled();
    expect(setContent).not.toHaveBeenCalled();
  });
});
