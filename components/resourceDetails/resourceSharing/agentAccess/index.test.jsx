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
import { mountToJson } from "../../../../__testUtils/mountWithTheme";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import mockConfirmationDialogContextProvider from "../../../../__testUtils/mockConfirmationDialogContextProvider";
import * as permissionHelpers from "../../../../src/solidClientHelpers/permissions";

jest.mock("../../../../src/solidClientHelpers/permissions");

describe("AgentAccess", () => {
  const permission = {
    acl: createAccessMap(),
    profile: {
      avatar: "http://example.com/avatar.jpg",
      name: "name",
    },
  };
  const datasetUrl = "http://example.com/dataset";
  const dataset = mockSolidDatasetFrom(datasetUrl);

  it("renders", () => {
    expect(
      mountToJson(
        <DatasetProvider dataset={dataset}>
          <AgentAccess permission={permission} />
        </DatasetProvider>
      )
    ).toMatchSnapshot();
  });

  describe("user tries to change access for themselves", () => {
    let dialogId;
    let setTitle;
    let setContent;
    let setOpen;
    let setConfirmed;

    beforeEach(() => {
      dialogId = getDialogId(datasetUrl);
      setTitle = jest.fn();
      setContent = jest.fn();
      setOpen = jest.fn();
      setConfirmed = jest.fn();
    });

    it("opens a prompt if user tries to change access for themself", () => {
      const ConfirmationDialogProvider = mockConfirmationDialogContextProvider({
        open: dialogId,
        setTitle,
        setContent,
        confirmed: null,
      });
      mountToJson(
        <ConfirmationDialogProvider>
          <DatasetProvider dataset={dataset}>
            <AgentAccess permission={permission} />
          </DatasetProvider>
        </ConfirmationDialogProvider>
      );

      expect(setTitle).toHaveBeenCalledWith("Confirm Access Permissions");
      expect(setContent).toHaveBeenCalled();
    });

    it("handles if user cancels", () => {
      const ConfirmationDialogProvider = mockConfirmationDialogContextProvider({
        open: dialogId,
        setOpen,
        setConfirmed,
        confirmed: false,
      });
      mountToJson(
        <ConfirmationDialogProvider>
          <DatasetProvider dataset={dataset}>
            <AgentAccess permission={permission} />
          </DatasetProvider>
        </ConfirmationDialogProvider>
      );

      expect(setOpen).toHaveBeenCalledWith(null);
      expect(setConfirmed).toHaveBeenCalledWith(null);
    });
  });
});

describe("getDialogId", () => {
  it("generates dialogId", () =>
    expect(getDialogId("foo")).toEqual("change-agent-access-foo"));
});

describe("submitHandler", () => {
  test("user changes their own permissions", () => {
    const setOpen = jest.fn();
    const dialogId = "dialogId";
    submitHandler(42, 42, setOpen, dialogId)();

    expect(setOpen).toHaveBeenCalledWith(dialogId);
  });
  test("user changes someone else's permissions", () => {
    const savePermissions = jest.fn();
    const tempAccess = "tempAccess";
    submitHandler(42, 1337, null, null, savePermissions, tempAccess)();

    expect(savePermissions).toHaveBeenCalledWith(tempAccess);
  });
});

describe("saveHandler", () => {
  let savePermissions;
  let onLoading;
  let setAccess;
  const dataset = "dataset";
  const webId = "webId";
  const fetch = "fetch";
  let setDataset;
  let setTempAccess;
  let setSeverity;
  let setMessage;
  let setAlertOpen;
  const newAccess = "newAccess";

  beforeEach(() => {
    onLoading = jest.fn();
    setAccess = jest.fn();
    setDataset = jest.fn();
    setTempAccess = jest.fn();
    setSeverity = jest.fn();
    setMessage = jest.fn();
    setAlertOpen = jest.fn();
    savePermissions = saveHandler(
      onLoading,
      setAccess,
      dataset,
      webId,
      fetch,
      setDataset,
      setTempAccess,
      setSeverity,
      setMessage,
      setAlertOpen
    );
  });

  test("save is successful", async () => {
    const response = "response";
    jest
      .spyOn(permissionHelpers, "saveAllPermissions")
      .mockResolvedValue({ response });
    await savePermissions(newAccess);
    expect(onLoading).toHaveBeenCalledWith(true);
    expect(setAccess).toHaveBeenCalledWith(newAccess);
    expect(permissionHelpers.saveAllPermissions).toHaveBeenCalledWith(
      dataset,
      webId,
      newAccess,
      fetch
    );
    expect(setDataset).toHaveBeenCalledWith(response);
    expect(setTempAccess).toHaveBeenCalledWith(null);
    expect(setSeverity).toHaveBeenCalledWith("success");
    expect(setMessage).toHaveBeenCalledWith("Permissions have been updated!");
    expect(setAlertOpen).toHaveBeenCalledWith(true);
    expect(onLoading).toHaveBeenCalledWith(false);
  });

  test("save request fails", async () => {
    const error = "error";
    jest
      .spyOn(permissionHelpers, "saveAllPermissions")
      .mockResolvedValue({ error });
    await expect(savePermissions(newAccess)).rejects.toEqual(error);
    expect(onLoading).toHaveBeenCalledWith(true);
    expect(setAccess).toHaveBeenCalledWith(newAccess);
    expect(permissionHelpers.saveAllPermissions).toHaveBeenCalledWith(
      dataset,
      webId,
      newAccess,
      fetch
    );
  });
});
