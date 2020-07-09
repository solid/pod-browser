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

/* eslint-disable camelcase */
import * as ReactFns from "react";
import { mount } from "enzyme";
import { mountToJson } from "enzyme-to-json";
import * as LitPodFns from "@solid/lit-pod";
import { NormalizedPermission } from "../../src/lit-solid-helpers";
import PermissionsForm, {
  setPermissionHandler,
  savePermissionsHandler,
  confirmationDialog,
} from "./index";

describe("PermissionsForm", () => {
  test("Renders a permissions form", () => {
    const iri = "https://mypod.myhost.com";
    const webId = "https://mypod.myhost.com/profile/card#me";
    const permission = {
      webId,
      alias: "Full Control",
      profile: { webId },
      acl: {
        read: true,
        write: true,
        append: true,
        control: false,
      },
    } as NormalizedPermission;

    const setReadPermission = jest.fn();
    const setWritePermission = jest.fn();
    const setAppendPermission = jest.fn();
    const setControlPermission = jest.fn();
    const setSnackbarOpen = jest.fn();
    const setDialogOpen = jest.fn();

    jest
      .spyOn(ReactFns, "useState")
      .mockImplementationOnce(() => [true, setReadPermission])
      .mockImplementationOnce(() => [true, setWritePermission])
      .mockImplementationOnce(() => [true, setAppendPermission])
      .mockImplementationOnce(() => [true, setControlPermission])
      .mockImplementationOnce(() => [false, setDialogOpen])
      .mockImplementationOnce(() => [false, setSnackbarOpen]);

    const tree = mount(
      <PermissionsForm iri={iri} permission={permission} warnOnSubmit={false} />
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });
});

describe("setPermissionHandler", () => {
  test("it creates a toggle function", () => {
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const expectedAccess = {
      read: false,
      write: true,
      append: true,
      control: true,
    };
    const setPermission = jest.fn();
    const toggleFunction = setPermissionHandler(access, "read", setPermission);

    toggleFunction();

    expect(setPermission).toHaveBeenCalledWith(expectedAccess);
  });
});

describe("savePermissionsHandler", () => {
  test("it creates a savePermissions function", async () => {
    const setSnackbarMessage = jest.fn();
    const setSnackbarType = jest.fn();
    const webId = "http://example.com/profile/card#me";
    const iri = "http://example.com";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    } as LitPodFns.unstable_Access;

    const handler = savePermissionsHandler({
      setSnackbarMessage,
      setSnackbarType,
      webId,
      iri,
      access,
    });

    jest
      .spyOn(LitPodFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(jest.fn());

    jest
      .spyOn(LitPodFns, "unstable_getResourceAcl")
      .mockImplementationOnce(jest.fn());

    jest
      .spyOn(LitPodFns, "unstable_setAgentResourceAccess")
      .mockImplementationOnce(jest.fn());
    await handler();

    expect(LitPodFns.unstable_fetchLitDatasetWithAcl).toHaveBeenCalled();
    expect(LitPodFns.unstable_getResourceAcl).toHaveBeenCalled();
    expect(LitPodFns.unstable_setAgentResourceAccess).toHaveBeenCalled();
    expect(setSnackbarMessage).toHaveBeenCalledWith(
      "Your permissions have been saved!"
    );
  });

  test("it show a message if the save errors out", async () => {
    const setSnackbarMessage = jest.fn();
    const setSnackbarType = jest.fn();
    const webId = "http://example.com/profile/card#me";
    const iri = "http://example.com";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    } as LitPodFns.unstable_Access;

    const handler = savePermissionsHandler({
      setSnackbarMessage,
      setSnackbarType,
      webId,
      iri,
      access,
    });

    jest
      .spyOn(LitPodFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(jest.fn());

    jest
      .spyOn(LitPodFns, "unstable_getResourceAcl")
      .mockImplementationOnce(jest.fn());

    jest
      .spyOn(LitPodFns, "unstable_setAgentResourceAccess")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });
    await handler();

    expect(LitPodFns.unstable_fetchLitDatasetWithAcl).toHaveBeenCalled();
    expect(LitPodFns.unstable_getResourceAcl).toHaveBeenCalled();
    expect(LitPodFns.unstable_setAgentResourceAccess).toHaveBeenCalled();
    expect(setSnackbarType).toHaveBeenCalledWith("error");
    expect(setSnackbarMessage).toHaveBeenCalledWith(
      "There was an error saving permissions!"
    );
  });
});

describe("confirmationDialog", () => {
  test("returns null when warn is false", () => {
    const args = {
      warn: false,
      open: false,
      setOpen: jest.fn(),
      onConfirm: jest.fn(),
    };

    expect(confirmationDialog(args)).toBeNull();
  });

  test("it returns a Dialog component when warn is true", () => {
    const args = {
      warn: true,
      open: false,
      setOpen: jest.fn(),
      onConfirm: jest.fn(),
    };

    const component = confirmationDialog(args);
    const tree = mount(component);

    expect(mountToJson(tree)).toMatchSnapshot();
  });
});
