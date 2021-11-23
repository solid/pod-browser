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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import useAccessControl from "./index";
import * as accessControlFns from "../../accessControl";
import usePoliciesContainerUrl from "../usePoliciesContainerUrl";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../__testUtils/mockSession";
import { mockProfileAlice } from "../../../__testUtils/mockPersonResource";
import { joinPath } from "../../stringHelpers";
import useIsLegacyAcp from "../useIsLegacyAcp";

jest.mock("../usePoliciesContainerUrl");
const mockedPoliciesContainerUrlHook = usePoliciesContainerUrl;

jest.mock("../useIsLegacyAcp");
const mockedIsLegacyAcp = useIsLegacyAcp;

describe("useAccessControl", () => {
  const authenticatedProfile = mockProfileAlice();

  const accessControl = "accessControl";
  const resourceUrl = joinPath(authenticatedProfile.pods[0], "test");
  const resourceInfo = mockSolidDatasetFrom(resourceUrl);
  const error = "error";
  const isValidating = false;

  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);
  const wrapper = ({ children }) => (
    <SessionProvider>{children}</SessionProvider>
  );

  beforeEach(() => {
    jest
      .spyOn(accessControlFns, "getAccessControl")
      .mockResolvedValue({ accessControl, error, isValidating });
    mockedPoliciesContainerUrlHook.mockReturnValue(null);
    mockedIsLegacyAcp.mockReturnValue({ data: false });
    jest.spyOn(accessControlFns, "isAcp").mockReturnValue(false);
  });

  it("returns undefined if given no resourceUri", () => {
    const { result } = renderHook(() => useAccessControl(null), {
      wrapper,
    });
    expect(result.current.accessControl).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("returns error if getAccessControl fails", async () => {
    accessControlFns.getAccessControl.mockRejectedValue(error);
    const { result } = renderHook(() => useAccessControl(resourceInfo), {
      wrapper,
    });
    expect(result.current.accessControl).toBeUndefined();
    expect(result.current.error).toBe(error);
    expect(result.current.isValidating).toBeFalsy();
  });

  describe("using ACP", () => {
    const policiesContainerUrl = "policiesContainer";

    beforeEach(() => {
      mockedPoliciesContainerUrlHook.mockReturnValue(policiesContainerUrl);
      jest.spyOn(accessControlFns, "isAcp").mockReturnValue(true);
    });

    it("returns accessControl with latest ACP if given resourceUri", async () => {
      const { result } = renderHook(() => useAccessControl(resourceInfo), {
        wrapper,
      });
      expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
        resourceInfo,
        policiesContainerUrl,
        expect.any(Function),
        false
      );
      expect(result.current.accessControl).toBe(accessControl);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isValidating).toBeFalsy();
    });

    it("returns accessControl with legacy ACP if given resourceUri", async () => {
      mockedIsLegacyAcp.mockReturnValue({ data: true });
      const { result } = renderHook(() => useAccessControl(resourceInfo), {
        wrapper,
      });
      expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
        resourceInfo,
        policiesContainerUrl,
        expect.any(Function),
        true
      );
      expect(result.current.accessControl).toBe(accessControl);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isValidating).toBeFalsy();
    });

    it("returns undefined if policies container url returns null", () => {
      mockedPoliciesContainerUrlHook.mockReturnValue(null);
      const { result } = renderHook(() => useAccessControl(resourceInfo), {
        wrapper,
      });
      expect(result.current.accessControl).toBeUndefined();
      expect(result.current.error).toBeUndefined();
      expect(result.current.isValidating).toBeFalsy();
    });
  });
});
