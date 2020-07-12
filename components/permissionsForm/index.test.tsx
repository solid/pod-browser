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
  PermissionCheckbox,
  saveHandler,
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
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    } as LitPodFns.unstable_Access;
    const iri = "http://example.com";
    const setAlertOpen = jest.fn();
    const setDialogOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const webId = "http://example.com/profile/card#me";

    const handler = savePermissionsHandler({
      access,
      iri,
      setMessage,
      setSeverity,
      setDialogOpen,
      setAlertOpen,
      webId,
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

    expect(setDialogOpen).toHaveBeenCalledWith(false);
    expect(setMessage).toHaveBeenCalledWith(
      "Your permissions have been saved!"
    );
    expect(setAlertOpen).toHaveBeenCalledWith(true);
  });

  test("it show a message if the save errors out", async () => {
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    } as LitPodFns.unstable_Access;
    const iri = "http://example.com";
    const setAlertOpen = jest.fn();
    const setDialogOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const webId = "http://example.com/profile/card#me";

    const handler = savePermissionsHandler({
      access,
      iri,
      setMessage,
      setSeverity,
      setDialogOpen,
      setAlertOpen,
      webId,
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

    expect(setDialogOpen).toHaveBeenCalledWith(false);
    expect(setSeverity).toHaveBeenCalledWith("error");
    expect(setMessage).toHaveBeenCalledWith(
      "There was an error saving permissions!"
    );
    expect(setAlertOpen).toHaveBeenCalledWith(true);
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
    const tree = mount(component as React.ReactElement);

    expect(mountToJson(tree)).toMatchSnapshot();
  });
});

describe("PermissionCheckbox", () => {
  test("it renders a permission checkbox", () => {
    const onChange = jest.fn();
    const classes = {
      listItem: "listItem",
      label: "label",
      checkbox: "checkbox",
    };
    const label = "Read";
    const value = true;

    const tree = mount(
      <PermissionCheckbox
        value={value}
        classes={classes}
        label={label}
        onChange={onChange}
      />
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });
});

describe("saveHandler", () => {
  test("it opens the dialog if warnOnSubmit is true", async () => {
    const args = {
      savePermissions: jest.fn(),
      setDialogOpen: jest.fn(),
      warnOnSubmit: true,
    };

    const handler = saveHandler(args);

    await handler();

    expect(args.setDialogOpen).toHaveBeenCalledWith(true);
  });

  test("it saves the permissions, and shows an alert when warnOnSubmit is false", async () => {
    const args = {
      savePermissions: jest.fn(),
      setDialogOpen: jest.fn(),
      warnOnSubmit: false,
    };

    const handler = saveHandler(args);

    await handler();

    expect(args.setDialogOpen).toHaveBeenCalledWith(false);
    expect(args.savePermissions).toHaveBeenCalled();
  });
});
