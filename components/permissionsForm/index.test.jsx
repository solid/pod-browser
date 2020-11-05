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
import PermissionsForm, {
  arrowIcon,
  permissionHandler,
  toggleOpen,
} from "./index";
import { ACL, createAccessMap } from "../../src/solidClientHelpers/permissions";
import { renderWithTheme } from "../../__testUtils/withTheme";

describe("PermissionsForm", () => {
  test("Renders a permissions form", () => {
    const acl = createAccessMap(true, true, true, true);

    const { asFragment } = renderWithTheme(<PermissionsForm acl={acl} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("it returns null if control is false", () => {
    const acl = createAccessMap(true, true, true, false);

    const { asFragment } = renderWithTheme(<PermissionsForm acl={acl} />);
    expect(asFragment()).toMatchSnapshot();
  });

  describe("toggleOpen", () => {
    let setOpen;

    beforeEach(() => {
      setOpen = jest.fn();
    });

    test("it calls setOpen with false is open is true", () => {
      toggleOpen(true, setOpen)();

      expect(setOpen).toHaveBeenCalledWith(false);
    });

    test("it calls setOpen with true is open is false", () => {
      toggleOpen(false, setOpen)();

      expect(setOpen).toHaveBeenCalledWith(true);
    });
  });

  describe("arrowIcon", () => {
    test("it returns the up arrow when open is true", () => {
      const { asFragment } = renderWithTheme(arrowIcon(true));
      expect(asFragment()).toMatchSnapshot();
    });

    test("it returns the down arrow when open is false", () => {
      const { asFragment } = renderWithTheme(arrowIcon(false));
      expect(asFragment()).toMatchSnapshot();
    });
  });
});

describe("permissionHandler", () => {
  it("updates access map", () => {
    const access = createAccessMap(true, true);
    const setAccess = jest.fn();
    const onChange = jest.fn();

    const setPermissionHandler = permissionHandler(access, setAccess, onChange);
    setPermissionHandler(ACL.READ.key)();

    expect(setAccess).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });
});
