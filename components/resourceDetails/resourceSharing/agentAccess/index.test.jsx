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

import { fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import AgentAccess from "./index";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import * as profileFns from "../../../../src/solidClientHelpers/profile";
import { mockProfileAlice } from "../../../../__testUtils/mockPersonResource";
import mockAccessControl from "../../../../__testUtils/mockAccessControl";
import AccessControlContext from "../../../../src/contexts/accessControlContext";

jest.mock("../../../../src/hooks/useFetchProfile");

const webId = "https://example.com/profile/card#me";

const accessControl = mockAccessControl();

describe("AgentAccess", () => {
  const permission = {
    acl: createAccessMap(true, true, false, false),
    webId,
    canShare: false,
    alias: "Editors",
    profile: mockProfileAlice(),
    profileError: undefined,
  };

  const mutatePermissions = jest.fn();

  it("renders", () => {
    const { asFragment } = renderWithTheme(
      <AgentAccess permission={permission} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders skeleton placeholders when profile is not available", () => {
    const { asFragment } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: createAccessMap(true, true, false, false),
          webId,
          canShare: false,
          alias: "Editors",
          profile: null,
          profileError: undefined,
        }}
        mutatePermissions={mutatePermissions}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an error message with a 'try again' button if it's unable to load profile", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: createAccessMap(true, true, false, false),
          webId,
          canShare: false,
          alias: "Editors",
          profile: null,
          profileError: "error",
        }}
        mutatePermissions={mutatePermissions}
      />
    );
    expect(getByTestId("try-again-button")).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a spinner after clicking 'try again' button", async () => {
    const { getByTestId } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: createAccessMap(true, true, false, false),
          webId,
          canShare: false,
          alias: "Editors",
          profile: null,
          profileError: "error",
        }}
        mutatePermissions={mutatePermissions}
      />
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    expect(getByTestId("try-again-spinner")).toBeTruthy();
  });

  it("tries to fetch the profile again when clicking 'try again' button", async () => {
    const fetchProfile = jest.spyOn(profileFns, "fetchProfile");
    const { getByTestId } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: createAccessMap(true, true, false, false),
          webId,
          canShare: false,
          alias: "Editors",
          profile: null,
          profileError: "error",
        }}
        mutatePermissions={mutatePermissions}
      />
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    await waitFor(() =>
      expect(fetchProfile).toHaveBeenCalledWith(webId, expect.anything())
    );
  });

  it("removes the spinner when fetching succeeds", async () => {
    const fetchProfile = jest.spyOn(profileFns, "fetchProfile");
    fetchProfile.mockReturnValue("profile");
    const { getByTestId, queryByTestId } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: createAccessMap(true, true, false, false),
          webId,
          canShare: false,
          alias: "Editors",
          profile: null,
          profileError: "error",
        }}
        mutatePermissions={mutatePermissions}
      />
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    await waitFor(() => expect(queryByTestId("try-again-spinner")).toBeFalsy());
  });

  it("removes the spinner when fetching errors", async () => {
    const fetchProfile = jest.spyOn(profileFns, "fetchProfile");
    fetchProfile.mockReturnValue("profile");
    const { getByTestId, queryByTestId } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: createAccessMap(true, true, false, false),
          webId,
          canShare: false,
          alias: "Editors",
          profile: null,
          profileError: "error",
        }}
        mutatePermissions={mutatePermissions}
      />
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    await waitFor(() =>
      expect(fetchProfile).toHaveBeenCalledWith(webId, expect.anything())
    );
    await waitFor(() => expect(queryByTestId("try-again-spinner")).toBeFalsy());
  });
  it("unchecks shareToggle when clicking share toggle", () => {
    const { getByTestId, getByRole } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentAccess
          permission={{
            acl: createAccessMap(true, true, false, false),
            webId,
            canShare: true,
            alias: "Editors",
            profile: {
              avatar: null,
              name: "Example 1",
            },
            profileError: null,
          }}
          mutatePermissions={mutatePermissions}
        />
      </AccessControlContext.Provider>
    );
    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);
    expect(getByTestId("can-share-info-button-label")).not.toBeNull();
    const canShareToggle = getByRole("checkbox");
    userEvent.click(canShareToggle);
    fireEvent.change(canShareToggle, { target: { checked: false } });
    expect(canShareToggle).toHaveProperty("checked", false);
  });
  it("removes permissions from list when clicking remove button", () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AccessControlContext.Provider value={{ accessControl }}>
        <AgentAccess
          permission={{
            acl: createAccessMap(true, true, false, false),
            webId,
            canShare: true,
            alias: "Editors",
            profile: {
              avatar: null,
              name: "Example 1",
            },
            profileError: null,
          }}
          mutatePermissions={mutatePermissions}
        />
      </AccessControlContext.Provider>
    );
    const menuButton = getByTestId("menu-button");
    expect(queryByText("Example 1")).not.toBeNull();
    userEvent.click(menuButton);
    const removeButton = getByTestId("remove-button");
    userEvent.click(removeButton);
    expect(queryByText("Example 1")).toBeNull();
  });
});
