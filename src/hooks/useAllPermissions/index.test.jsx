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

import { renderHook } from "@testing-library/react-hooks";
import useAllPermissions from "./index";
import mockAccessControl from "../../../__testUtils/mockAccessControl";
import * as permissionHelpers from "../../solidClientHelpers/permissions";
import getSignedVc from "../../../__testUtils/mockSignedVc";
import useConsentBasedAccessForResource from "../useConsentBasedAccessForResource";
import { AccessControlProvider } from "../../contexts/accessControlContext";

jest.mock("../useConsentBasedAccessForResource");
const mockedUseConsentBasedAccessForResource = useConsentBasedAccessForResource;

describe("useAllPermissions", () => {
  const { ACL } = permissionHelpers;
  const webId = "webId";
  const permission = {
    webId,
    alias: ACL.CONTROL.alias,
    acl: ACL.CONTROL.acl,
  };
  const accessControl = mockAccessControl({
    permissions: [permission, permission],
  });
  const wrapper = ({ children }) => (
    <AccessControlProvider accessControl={accessControl}>
      {children}
    </AccessControlProvider>
  );
  const vcPermission = {
    type: "agent",
    webId: "https://mockapp.com/app#id",
    alias: "viewers",
    acl: { read: true, write: false, append: false, control: false },
    vc: getSignedVc(),
  };

  it("returns null if no access control", async () => {
    mockedUseConsentBasedAccessForResource.mockReturnValue({
      permissions: [],
    });
    const { result } = renderHook(() => useAllPermissions());
    expect(result.current.permissions).toBeNull();
  });

  it("returns permissions if accessControl is available", async () => {
    mockedUseConsentBasedAccessForResource.mockReturnValue({
      permissions: [getSignedVc()],
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useAllPermissions(),
      { wrapper }
    );

    await waitForNextUpdate();
    expect(result.current.permissions).toEqual([
      permission,
      permission,
      vcPermission,
    ]);
  });
});
