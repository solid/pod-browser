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
import { act } from "react-dom/test-utils";
import { waitFor, screen } from "@testing-library/dom";
import { revokeAccessGrant } from "@inrupt/solid-client-access-grants";
import { renderWithTheme } from "../../../../../../__testUtils/withTheme";
import ConsentDetailsButton, { TESTCAFE_ID_VIEW_DETAILS_BUTTON } from "./index";
import getSignedVc from "../../../../../../__testUtils/mockSignedVc";
import { ConfirmationDialogProvider } from "../../../../../../src/contexts/confirmationDialogContext";
import ConsentDetailsModal, {
  TESTCAFE_ID_CONSENT_DETAILS_MODAL,
  TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON,
  TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON,
} from "./consentDetailsModal";

const webId = "https://example.com/profile/card#me";

jest.mock("@inrupt/solid-client-access-grants");
const mockRevokeAG = revokeAccessGrant;

describe("View consent details button and modal", () => {
  it("renders a button which triggers the opening of the modal", async () => {
    const testResourceIri = "testIri";
    const permission = {
      webId,
      alias: "Editors",
      type: "agent",
      vc: getSignedVc(),
    };

    const fakeHandleCloseModal = jest.fn();
    const { asFragment, getByTestId } = renderWithTheme(
      <ConsentDetailsButton
        permission={permission}
        resourceIri={testResourceIri}
        handleCloseModal={fakeHandleCloseModal}
      />
    );
    const button = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
    expect(button).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  // it.skip("closes the modal when the user clicks on the revoke button", async () => {
  //   const fakeHandleCloseModal = jest.fn();
  //   const testResourceIri = "testIri";
  //   const permission = {
  //     webId,
  //     alias: "Editors",
  //     type: "agent",
  //     vc: getSignedVc(),
  //   };

  //   mockRevokeAG.mockReturnValue(true);
  //   const { findByTestId } = renderWithTheme(
  //     <ConsentDetailsModal
  //       resourceIri={testResourceIri}
  //       handleCloseModal={fakeHandleCloseModal}
  //       permission={permission}
  //     />
  //   );

  //   const modal = await findByTestId(TESTCAFE_ID_CONSENT_DETAILS_MODAL);
  //   expect(modal).toBeInTheDocument();
  //   const revokeButton = await findByTestId(
  //     TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON
  //   );
  //   act(() => userEvent.click(revokeButton));
  //   const closedModal = await screen.queryByTestId(
  //     TESTCAFE_ID_CONSENT_DETAILS_MODAL
  //   );
  //   await waitFor(() => {
  //     expect(closedModal).toBeNull();
  //   });
  // });

  // it("closes the modal when the user clicks on the done button ", async () => {
  //   const fakeHandleCloseModal = jest.fn();
  //   const { findByTestId } = renderWithTheme(
  //     <ConsentDetailsModal
  //       resourceIri={testResourceIri}
  //       handleCloseModal={fakeHandleCloseModal}
  //       permission={permission}
  //     />
  //   );
  //   const modal = await findByTestId(TESTCAFE_ID_CONSENT_DETAILS_MODAL);
  //   expect(modal).toBeInTheDocument();
  //   const doneButton = await findByTestId(
  //     TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON
  //   );
  //   userEvent.click(doneButton);
  //   await waitFor(() => {
  //     expect(fakeHandleCloseModal).toHaveBeenCalled();
  //   });
  // });
});
