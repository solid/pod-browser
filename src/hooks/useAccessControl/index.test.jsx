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
import { useSession } from "@inrupt/solid-ui-react";
import useAccessControl from "./index";
import * as accessControlFns from "../../accessControl";
import usePoliciesContainerUrl from "../usePoliciesContainerUrl";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../__testUtils/mockSession";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import { mockProfileAlice } from "../../../__testUtils/mockPersonResource";
import { joinPath } from "../../stringHelpers";

jest.mock("../usePoliciesContainerUrl");
const mockedPoliciesContainerUrlHook = usePoliciesContainerUrl;

jest.mock("../useAuthenticatedProfile");
const mockedAuthenticatedProfileHook = useAuthenticatedProfile;

jest.mock("@inrupt/solid-ui-react");
const mockedUseSession = useSession;

describe("useAccessControl", () => {
  const authenticatedProfile = mockProfileAlice();

  const accessControl = "accessControl";
  const resourceUrl = joinPath(authenticatedProfile.pods[0], "test");
  const resourceInfo = mockSolidDatasetFrom(resourceUrl);
  const error = "error";

  let session;
  let wrapper;

  beforeEach(() => {
    jest
      .spyOn(accessControlFns, "getAccessControl")
      .mockResolvedValue(accessControl);
    mockedPoliciesContainerUrlHook.mockReturnValue(null);
    session = mockSession();
    wrapper = mockSessionContextProvider(session);
    mockedUseSession.mockReturnValue(session);
    jest.spyOn(accessControlFns, "isAcp").mockReturnValue(false);
    mockedAuthenticatedProfileHook.mockReturnValue({
      data: authenticatedProfile,
    });
  });

  it("returns null if given no resourceUri", () => {
    const { result } = renderHook(() => useAccessControl(null), {
      wrapper,
    });
    expect(result.current.accessControl).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("sets accessControl and error to null while loading", async () => {
    const { rerender, result, waitForNextUpdate } = renderHook(
      () => useAccessControl(resourceInfo),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.accessControl).not.toBeNull();
    rerender(resourceInfo + 2);
    expect(result.all[0].accessControl).toBeNull(); // checking that the first render sets accessControl to null
    expect(result.current.error).toBeNull();
  });

  it("returns error if getAccessControl fails", async () => {
    accessControlFns.getAccessControl.mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(
      () => useAccessControl(resourceInfo),
      { wrapper }
    );
    await waitForNextUpdate();
    expect(result.current.accessControl).toBeNull();
    expect(result.current.error).toBe(error);
  });

  describe("using WAC", () => {
    it("returns accessControl if given resourceUri", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAccessControl(resourceInfo),
        { wrapper }
      );
      await waitForNextUpdate();
      expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
        resourceInfo,
        null,
        expect.any(Function)
      );
      expect(result.current.accessControl).toBe(accessControl);
      expect(result.current.error).toBeNull();
    });
  });

  describe("using ACP", () => {
    const policiesContainerUrl = "policiesContainer";

    beforeEach(() => {
      mockedPoliciesContainerUrlHook.mockReturnValue(policiesContainerUrl);
      jest.spyOn(accessControlFns, "isAcp").mockReturnValue(true);
    });

    it("returns accessControl if given resourceUri", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useAccessControl(resourceInfo),
        { wrapper }
      );
      await waitForNextUpdate();
      expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
        resourceInfo,
        policiesContainerUrl,
        expect.any(Function)
      );
      expect(result.current.accessControl).toBe(accessControl);
      expect(result.current.error).toBeNull();
    });

    it("returns null if given usePolicies return null", async () => {
      const { result } = renderHook(() => useAccessControl(resourceInfo), {
        wrapper,
      });
      expect(result.current.accessControl).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
