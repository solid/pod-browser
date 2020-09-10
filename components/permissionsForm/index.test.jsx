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
import React from "react";
import { mount } from "enzyme";
import { mountToJson } from "enzyme-to-json";
import * as SolidClientfns from "@inrupt/solid-client";
import PermissionsForm, {
  setPermissionHandler,
  savePermissionsHandler,
  saveHandler,
  toggleOpen,
  arrowIcon,
} from "./index";
import mockAlertContextProvider from "../../__testUtils/mockAlertContextProvider";
import mockConfirmationDialogContextProvider from "../../__testUtils/mockConfirmationDialogContextProvider";

describe("PermissionsForm", () => {
  const iri = "https://mypod.myhost.com";
  const webId = "https://mypod.myhost.com/profile/card#me";

  let AlertContextProvider;
  let setAlertOpen;
  let setMessage;
  let setSeverity;

  let setTitle;
  let setOpen;
  let setContent;
  let setConfirmed;

  beforeEach(() => {
    setAlertOpen = jest.fn();
    setMessage = jest.fn();
    setSeverity = jest.fn();
    AlertContextProvider = mockAlertContextProvider({
      setAlertOpen,
      setMessage,
      setSeverity,
    });

    setTitle = jest.fn();
    setOpen = jest.fn();
    setContent = jest.fn();
    setConfirmed = jest.fn();
  });

  test("Renders a permissions form", () => {
    const permission = {
      webId,
      alias: "Control",
      profile: { webId },
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
    };

    const tree = mount(
      <PermissionsForm iri={iri} permission={permission} warnOnSubmit={false} />
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("it returns null if control is false", () => {
    const permission = {
      webId,
      alias: "Control",
      profile: { webId },
      acl: {
        read: true,
        write: true,
        append: true,
        control: false,
      },
    };

    const tree = mount(
      <PermissionsForm iri={iri} permission={permission} warnOnSubmit={false} />
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("it sets up the confirmation dialog", () => {
    const permission = {
      webId,
      alias: "Control",
      profile: { webId },
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
    };

    const ConfirmationDialogProvider = mockConfirmationDialogContextProvider({
      setTitle,
      setOpen,
      setContent,
      setConfirmed,
    });

    mount(
      <AlertContextProvider>
        <ConfirmationDialogProvider>
          <PermissionsForm
            iri={iri}
            permission={permission}
            warnOnSubmit={false}
          />
        </ConfirmationDialogProvider>
      </AlertContextProvider>
    );

    expect(setTitle).toHaveBeenCalledWith("Confirm Access Permissions");
    expect(setContent).toHaveBeenCalledWith(
      <p>
        You are about to change your own access to this resource, are you sure
        you wish to continue?
      </p>
    );
  });

  test("it saves the permissions when confirmed is true", () => {
    const permission = {
      webId,
      alias: "Control",
      profile: { webId },
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
    };

    jest
      .spyOn(SolidClientfns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce({});

    jest.spyOn(SolidClientfns, "getResourceAcl").mockResolvedValueOnce({});

    jest
      .spyOn(SolidClientfns, "setAgentResourceAccess")
      .mockResolvedValueOnce({});

    const ConfirmationDialogProvider = mockConfirmationDialogContextProvider({
      setTitle,
      setOpen,
      setContent,
      setConfirmed,
      confirmed: true,
    });

    mount(
      <AlertContextProvider>
        <ConfirmationDialogProvider>
          <PermissionsForm
            iri={iri}
            permission={permission}
            warnOnSubmit={false}
          />
        </ConfirmationDialogProvider>
      </AlertContextProvider>
    );

    expect(setOpen).toHaveBeenCalledWith(false);
    expect(setConfirmed).toHaveBeenCalledWith(false);
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
      const toggleFunction = setPermissionHandler(
        access,
        "read",
        setPermission
      );

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
      };
      const setDialogOpen = jest.fn();
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
      };
      const setDialogOpen = jest.fn();
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
      const open = true;

      const toggle = toggleOpen(open, setOpen);
      toggle();

      expect(setOpen).toHaveBeenCalledWith(false);
    });

    test("it calls setOpen with true is open is false", () => {
      const open = false;

      const toggle = toggleOpen(open, setOpen);
      toggle();

      expect(setOpen).toHaveBeenCalledWith(true);
    });
  });

  describe("arrowIcon", () => {
    test("it returns the up arrow when open is true", () => {
      const icon = arrowIcon(true);
      const tree = mount(icon);

      expect(mountToJson(tree)).toMatchSnapshot();
    });

    test("it returns the down arrow when open is false", () => {
      const icon = arrowIcon(false);
      const tree = mount(icon);

      expect(mountToJson(tree)).toMatchSnapshot();
    });
  });
});
