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
import { screen, waitFor } from "@testing-library/dom";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import AgentAccessOptionsMenu from "./index";
import { TESTCAFE_ID_REMOVE_BUTTON } from "./removeButton";
import getSignedVc from "../../../../../__testUtils/mockSignedVc";
import * as accesGrantFns from "@inrupt/solid-client-access-grants";

import { TESTCAFE_ID_VIEW_DETAILS_BUTTON } from "./consentDetailsButton";
import {
  TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON,
  TESTCAFE_ID_CONSENT_DETAILS_MODAL,
  TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON,
} from "./consentDetailsButton/consentDetailsModal";

const resourceIri = "/iri/";
const webId = "https://example.com/profile/card#me";
const profile = {
  avatar: null,
  name: "Example Agent",
  webId,
};

describe("AgentAccessOptionsMenu", () => {
  it("renders a button which triggers the opening of the menu", () => {
    const permission = { webId, profile, alias: "editors" };
    const { asFragment, getByTestId, queryByText } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn}
        setLocalAccess={jest.fn}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByText("WebId:")).toBeNull();
    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);
    expect(queryByText("WebId:")).toBeDefined();
    const removeButton = getByTestId(TESTCAFE_ID_REMOVE_BUTTON);
    expect(removeButton).toBeDefined();
  });
});

describe("Consent Details Modal", () => {
  it("renders a details modal when you click on the view details button", async () => {
    const permission = {
      webId,
      alias: "Editors",
      type: "agent",
      vc: getSignedVc(),
    };
    const { asFragment, getByTestId, queryByText } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn}
        setLocalAccess={jest.fn}
      />
    );

    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);
    await waitFor(() => {
      const viewDetailsButton = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
      expect(viewDetailsButton).toBeInTheDocument();
      userEvent.click(viewDetailsButton);
    });

    await waitFor(() => {
      expect(
        getByTestId(TESTCAFE_ID_CONSENT_DETAILS_MODAL)
      ).toBeInTheDocument();
    });
  });

  it("closes the details modal when you click on the revoke button", async () => {
    const permission = {
      webId,
      alias: "Editors",
      type: "agent",
      vc: getSignedVc(),
    };
    jest.spyOn(accesGrantFns, "revokeAccessGrant").mockResolvedValue(true);

    const { getByTestId } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn}
        setLocalAccess={jest.fn}
      />
    );

    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);

    await waitFor(() => {
      const viewDetailsButton = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
      userEvent.click(viewDetailsButton);
    });
    const revokeButton = getByTestId(TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON);
    userEvent.click(revokeButton);

    userEvent.click(revokeButton);
    await waitFor(() => {
      const closedModal = screen.queryByTestId(
        TESTCAFE_ID_CONSENT_DETAILS_MODAL
      );
      expect(closedModal).toBeNull();
    });
  });
  it("closes the details modal when you click on the done button", async () => {
    const permission = {
      webId,
      alias: "Editors",
      type: "agent",
      vc: getSignedVc(),
    };

    const { getByTestId } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn}
        setLocalAccess={jest.fn}
      />
    );

    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);

    await waitFor(() => {
      const viewDetailsButton = getByTestId(TESTCAFE_ID_VIEW_DETAILS_BUTTON);
      userEvent.click(viewDetailsButton);
    });
    const revokeButton = getByTestId(TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON);
    userEvent.click(revokeButton);

    act(() => userEvent.click(revokeButton));
    await waitFor(() => {
      const closedModal = screen.queryByTestId(
        TESTCAFE_ID_CONSENT_DETAILS_MODAL
      );
      expect(closedModal).toBeNull();
    });
  });
});
