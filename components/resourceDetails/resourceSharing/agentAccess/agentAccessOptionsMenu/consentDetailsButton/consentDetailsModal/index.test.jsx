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
import { act, render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { revokeAccessGrant } from "@inrupt/solid-client-access-grants";
import { renderWithTheme } from "../../../../../../../__testUtils/withTheme";
import getSignedVc from "../../../../../../../__testUtils/mockSignedVc";
import ConsentDetailsModal, {
  TESTCAFE_ID_CONSENT_DETAILS_MODAL,
  setupErrorComponent,
} from "./index";

const testResourceIri = "testIri";
const webId = "https://example.com/profile/card#me";
const permission = {
  webId,
  alias: "editors",
  type: "agent",
  vc: getSignedVc(),
};

describe("Renders a consent modal", () => {
  it("renders a modal when the user clicks on view details button ", async () => {
    const { asFragment } = renderWithTheme(
      <ConsentDetailsModal
        resourceIri={testResourceIri}
        handleCloseModal={jest.fn()}
        permission={permission}
        setOpenModal={jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  describe("setupErrorComponent", () => {
    it("renders", () => {
      const bem = (value) => value;
      const { asFragment } = render(setupErrorComponent(bem)());
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
