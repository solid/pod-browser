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
import { renderWithTheme } from "../../../../../../../__testUtils/withTheme";
import getSignedVc from "../../../../../../../__testUtils/mockSignedVc";
import ConsentDetailsModal, {
  TESTCAFE_ID_CONSENT_DETAILS_MODAL,
  TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON,
  TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON,
  sortedAccessDetails,
  order,
  accessDetails,
} from "./index";

const webId = "https://example.com/profile/card#me";
const testResourceIri = "testIri";

describe("Renders a consent modal", () => {
  test("clicking on view details button renders a modal with the correct data", async () => {
    const permission = {
      webId,
      alias: "editors",
      type: "agent",
      vc: getSignedVc(),
    };

    const fakesetOpenFunc = jest.fn();
    const { baseElement, findByTestId } = renderWithTheme(
      <ConsentDetailsModal
        resourceIri={testResourceIri}
        setOpenModal={fakesetOpenFunc}
        permission={permission}
      />
    );
    const modal = await findByTestId(TESTCAFE_ID_CONSENT_DETAILS_MODAL);
    expect(modal).toBeInTheDocument();
    // expect(baseElement).toMatchSnapshot();
  });

  test("clicking on the revoke button revokes access", async () => {
    const permission = {
      webId,
      alias: "editors",
      type: "agent",
      vc: getSignedVc(),
    };

    const fakesetOpenFunc = jest.fn();
    const { baseElement, findByTestId } = renderWithTheme(
      <ConsentDetailsModal
        resourceIri={testResourceIri}
        setOpenModal={fakesetOpenFunc}
        permission={permission}
      />
    );
    const modal = await findByTestId(TESTCAFE_ID_CONSENT_DETAILS_MODAL);
    expect(modal).toBeInTheDocument();
    // expect(baseElement).toMatchSnapshot();
  });

  test("clicking on the revoke button closes the modal", async () => {
    const permission = {
      webId,
      alias: "editors",
      type: "agent",
      vc: getSignedVc(),
    };

    const fakesetOpenFunc = jest.fn();
    const { findByTestId } = renderWithTheme(
      <ConsentDetailsModal
        resourceIri={testResourceIri}
        setOpenModal={fakesetOpenFunc}
        permission={permission}
      />
    );
    const modal = await findByTestId(TESTCAFE_ID_CONSENT_DETAILS_MODAL);
    expect(modal).toBeInTheDocument();
    const revokeButton = await findByTestId(
      TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON
    );
    userEvent.click(revokeButton);
    await waitFor(() => {
      expect(modal).toBeNull();
    });
  });

  test("clicking on the done button closes the modal", async () => {
    const permission = {
      webId,
      alias: "editors",
      type: "agent",
      vc: getSignedVc(),
    };

    const fakesetOpenFunc = jest.fn();
    const { findByTestId } = renderWithTheme(
      <ConsentDetailsModal
        resourceIri={testResourceIri}
        setOpenModal={fakesetOpenFunc}
        permission={permission}
      />
    );
    const modal = await findByTestId(TESTCAFE_ID_CONSENT_DETAILS_MODAL);
    expect(modal).toBeInTheDocument();
    const doneButton = await findByTestId(
      TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON
    );
    userEvent.click(doneButton);
    await waitFor(() => {
      expect(modal).toBeNull();
    });
  });
});
