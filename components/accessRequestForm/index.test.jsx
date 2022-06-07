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
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/router";
import { mockContainerFrom } from "@inrupt/solid-client";
import * as accessGrantsFns from "@inrupt/solid-client-access-grants";
import { renderWithTheme } from "../../__testUtils/withTheme";
import getSignedVc from "../../__testUtils/mockSignedVc";
import AccessRequestForm, {
  DENY_ACCESS_DIALOG_TITLE,
  NO_ACCESS_DIALOG_TITLE,
  NO_PURPOSE_TITLE,
  TESTCAFE_ID_ACCESS_REQUEST_DENY_BUTTON,
  TESTCAFE_ID_ACCESS_REQUEST_SUBMIT_BUTTON,
} from "./index";
import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
  TESTCAFE_ID_CONFIRM_BUTTON,
} from "../confirmationDialog";
import { ConfirmationDialogProvider } from "../../src/contexts/confirmationDialogContext";
import getAccessRequestDetails, {
  getAccessRequestDetailsOnePurpose,
} from "../../__testUtils/mockAccessRequestDetails";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import mockSession from "../../__testUtils/mockSession";
import { TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT } from "./purposeCheckBox";
import { TESTCAFE_ID_ACCESS_SWITCH } from "./requestSection";
import useContainer from "../../src/hooks/useContainer";
import * as containerFns from "../../src/models/container";

jest.mock("../../src/hooks/useContainer");
const mockedUseContainer = useContainer;

jest.mock("next/router");
const mockedUseRouter = useRouter;

jest.mock("@inrupt/solid-client-access-grants");

const defaultAccessRequest = getAccessRequestDetails();
const accessRequestWithOnePurpose = getAccessRequestDetailsOnePurpose();

const SessionProvider = mockSessionContextProvider(mockSession());
const agentDetails = {
  agentName: "Mock App",
  agentUrl: "http://mockappurl.com",
  agentPolicy: "http://mockappurl.com/privacy-policy",
  agentTOS: "http://mockappurl.com/TOS",
};
const agentWebId = "https://mockappurl.com/app#id";

describe("Access Request Form", () => {
  const push = jest.fn();
  const signedVc = getSignedVc();
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { redirectUrl: "/privacy/" },
      push,
    });
    mockedUseContainer.mockReturnValue({
      data: {
        dataset: mockContainerFrom(
          "https://pod.inrupt.com/alice/private/data/"
        ),
      },
    });
    jest
      .spyOn(containerFns, "getContainerResourceUrlAll")
      .mockReturnValue([
        "https://pod.inrupt.com/alice/private/data/data-2",
        "https://pod.inrupt.com/alice/private/data/data-3",
      ]);
  });

  it("redirects user if not data subject of access request", async () => {
    const { getByText } = renderWithTheme(
      <SessionProvider>
        <AccessRequestForm
          accessRequest={defaultAccessRequest}
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/");
    });
  });

  it("Renders a consent request form with multiple purposes", async () => {
    const { asFragment, findByTestId } = renderWithTheme(
      <AccessRequestForm
        accessRequest={defaultAccessRequest}
        agentDetails={agentDetails}
        agentWebId={agentWebId}
      />
    );
    await expect(findByTestId("spinner")).rejects.toEqual(expect.anything());
    expect(asFragment()).toMatchSnapshot();
  });

  it("Renders a access request form with only one purpose", async () => {
    const { asFragment, findByTestId } = renderWithTheme(
      <AccessRequestForm
        accessRequest={accessRequestWithOnePurpose}
        agentDetails={agentDetails}
        agentWebId={agentWebId}
      />
    );
    await expect(findByTestId("spinner")).rejects.toEqual(expect.anything());
    expect(asFragment()).toMatchSnapshot();
  });

  it("displays a confirmation dialog with the correct title and content when submitting form without selecting access and at least one purpose selected", () => {
    jest
      .spyOn(accessGrantsFns, "approveAccessRequest")
      .mockResolvedValue(signedVc);
    const { getByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessRequestForm
          accessRequest={defaultAccessRequest}
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </ConfirmationDialogProvider>
    );
    const purpose = getAllByTestId(TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT)[0];
    userEvent.click(purpose);
    const button = getByTestId(TESTCAFE_ID_ACCESS_REQUEST_SUBMIT_BUTTON);
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

  it("displays a confirmation dialog with the correct title and content when submitting form without selecting purpose and at least one access selected", async () => {
    const { getByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessRequestForm
          accessRequest={defaultAccessRequest}
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </ConfirmationDialogProvider>
    );
    const toggle = getAllByTestId(TESTCAFE_ID_ACCESS_SWITCH)[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_ACCESS_REQUEST_SUBMIT_BUTTON);
    userEvent.click(button);
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).toBeInTheDocument();
      expect(
        getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE)
      ).toHaveTextContent(NO_PURPOSE_TITLE);
      expect(
        getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
      ).toHaveTextContent(
        "At least one purpose needs to be selected to approve access for Mock App"
      );
    });
  });

  it("does not display confirmation dialog if at least one access and one purpose are selected, calls approveAccessRequest and redirects with correct params", async () => {
    accessGrantsFns.approveAccessRequest.mockResolvedValue(signedVc);
    const { getByTestId, findByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessRequestForm
          accessRequest={defaultAccessRequest}
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </ConfirmationDialogProvider>
    );
    const purpose = getAllByTestId(TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT)[0];
    userEvent.click(purpose);
    const toggle = getAllByTestId(TESTCAFE_ID_ACCESS_SWITCH)[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_ACCESS_REQUEST_SUBMIT_BUTTON);
    userEvent.click(button);
    await expect(findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG)).rejects.toEqual(
      expect.anything()
    );
    expect(accessGrantsFns.approveAccessRequest).toHaveBeenCalled();
    expect(push).toHaveBeenLastCalledWith(
      `/privacy/?${accessGrantsFns.GRANT_VC_URL_PARAM_NAME}=${signedVc.id}`
    );
  });

  it("displays the confirmation dialog with the correct title and content regardless of the state of the toggles when clicking 'Deny All Access' button", async () => {
    const { getByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessRequestForm
          accessRequest={defaultAccessRequest}
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </ConfirmationDialogProvider>
    );
    const purpose = getAllByTestId(TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT)[0];
    userEvent.click(purpose);
    const toggle = getAllByTestId(TESTCAFE_ID_ACCESS_SWITCH)[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_ACCESS_REQUEST_DENY_BUTTON);
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

  it(" calls denyAccessRequest and redirects with correct params when confirming deny access", async () => {
    accessGrantsFns.denyAccessRequest.mockResolvedValue(signedVc);
    const { getByTestId, getAllByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <AccessRequestForm
          accessRequest={defaultAccessRequest}
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
      </ConfirmationDialogProvider>
    );
    const purpose = getAllByTestId(TESTCAFE_ID_PURPOSE_CHECKBOX_INPUT)[0];
    userEvent.click(purpose);
    const toggle = getAllByTestId(TESTCAFE_ID_ACCESS_SWITCH)[0];
    userEvent.click(toggle);
    const button = getByTestId(TESTCAFE_ID_ACCESS_REQUEST_DENY_BUTTON);
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
    const confirmButton = getByTestId(TESTCAFE_ID_CONFIRM_BUTTON);
    userEvent.click(confirmButton);
    await waitFor(() => {
      expect(accessGrantsFns.denyAccessRequest).toHaveBeenCalled();
    });
    expect(push).toHaveBeenLastCalledWith(
      `/privacy/?${accessGrantsFns.GRANT_VC_URL_PARAM_NAME}=${signedVc.id}`
    );
  });
});
