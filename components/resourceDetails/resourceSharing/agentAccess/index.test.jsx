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
import AgentAccess, { getDialogId, saveHandler, submitHandler } from "./index";

import mockSessionContextProvider from "../../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../../__testUtils/mockSession";

import { renderWithTheme } from "../../../../__testUtils/withTheme";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import useFetchProfile from "../../../../src/hooks/useFetchProfile";
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

  it("renders an error message if it's unable to load profile", () => {
    useFetchProfile.mockReturnValue({ error: "error" });
    const { asFragment } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    expect(asFragment()).toMatchSnapshot();
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
