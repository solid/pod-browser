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
import { useRouter } from "next/router";
import * as consentFns from "@inrupt/solid-client-access-grants";
import { renderWithTheme } from "../../__testUtils/withTheme";
import getSignedVc from "../../__testUtils/mockSignedVc";
import mockConsentRequestContext from "../../__testUtils/mockConsentRequestContext";
import ConsentRequestForm, {
  DENY_ACCESS_DIALOG_TITLE,
  NO_ACCESS_DIALOG_TITLE,
  NO_PURPOSE_TITLE,
  TESTCAFE_ID_CONSENT_REQUEST_DENY_BUTTON,
  TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON,
} from "./index";
import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
} from "../confirmationDialog";
import { ConfirmationDialogProvider } from "../../src/contexts/confirmationDialogContext";
import { getConsentRequestDetailsOnePurpose } from "../../__testUtils/mockConsentRequestDetails";
import { TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT } from "./purposeCheckBox";
import { TESTCAFE_ID_CONSENT_ACCESS_SWITCH } from "./requestSection";

jest.mock("next/router");
const mockedUseRouter = useRouter;

const ConsentRequestContextProvider = mockConsentRequestContext();
const consentRequestWithOnePurpose = getConsentRequestDetailsOnePurpose();
const ConsentRequestContextProviderOnePurpose = mockConsentRequestContext(
  consentRequestWithOnePurpose
);
const agentDetails = {
  agentName: "Mock App",
  agentUrl: "http://mockappurl.com",
  agentPolicy: "http://mockappurl.com/privacy-policy",
  agentTOS: "http://mockappurl.com/TOS",
};
const agentWebId = "https://mockappurl.com/app#id";

describe("Consent Request Form", () => {
  const push = jest.fn();
  const signedVc = getSignedVc();
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { redirectUrl: "/privacy/" },
      push,
    });
  });
  test("Renders a consent request form with multiple purposes", () => {
    const { asFragment } = renderWithTheme(
      <ConsentRequestContextProvider>
        <ConsentRequestForm
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </ConsentRequestContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
  test("Renders a consent request form with only one purpose", () => {
    const { asFragment } = renderWithTheme(
      <ConsentRequestContextProviderOnePurpose>
        <ConsentRequestForm
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </ConsentRequestContextProviderOnePurpose>
    );

    expect(asFragment()).toMatchSnapshot();
  });
  test("when submitting form without selecting access and at least one purpose selected, it displays a confirmation dialog with the correct title and content", () => {
    jest
      .spyOn(consentFns, "approveAccessRequestWithConsent")
      .mockResolvedValue(signedVc);
    const { getByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentRequestContextProvider>
          <ConsentRequestForm
            agentDetails={agentDetails}
            agentWebId={agentWebId}
          />
        </ConsentRequestContextProvider>
      </ConfirmationDialogProvider>
    );
    const purpose = getAllByTestId(TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT)[0];
    userEvent.click(purpose);
    const button = getByTestId(TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON);
    userEvent.click(button);
    const dialog = getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent(NO_ACCESS_DIALOG_TITLE);
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
    ).toHaveTextContent(
      "Mock App will not have access to anything in your Pod."
    );
  });
  test("when submitting form without selecting purpose and at least one access selected, it displays a confirmation dialog with the correct title and content", () => {
    const { getByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentRequestContextProvider>
          <ConsentRequestForm
            agentDetails={agentDetails}
            agentWebId={agentWebId}
          />
        </ConsentRequestContextProvider>
      </ConfirmationDialogProvider>
    );
    const toggle = getAllByTestId(TESTCAFE_ID_CONSENT_ACCESS_SWITCH)[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON);
    userEvent.click(button);
    const dialog = getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent(NO_PURPOSE_TITLE);
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
    ).toHaveTextContent(
      "At least one purpose needs to be selected to approve access for Mock App"
    );
  });
  // FIXME: fix this test
  test.skip("does not display confirmation dialog if at least one access and one purpose are selected and redirects with correct params", async () => {
    const { getByTestId, findByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentRequestContextProvider>
          <ConsentRequestForm agentDetails={agentDetails} />
        </ConsentRequestContextProvider>
      </ConfirmationDialogProvider>
    );
    const purpose = getAllByTestId(TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT)[0];
    userEvent.click(purpose);
    const toggle = getAllByTestId(TESTCAFE_ID_CONSENT_ACCESS_SWITCH)[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON);
    userEvent.click(button);
    await expect(findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).rejects.toEqual(
      expect.anything()
    );
    expect(push).toHaveBeenLastCalledWith(
      `/privacy/?signedVcUrl=${signedVc.id}`
    );
  });
  test("displays the confirmation dialog with the correct title and content regardless of the state of the toggles when clicking 'Deny All Access' button", async () => {
    const { getByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentRequestContextProvider>
          <ConsentRequestForm
            agentDetails={agentDetails}
            agentWebId={agentWebId}
          />
        </ConsentRequestContextProvider>
      </ConfirmationDialogProvider>
    );
    const purpose = getAllByTestId(TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT)[0];
    userEvent.click(purpose);
    const toggle = getAllByTestId(TESTCAFE_ID_CONSENT_ACCESS_SWITCH)[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_CONSENT_REQUEST_DENY_BUTTON);
    userEvent.click(button);
    const dialog = getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
    ).toHaveTextContent(DENY_ACCESS_DIALOG_TITLE);
    expect(
      getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
    ).toHaveTextContent(
      "Mock App will not have access to anything in your Pod."
    );
  });
});
