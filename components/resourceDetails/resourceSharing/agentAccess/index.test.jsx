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
import AgentAccess, { saveHandler } from "./index";

import { renderWithTheme } from "../../../../__testUtils/withTheme";
import * as profileFns from "../../../../src/solidClientHelpers/profile";
import { mockProfileAlice } from "../../../../__testUtils/mockPersonResource";

jest.mock("../../../../src/solidClientHelpers/permissions");
jest.mock("../../../../src/hooks/useFetchProfile");

const webId = "https://example.com/profile/card#me";

describe("AgentAccess", () => {
  const permission = {
    acl: {
      read: true,
      write: true,
      append: true,
      control: true,
    },
    webId,
    profile: mockProfileAlice(),
  };

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
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: null,
          profileError: null,
        }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an error message with a 'try again' button if it's unable to load profile", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: null,
          profileError: "error",
        }}
      />
    );
    expect(getByTestId("try-again-button")).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a spinner after clicking 'try again' button", async () => {
    const { getByTestId } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: null,
          profileError: "error",
        }}
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
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: null,
          profileError: "error",
        }}
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
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: null,
          profileError: "error",
        }}
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
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: null,
          profileError: "error",
        }}
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
    const { getByTestId, getByRole, queryByText } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: {
            avatar: null,
            name: "Example 1",
          },
          profileError: null,
        }}
      />
    );
    const menuButton = getByTestId("menu-button");
    expect(queryByText("Can Share")).not.toBeNull();
    userEvent.click(menuButton);
    const canShareToggle = getByRole("checkbox");
    userEvent.click(canShareToggle);
    fireEvent.change(canShareToggle, { target: { checked: true } });
    expect(canShareToggle).toHaveProperty("checked", true);
    expect(queryByText("Can Share")).toBeNull();
  });
  it("removes permissions from list when clicking remove button", () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccess
        permission={{
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          webId,
          profile: {
            avatar: null,
            name: "Example 1",
          },
          profileError: null,
        }}
      />
    );
    const menuButton = getByTestId("menu-button");
    expect(queryByText("Example 1")).not.toBeNull();
    userEvent.click(menuButton);
    const removeButton = getByTestId("remove-button");
    userEvent.click(removeButton);
    expect(queryByText("Example 1")).toBeNull();
  });
});

describe("saveHandler", () => {
  const accessControl = {
    savePermissionsForAgent: jest.fn().mockResolvedValue({}),
  };
  let setLoading;
  let setAccess;
  let setSeverity;
  let setMessage;
  let setAlertOpen;
  const newAccess = "newAccess";
  let savePermissions;

  beforeEach(() => {
    setLoading = jest.fn();
    setAccess = jest.fn();
    setSeverity = jest.fn();
    setMessage = jest.fn();
    setAlertOpen = jest.fn();
    savePermissions = saveHandler(
      accessControl,
      setLoading,
      setAccess,
      webId,
      setSeverity,
      setMessage,
      setAlertOpen
    );
  });

  test("save is successful", async () => {
    await expect(savePermissions(newAccess)).resolves.toBeUndefined();

    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setAccess).toHaveBeenCalledWith(newAccess);
    expect(accessControl.savePermissionsForAgent).toHaveBeenCalledWith(
      webId,
      newAccess
    );
    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalledWith("Permissions have been updated!");
    expect(setAlertOpen).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  test("save request fails", async () => {
    const error = "error";
    accessControl.savePermissionsForAgent.mockResolvedValue({ error });

    await expect(savePermissions(newAccess)).rejects.toEqual(error);

    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setAccess).toHaveBeenCalledWith(newAccess);
    expect(accessControl.savePermissionsForAgent).toHaveBeenCalledWith(
      webId,
      newAccess
    );
  });
});
