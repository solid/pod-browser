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
import { renderWithTheme } from "../../../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../../../__testUtils/mockAccessControl";
import ConsentDetailsButton, { TESTCAFE_ID_VIEW_DETAILS_BUTTON } from "./index";
import { ConfirmationDialogProvider } from "../../../../../../src/contexts/confirmationDialogContext";
import ConfirmationDialog, {
  TESTCAFE_ID_CONFIRM_BUTTON,
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_TITLE,
} from "../../../../../confirmationDialog";
import AccessControlContext from "../../../../../../src/contexts/accessControlContext";

const resourceIri = "/iri/";
const resourceUrl = "http://example.com/resource";
const webId = "https://example.com/profile/card#me";
const name = "Example Agent";

describe("AgentAccessOptionsMenu", () => {
  test("it renders a button which triggers the opening of the modal", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <ConsentDetailsButton resourceIri={resourceIri} agentWebId={webId} />
    );
    expect(asFragment()).toMatchSnapshot();
    const button = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
    expect(button).toBeDefined();
  });
  test("clicking on view details button renders a confirmation dialog with the correct data", async () => {
    const { baseElement, getByTestId, findByTestId } = renderWithTheme(
      <ConfirmationDialogProvider>
        <ConsentDetailsButton resourceIri={resourceIri} agentWebId={webId} />
        <ConfirmationDialog />
      </ConfirmationDialogProvider>
    );
    const button = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
    userEvent.click(button);
    const dialog = await findByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG);
    expect(dialog).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });
});
