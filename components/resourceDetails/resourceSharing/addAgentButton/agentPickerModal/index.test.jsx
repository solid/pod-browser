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
import { act } from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/dom";
import AgentPickerModal from "./index";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import mockAccessControl from "../../../../../__testUtils/mockAccessControl";
import AccessControlContext from "../../../../../src/contexts/accessControlContext";
import { fetchProfile } from "../../../../../src/solidClientHelpers/profile";

jest.mock("../../../../../src/solidClientHelpers/profile");

// TODO: Un-comment toggle tests once we un-hide the toggle

describe("AgentPickerEmptyState", () => {
  const onClose = jest.fn();
  const mutatePermissions = jest.fn();
  const permissions = [];
  const accessControl = mockAccessControl();

  // update this when we actually pass the contacts to the table
  it("renders a table with tabs, searchbox and an empty state message when there are no contacts", () => {
    const { asFragment } = renderWithTheme(
      <AgentPickerModal
        type="editors"
        text="Add Editors"
        onClose={onClose}
        mutatePermissions={mutatePermissions}
        permissions={permissions}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it("renders a warning when trying to submit without adding a webId", () => {
    const { getByTestId, getByRole } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </AccessControlContext.Provider>
    );

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const submitWebIdsButton = getByTestId("submit-webids-button");
    userEvent.click(submitWebIdsButton);

    expect(getByRole("alert")).not.toBeNull();
  });
  it("renders a confirmation dialog with a confirm button that submits the webIds ", async () => {
    const { getByTestId, findByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </AccessControlContext.Provider>
    );
    act(() => {
      const addWebIdButton = getByTestId("add-webid-button");
      userEvent.click(addWebIdButton);
      const input = getByTestId("webid-input");
      userEvent.type(input, "https://somewebid.com/");
      const addButton = getByTestId("add-button");
      userEvent.click(addButton);
      const submitWebIdsButton = getByTestId("submit-webids-button");
      userEvent.click(submitWebIdsButton);
      const confirmButton = getByTestId("confirm-button");
      userEvent.click(confirmButton);
    });
    const agentWebIdText = await findByText("https://somewebid.com/");
    expect(agentWebIdText).not.toBeNull();
  });
  it("updates the temporary Thing with webId only when profile is unavailable and calls updateThing when clicking the Add Button", async () => {
    const { getByTestId, findByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </AccessControlContext.Provider>
    );

    const webId = "https://somewebid.com";

    await fetchProfile.mockRejectedValue({ error: "error" });

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = getByTestId("webid-input");
    userEvent.type(input, webId);
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);
    const agentWebId = await findByText(webId);

    expect(agentWebId).not.toBeNull();
  });
  it("updates the temporary row with profile data when available and calls updateThing when clicking the Add Button", async () => {
    const { getByTestId, findByTestId } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentPickerModal
          type="editors"
          text="Add Editors"
          onClose={onClose}
          mutatePermissions={mutatePermissions}
          permissions={permissions}
        />
      </AccessControlContext.Provider>
    );

    const name = "Example";
    const avatar = "https://someavatar.com";
    const webId = "https://somewebid.com";

    const addWebIdButton = getByTestId("add-webid-button");
    userEvent.click(addWebIdButton);
    const input = getByTestId("webid-input");
    userEvent.type(input, webId);
    // const toggle = getByTestId("can-share-toggle");
    // fireEvent.change(toggle, { target: { checked: true } });
    const addButton = getByTestId("add-button");
    userEvent.click(addButton);

    await fetchProfile.mockResolvedValueOnce({ name, avatar, webId });

    const agentWebId = await findByTestId("agent-webid");

    expect(agentWebId).not.toBeNull();
  });
  // describe("toggleCanShare", () => {
  //   const name = "Example";
  //   const avatar = "https://someavatar.com";
  //   const webId = "https://somewebid.com";

  //   beforeEach(() => {
  //     fetchProfile.mockResolvedValue({ name, avatar, webId });
  //   });
  //   it("toggles can share for an entered webId when clicking the share toggle", async () => {
  //     const { getByTestId } = renderWithTheme(
  //       <AccessControlContext.Provider value={{ accessControl }}>
  //         <AgentPickerModal
  //           type="editors"
  //           text="Add Editors"
  //           onClose={onClose}
  //           mutatePermissions={mutatePermissions}
  //           permissions={permissions}
  //         />
  //       </AccessControlContext.Provider>
  //     );

  //     const addWebIdButton = getByTestId("add-webid-button");
  //     userEvent.click(addWebIdButton);
  //     const input = getByTestId("webid-input");
  //     userEvent.type(input, webId);
  //     const addButton = getByTestId("add-button");
  //     userEvent.click(addButton);
  //     const toggle = getByTestId("can-share-toggle");
  //     fireEvent.change(toggle, { target: { checked: true } });
  //     expect(toggle).toHaveProperty("checked", true);
  //   });

  //   it("toggles can share for the webId to be entered when clicking the share toggle", async () => {
  //     const { getByTestId, findByTestId, findByText } = renderWithTheme(
  //       <AccessControlContext.Provider value={{ accessControl }}>
  //         <AgentPickerModal
  //           type="editors"
  //           text="Add Editors"
  //           onClose={onClose}
  //           mutatePermissions={mutatePermissions}
  //           permissions={permissions}
  //         />
  //       </AccessControlContext.Provider>
  //     );

  //     const addWebIdButton = getByTestId("add-webid-button");
  //     userEvent.click(addWebIdButton);
  //     const toggle = getByTestId("can-share-toggle");
  //     userEvent.click(toggle);
  //     const input = getByTestId("webid-input");
  //     userEvent.type(input, webId);
  //     const addButton = getByTestId("add-button");
  //     userEvent.click(addButton);

  //     const agentWebId = await findByTestId("agent-webid");

  //     const submitWebIdsButton = getByTestId("submit-webids-button");
  //     userEvent.click(submitWebIdsButton);
  //     const confirmButton = getByTestId("confirm-button");
  //     userEvent.click(confirmButton);

  //     const canShareText = findByText("Can Share");

  //     expect(canShareText).not.toBeNull();

  //     expect(agentWebId).not.toBeNull();
  //   });
  // });
});
