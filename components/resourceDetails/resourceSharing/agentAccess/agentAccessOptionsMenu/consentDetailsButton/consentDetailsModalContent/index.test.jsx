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
import { renderWithTheme } from "../../../../../../../__testUtils/withTheme";
import getSignedVc from "../../../../../../../__testUtils/mockSignedVc";
import ConsentDetailsModalContent, {
  TESTCAFE_ID_CONSENT_DETAILS_CONTENT,
} from "./index";

const webId = "https://example.com/profile/card#me";

const permission = {
  webId,
  alias: "Editors",
  type: "agent",
  vc: getSignedVc(),
};

const closeDialog = jest.fn();

describe("Renders correct consent modal content", () => {
  test("clicking on view details button renders a confirmation dialog with the correct data", async () => {
    const { baseElement, findByTestId, findByText } = renderWithTheme(
      <ConsentDetailsModalContent
        permission={permission}
        closeDialog={closeDialog}
      />
    );
    await findByTestId(TESTCAFE_ID_CONSENT_DETAILS_CONTENT);
    await findByText(
      permission.vc.credentialSubject.providedConsent.forPurpose[0]
    );
    expect(baseElement).toMatchSnapshot();
  });
});
