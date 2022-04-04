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
import { renderWithTheme } from "../../../../../../__testUtils/withTheme";
import AccessDetailsButton, { TESTCAFE_ID_VIEW_DETAILS_BUTTON } from "./index";
import getSignedVc from "../../../../../../__testUtils/mockSignedVc";

const webId = "https://example.com/profile/card#me";

describe("View access details button and modal", () => {
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
      <AccessDetailsButton
        permission={permission}
        resourceIri={testResourceIri}
        handleCloseModal={fakeHandleCloseModal}
      />
    );
    const button = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
    expect(button).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });
});
