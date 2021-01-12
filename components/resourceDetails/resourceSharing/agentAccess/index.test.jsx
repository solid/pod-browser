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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AgentAccess, { getDialogId, saveHandler, submitHandler } from "./index";

import mockSessionContextProvider from "../../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../../__testUtils/mockSession";

import { renderWithTheme } from "../../../../__testUtils/withTheme";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import useFetchProfile from "../../../../src/hooks/useFetchProfile";
import * as profileFns from "../../../../src/solidClientHelpers/profile";
import { mockProfileAlice } from "../../../../__testUtils/mockPersonResource";

jest.mock("../../../../src/solidClientHelpers/permissions");
jest.mock("../../../../src/hooks/useFetchProfile");

const webId = "http://example.com/webId#me";

describe("AgentAccess", () => {
  const permission = {
    acl: createAccessMap(),
    webId,
  };
  const datasetUrl = "http://example.com/dataset";
  const dataset = mockSolidDatasetFrom(datasetUrl);

  beforeEach(() => {
    useFetchProfile.mockReturnValue({ data: mockProfileAlice() });
  });

  it("renders", () => {
    const { asFragment } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("fetches profile for webId", () => {
    renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    expect(useFetchProfile).toHaveBeenCalledWith(webId);
  });

  it("renders skeleton placeholders when profile is not available", () => {
    useFetchProfile.mockReturnValue({ profile: null });
    const { asFragment } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an error message with a 'try again' button if it's unable to load profile", () => {
    useFetchProfile.mockReturnValue({ error: "error" });
    const { asFragment, getByTestId } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    expect(getByTestId("try-again-button")).toBeTruthy();
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a spinner after clicking 'try again' button", async () => {
    useFetchProfile.mockReturnValue({ error: "error" });
    const { getByTestId } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    expect(getByTestId("try-again-spinner")).toBeTruthy();
  });

  it("tries to fetch the profile again when clicking 'try again' button", async () => {
    useFetchProfile.mockReturnValue({ error: "error" });
    const fetchProfile = jest.spyOn(profileFns, "fetchProfile");
    const { getByTestId } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    await waitFor(() =>
      expect(fetchProfile).toHaveBeenCalledWith(webId, expect.anything())
    );
  });

  it("removes the spinner when fetching succeeds", async () => {
    useFetchProfile.mockReturnValue({ error: "error" });
    const fetchProfile = jest.spyOn(profileFns, "fetchProfile");
    fetchProfile.mockReturnValue("profile");
    const { getByTestId, queryByTestId } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    await waitFor(() => expect(queryByTestId("try-again-spinner")).toBeFalsy());
  });

  it("removes the spinner when fetching errors", async () => {
    useFetchProfile.mockReturnValue({ error: "error" });
    const fetchProfile = jest.spyOn(profileFns, "fetchProfile");
    fetchProfile.mockReturnValue("profile");
    const { getByTestId, queryByTestId } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    const button = getByTestId("try-again-button");
    userEvent.click(button);

    await waitFor(() =>
      expect(fetchProfile).toHaveBeenCalledWith(webId, expect.anything())
    );
    await waitFor(() => expect(queryByTestId("try-again-spinner")).toBeFalsy());
  });

  describe("user tries to change access for themselves", () => {
    it("checkboxes are disabled", () => {
      const session = mockSession();
      const SessionProvider = mockSessionContextProvider(session);

      const { asFragment } = renderWithTheme(
        <SessionProvider>
          <DatasetProvider dataset={dataset}>
            <AgentAccess permission={permission} webId={session.info.webId} />
          </DatasetProvider>
        </SessionProvider>
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });

  test("default value for onLoading", async () => {
    useFetchProfile.mockReturnValue({ error: "error" });
    const { getByTestId } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} onLoading={undefined} />
      </DatasetProvider>
    );
    const button = getByTestId("try-again-button");
    const { onLoading } = AgentAccess.defaultProps;
    userEvent.click(button);

    expect(onLoading).toBeInstanceOf(Function);
  });
});

describe("getDialogId", () => {
  it("generates dialogId", () =>
    expect(getDialogId("foo")).toEqual("change-agent-access-foo"));
});

describe("submitHandler", () => {
  let event;

  beforeEach(() => {
    event = { preventDefault: jest.fn() };
  });

  test("user changes their own permissions", () => {
    const setOpen = jest.fn();
    const dialogId = "dialogId";
    submitHandler(42, 42, setOpen, dialogId)(event);

    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setOpen).toHaveBeenCalledWith(dialogId);
  });
  test("user changes someone else's permissions", () => {
    const savePermissions = jest.fn();
    const tempAccess = "tempAccess";
    submitHandler(42, 1337, null, null, savePermissions, tempAccess)(event);

    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(savePermissions).toHaveBeenCalledWith(tempAccess);
  });
});

describe("saveHandler", () => {
  const accessControl = {
    savePermissionsForAgent: jest.fn().mockResolvedValue({}),
  };
  let onLoading;
  let setAccess;
  let setTempAccess;
  let setSeverity;
  let setMessage;
  let setAlertOpen;
  const newAccess = "newAccess";
  let savePermissions;

  beforeEach(() => {
    onLoading = jest.fn();
    setAccess = jest.fn();
    setTempAccess = jest.fn();
    setSeverity = jest.fn();
    setMessage = jest.fn();
    setAlertOpen = jest.fn();
    savePermissions = saveHandler(
      accessControl,
      onLoading,
      setAccess,
      webId,
      setTempAccess,
      setSeverity,
      setMessage,
      setAlertOpen
    );
  });

  test("save is successful", async () => {
    await expect(savePermissions(newAccess)).resolves.toBeUndefined();

    expect(onLoading).toHaveBeenCalledWith(true);
    expect(setAccess).toHaveBeenCalledWith(newAccess);
    expect(accessControl.savePermissionsForAgent).toHaveBeenCalledWith(
      webId,
      newAccess
    );
    expect(setTempAccess).toHaveBeenCalledWith(null);
    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalledWith("Permissions have been updated!");
    expect(setAlertOpen).toHaveBeenCalledWith(true);
    expect(onLoading).toHaveBeenCalledWith(false);
  });

  test("save request fails", async () => {
    const error = "error";
    accessControl.savePermissionsForAgent.mockResolvedValue({ error });

    await expect(savePermissions(newAccess)).rejects.toEqual(error);

    expect(onLoading).toHaveBeenCalledWith(true);
    expect(setAccess).toHaveBeenCalledWith(newAccess);
    expect(accessControl.savePermissionsForAgent).toHaveBeenCalledWith(
      webId,
      newAccess
    );
  });
});
