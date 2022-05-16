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
import { act } from "@testing-library/react-hooks";
import { foaf } from "rdf-namespaces";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as routerFns from "next/router";
import AgentAccess, {
  getDialogId,
  OWN_PERMISSIONS_WARNING_PERMISSION,
  saveHandler,
  submitHandler,
  TESTCAFE_ID_PERMISSIONS_FORM_SUBMIT_BUTTON,
} from "./index";
import mockSessionContextProvider from "../../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../../__testUtils/mockSession";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import { joinPath } from "../../../../src/stringHelpers";
import {
  TESTCAFE_ID_CONFIRMATION_DIALOG,
  TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT,
} from "../../../confirmationDialog";
import { ConfirmationDialogProvider } from "../../../../src/contexts/confirmationDialogContext";
import useFullProfile from "../../../../src/hooks/useFullProfile";

jest.mock("../../../../src/solidClientHelpers/permissions");
jest.mock("../../../../src/hooks/useFullProfile");

const webId = "http://alice.example.com/alice#me";

describe("AgentAccess", () => {
  const permission = {
    acl: createAccessMap(),
    webId,
  };
  const readPermission = {
    acl: createAccessMap(true),
    webId,
  };
  const authUser = {
    names: ["Alice"],
    webId,
    types: [foaf.Person],
    avatars: ["http://alice.example.com/alice.jpg"],
    roles: [],
    pods: ["http://alice.example.com/pod/"],
    organizations: [],
    contactInfo: {
      phones: [],
      emails: [],
    },
  };
  const datasetUrl = joinPath(authUser.pods[0], "dataset");
  const dataset = mockSolidDatasetFrom(datasetUrl);

  let mockedRouterHook;

  beforeEach(() => {
    useFullProfile.mockReturnValue(authUser);
    mockedRouterHook = jest
      .spyOn(routerFns, "useRouter")
      .mockReturnValue({ query: { iri: datasetUrl } });
  });

  it("renders", async () => {
    const { asFragment, getByText } = renderWithTheme(
      <DatasetProvider solidDataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    await waitFor(() => {
      expect(getByText("Alice")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("fetches profile for webId", async () => {
    renderWithTheme(
      <DatasetProvider solidDataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    await waitFor(() => {
      expect(useFullProfile).toHaveBeenCalledWith(webId);
    });
  });

  it("renders skeleton placeholders when profile is not available", async () => {
    useFullProfile.mockReturnValue(undefined);
    const { asFragment, queryByText } = renderWithTheme(
      <DatasetProvider solidDataset={dataset}>
        <AgentAccess permission={permission} />
      </DatasetProvider>
    );
    await waitFor(() => {
      expect(queryByText("Alice")).not.toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  describe("user tries to change access for themselves", () => {
    it("checkboxes are disabled", async () => {
      const session = mockSession({ webId });
      const SessionProvider = mockSessionContextProvider(session);

      const { asFragment, queryAllByTestId } = renderWithTheme(
        <SessionProvider>
          <DatasetProvider solidDataset={dataset}>
            <AgentAccess permission={permission} />
          </DatasetProvider>
        </SessionProvider>
      );
      await waitFor(() => {
        expect(queryAllByTestId("permission-checkbox-edit")).toHaveLength(1);
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it("checkboxes are only disabled if the resource is connected to user's Pod", async () => {
      const randomUrl = "http://some-random-pod.com";
      mockedRouterHook.mockReturnValue({ query: { iri: randomUrl } });
      const session = mockSession({ webId });
      const SessionProvider = mockSessionContextProvider(session);

      const { asFragment, queryAllByTestId } = renderWithTheme(
        <SessionProvider>
          <DatasetProvider solidDataset={dataset}>
            <AgentAccess permission={permission} />
          </DatasetProvider>
        </SessionProvider>
      );
      await waitFor(() => {
        expect(queryAllByTestId("permission-checkbox-edit")).toHaveLength(1);
      });
      expect(asFragment()).toMatchSnapshot();
    });

    it("displays a confirmation dialog with correct content for a resource not connected to the user's Pod", async () => {
      const randomUrl = "http://some-random-pod.com";
      mockedRouterHook.mockReturnValue({ query: { iri: randomUrl } });
      const session = mockSession({ webId });
      const SessionProvider = mockSessionContextProvider(session);

      const { getAllByRole, getByTestId } = renderWithTheme(
        <SessionProvider>
          <DatasetProvider solidDataset={dataset}>
            <ConfirmationDialogProvider>
              <AgentAccess permission={readPermission} />
            </ConfirmationDialogProvider>
          </DatasetProvider>
        </SessionProvider>
      );
      const dropdownButton = getByTestId("permissions-dropdown-button");
      userEvent.click(dropdownButton);
      const checkbox = getAllByRole("checkbox")[0];
      userEvent.click(checkbox);
      const submitButton = getByTestId(
        TESTCAFE_ID_PERMISSIONS_FORM_SUBMIT_BUTTON
      );
      userEvent.click(submitButton);
      await waitFor(() => {
        expect(
          getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
        ).toBeInTheDocument();
        expect(
          getByTestId(TESTCAFE_ID_CONFIRMATION_DIALOG_CONTENT)
        ).toHaveTextContent(OWN_PERMISSIONS_WARNING_PERMISSION);
      });
    });
  });
});

describe("getDialogId", () => {
  it("generates dialogId", () =>
    expect(getDialogId("foo")).toEqual("change-agent-access-foo"));
});

describe("submitHandler", () => {
  const tempAccess = "tempAccess";
  const dialogId = "dialogId";

  let event;
  let savePermissions;
  let setOpen;
  let setContent;

  beforeEach(() => {
    event = { preventDefault: jest.fn() };
    savePermissions = jest.fn();
    setOpen = jest.fn();
    setContent = jest.fn();
  });

  it("handles when a user changes their own permissions", () => {
    submitHandler(
      42,
      42,
      setOpen,
      dialogId,
      savePermissions,
      tempAccess,
      setContent
    )(event);

    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setOpen).toHaveBeenCalledWith(dialogId);
    expect(setContent).toHaveBeenCalledWith(
      "You are about to change your own permissions. Are you sure?"
    );
  });

  it("handles when a user changes someone else's permissions", () => {
    submitHandler(
      42,
      1337,
      setOpen,
      dialogId,
      savePermissions,
      tempAccess,
      setContent
    )(event);

    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(setOpen).not.toHaveBeenCalled();
    expect(savePermissions).toHaveBeenCalledWith(tempAccess);
    expect(setContent).not.toHaveBeenCalled();
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

  it("handles when a save is successful", async () => {
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

  it("handles when a save request fails", async () => {
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
