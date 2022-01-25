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

import React, { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import { CombinedDataProvider } from "@inrupt/solid-ui-react";
import * as solidClientFns from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import {
  aliceWebIdUrl,
  mockPersonDatasetAlice,
} from "../../../__testUtils/mockPersonResource";
import ConfirmationDialogContext from "../../../src/contexts/confirmationDialogContext";

import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import PersonAvatar, {
  setupErrorComponent,
  TESTCAFE_ID_UPLOAD_IMAGE,
  TESTCAFE_ID_REMOVE_IMAGE,
  confirmationDialogTitle,
  openDeleteConfirmationDialogWrapper,
  deletePhotoFunction,
} from "./index";
import mockConfirmationDialogContextProvider from "../../../__testUtils/mockConfirmationDialogContextProvider";
import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
} from "../../confirmationDialog";

const profileIri = "https://example.com/profile/card#me";

describe("Person Avatar", () => {
  const profileDataset = mockPersonDatasetAlice();
  const profileThing = solidClientFns.getThing(profileDataset, aliceWebIdUrl);

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(profileDataset);
    jest.spyOn(solidClientFns, "getThing").mockReturnValue(profileThing);
  });

  test("renders a person avatar", async () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { asFragment, getByText } = renderWithTheme(
      <CombinedDataProvider solidDataset={profileDataset} thing={profileThing}>
        <SessionProvider>
          <PersonAvatar profileIri={profileIri} />
        </SessionProvider>
      </CombinedDataProvider>
    );
    await waitFor(() => {
      expect(getByText("Alice")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders an upload/change button ", async () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);

    const { getByTestId } = renderWithTheme(
      <CombinedDataProvider solidDataset={profileDataset} thing={profileThing}>
        <SessionProvider>
          <PersonAvatar profileIri={profileIri} />
        </SessionProvider>
      </CombinedDataProvider>
    );
    const button = getByTestId(TESTCAFE_ID_UPLOAD_IMAGE);
    expect(button).toBeInTheDocument();
  });

  test("renders a confirmation dialog when delete pressed", async () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { getByTestId } = renderWithTheme(
      <CombinedDataProvider solidDataset={profileDataset} thing={profileThing}>
        <SessionProvider>
          <PersonAvatar profileIri={profileIri} />
        </SessionProvider>
      </CombinedDataProvider>
    );

    const button = await screen.findByTestId(TESTCAFE_ID_REMOVE_IMAGE);
    await waitFor(() => {
      expect(button).toBeInTheDocument();
    });
    userEvent.click(button);

    const confirmationDialog = await screen.findByTestId(
      TESTCAFE_ID_CONFIRMATION_DIALOG
    );
    await waitFor(() => {
      expect(confirmationDialog).toBeInTheDocument();
    });

    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent(confirmationDialogTitle);
  });

  // change this to be more about user interaction
  test("confirmation dialog changes state as expected", async () => {
    const button = await screen.findByTestId(TESTCAFE_ID_REMOVE_IMAGE);
    await waitFor(() => {
      expect(button).toBeInTheDocument();
    });
    userEvent.click(button);
    // act(() => {
    //   openDeleteConfirmationDialogWrapper(mockDeleteFunc);
    // });
    // expect(PersonAvatar.title).toBe(confirmationDialogTitle);
    // expect(mockConfirmationDialog.open).toBeTruthy();
    // expect(deletePhotoFunction).toBe(mockDeleteFunc);
  });

  test("closes confirmation dialog when user clicks button", async () => {
    const mockDeleteFunc = jest.fn();
    const mockCloseDialog = jest.fn();
    const mockConfirmationDialog = mockConfirmationDialogContextProvider({
      closeDialog: mockCloseDialog,
    });
    act(() => {
      openDeleteConfirmationDialogWrapper(mockDeleteFunc);
    });
    expect(mockConfirmationDialog.closeDialog).toHaveBeenCalled();
  });
});

describe("setupErrorComponent", () => {
  it("renders", () => {
    const bem = (value) => value;
    const { asFragment } = render(setupErrorComponent(bem)());
    expect(asFragment()).toMatchSnapshot();
  });
});
