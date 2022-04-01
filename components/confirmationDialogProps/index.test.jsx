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

import { act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ConfirmationDialogProps, {
  TESTCAFE_ID_CONFIRMATION_CANCEL_BUTTON,
  TESTCAFE_ID_CONFIRM_BUTTON,
} from "./index";

describe("ConfirmationDialog", () => {
  it("Renders a ConfirmationDialog", () => {
    const { asFragment } = renderWithTheme(<ConfirmationDialogProps />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls onConfirm when clicking on confirm button ", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProps
        openConfirmationDialog
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    const button = getByTestId(TESTCAFE_ID_CONFIRM_BUTTON);
    act(() => userEvent.click(button));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("displays default values when cancelText and confirmText are null", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { getByText } = renderWithTheme(
      <ConfirmationDialogProps
        openConfirmationDialog
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    const confirmButton = getByText("Confirm");
    expect(confirmButton).not.toBeNull();
    const cancelButton = getByText("Cancel");
    expect(cancelButton).not.toBeNull();
  });

  it("displays only confirm button when omitCancelButton is true", async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText, findByTestId } = renderWithTheme(
      <ConfirmationDialogProps
        openConfirmationDialog
        onConfirm={onConfirm}
        onCancel={onCancel}
        omitCancelButton
      />
    );
    const confirmButton = getByText("Confirm");
    expect(confirmButton).not.toBeNull();
    await expect(
      findByTestId(TESTCAFE_ID_CONFIRMATION_CANCEL_BUTTON)
    ).rejects.toEqual(expect.anything());
  });

  it("calls onCancel when clicking on cancel button", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { getByTestId } = renderWithTheme(
      <ConfirmationDialogProps
        openConfirmationDialog
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    const button = getByTestId(TESTCAFE_ID_CONFIRMATION_CANCEL_BUTTON);
    act(() => userEvent.click(button));
    expect(onCancel).toHaveBeenCalled();
  });
});
