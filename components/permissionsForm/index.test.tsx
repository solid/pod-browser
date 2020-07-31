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
import * as SolidClientfns from "@inrupt/solid-client";
import { NormalizedPermission } from "../../src/solidClientHelpers";
import PermissionsForm, {
  setPermissionHandler,
  savePermissionsHandler,
  PermissionCheckbox,
  saveHandler,
  toggleOpen,
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
        control: true,
      },
    } as NormalizedPermission;

    const tree = mount(
      <PermissionsForm iri={iri} permission={permission} warnOnSubmit={false} />
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("it returns null if control is false", () => {
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

    const tree = mount(
      <PermissionsForm iri={iri} permission={permission} warnOnSubmit={false} />
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("it sets up the confirmation dialog", () => {
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
        control: true,
      },
    } as NormalizedPermission;

    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const setAlertOpen = jest.fn();
    const setTitle = jest.fn();
    const setOpen = jest.fn();
    const setContent = jest.fn();
    const setConfirmed = jest.fn();
    const setAccess = jest.fn();
    const setConfirmationSetup = jest.fn();
    const setFormOpen = jest.fn();

    jest
      .spyOn(ReactFns, "useContext")
      .mockReturnValueOnce({ setMessage, setSeverity, setAlertOpen })
      .mockReturnValueOnce({
        setTitle,
        setOpen,
        setContent,
        setConfirmed,
        confirmed: false,
      });

    jest
      .spyOn(ReactFns, "useState")
      .mockReturnValueOnce([permission.acl, setAccess])
      .mockReturnValueOnce([false, setFormOpen])
      .mockReturnValueOnce([false, setConfirmationSetup]);

    jest.spyOn(ReactFns, "useEffect");

    mount(
      <PermissionsForm iri={iri} permission={permission} warnOnSubmit={false} />
    );

    expect(setTitle).toHaveBeenCalledWith("Confirm Access Permissions");
    expect(setContent).toHaveBeenCalledWith(
      <p>
        You are about to change your own access to this resource, are you sure
        you wish to continue?
      </p>
    );
    expect(setConfirmationSetup).toHaveBeenCalledWith(true);
  });

  test("it saves the permissions when confirmed is true", () => {
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
        control: true,
      },
    } as NormalizedPermission;

    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const setAlertOpen = jest.fn();
    const setTitle = jest.fn();
    const setOpen = jest.fn();
    const setContent = jest.fn();
    const setConfirmed = jest.fn();
    const setAccess = jest.fn();
    const setConfirmationSetup = jest.fn();
    const setFormOpen = jest.fn();

    jest
      .spyOn(SolidClientfns, "unstable_fetchLitDatasetWithAcl")
      .mockResolvedValueOnce({});

    jest
      .spyOn(SolidClientfns, "unstable_getResourceAcl")
      .mockResolvedValueOnce({});

    jest
      .spyOn(SolidClientfns, "unstable_setAgentResourceAccess")
      .mockResolvedValueOnce({});

    jest
      .spyOn(ReactFns, "useContext")
      .mockReturnValueOnce({ setMessage, setSeverity, setAlertOpen })
      .mockReturnValueOnce({
        setTitle,
        setOpen,
        setContent,
        setConfirmed,
        confirmed: true,
      });

    jest
      .spyOn(ReactFns, "useState")
      .mockReturnValueOnce([permission.acl, setAccess])
      .mockReturnValueOnce([false, setFormOpen])
      .mockReturnValueOnce([false, setConfirmationSetup]);

    jest.spyOn(ReactFns, "useEffect");

    mount(
      <PermissionsForm iri={iri} permission={permission} warnOnSubmit={false} />
    );

    expect(setOpen).toHaveBeenCalledWith(false);
    expect(setConfirmed).toHaveBeenCalledWith(false);
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
    } as SolidClientfns.unstable_Access;
    const setAlertOpen = jest.fn();
    const setDialogOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const onSave = jest.fn().mockResolvedValueOnce({ response: {} });
    const handler = savePermissionsHandler({
      access,
      onSave,
      setAlertOpen,
      setDialogOpen,
      setMessage,
      setSeverity,
    });

    await handler();

    expect(onSave).toHaveBeenCalledWith(access);
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
    } as SolidClientfns.unstable_Access;
    const setAlertOpen = jest.fn();
    const setDialogOpen = jest.fn();
    const setMessage = jest.fn();
    const setSeverity = jest.fn();
    const onSave = jest.fn().mockResolvedValueOnce({ error: "boom" });

    const handler = savePermissionsHandler({
      access,
      onSave,
      setMessage,
      setSeverity,
      setDialogOpen,
      setAlertOpen,
    });

    await handler();

    expect(setDialogOpen).toHaveBeenCalledWith(false);
    expect(setSeverity).toHaveBeenCalledWith("error");
    expect(setMessage).toHaveBeenCalledWith("boom");
    expect(setAlertOpen).toHaveBeenCalledWith(true);
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

    expect(args.savePermissions).toHaveBeenCalled();
  });
});

describe("toggleOpen", () => {
  test("it calls setOpen with false is open is true", () => {
    const setOpen = jest.fn();
    const open = true;

    const toggle = toggleOpen(open, setOpen);
    toggle();

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  test("it calls setOpen with true is open is false", () => {
    const setOpen = jest.fn();
    const open = false;

    const toggle = toggleOpen(open, setOpen);
    toggle();

    expect(setOpen).toHaveBeenCalledWith(true);
  });
});
