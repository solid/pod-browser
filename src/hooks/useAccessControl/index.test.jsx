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
import { waitFor } from "@testing-library/dom";
import useSWR from "swr";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
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

jest.mock("@inrupt/solid-ui-react", () => {
  const uiReactModule = jest.requireActual("@inrupt/solid-ui-react");
  return {
    SessionContext: uiReactModule.SessionContext,
    useSession: jest.fn(),
  };
});
const mockedUseSession = useSession;

jest.mock("swr");
const mockedSwrHook = useSWR;

describe("useAccessControl", () => {
  const authenticatedProfile = mockProfileAlice();

  const accessControl = "accessControl";
  const resourceUrl = joinPath(authenticatedProfile.pods[0], "test");
  const resourceInfo = mockSolidDatasetFrom(resourceUrl);
  const error = "error";

  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);
  const wrapper = ({ children }) => (
    <SessionProvider>{children}</SessionProvider>
  );

  const swrResponse = "response";
  beforeEach(() => {
    jest
      .spyOn(accessControlFns, "getAccessControl")
      .mockResolvedValue(accessControl);
    mockedPoliciesContainerUrlHook.mockReturnValue("policiesContainer");
    jest.spyOn(accessControlFns, "isAcp").mockReturnValue(false);
    mockedUseSession.mockReturnValue({ session });
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  it("returns undefined if given no resourceInfo", async () => {
    mockedIsLegacyAcp.mockReturnValue({ data: false });
    const { result } = renderHook(() => useAccessControl(null), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  it("returns error if getAccessControl fails", async () => {
    mockedIsLegacyAcp.mockReturnValue({ data: false });
    jest
      .spyOn(accessControlFns, "getAccessControl")
      .mockRejectedValueOnce(error);
    renderHook(() => useAccessControl(resourceInfo), {
      wrapper,
    });
    await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(error);
  });

  describe("using latest ACP", () => {
    const policiesContainerUrl = "policiesContainer";
    beforeEach(() => {
      mockedPoliciesContainerUrlHook.mockReturnValue(policiesContainerUrl);
      mockedIsLegacyAcp.mockReturnValue({ data: false });
      jest.spyOn(accessControlFns, "isAcp").mockReturnValue(true);
      mockedUseSession.mockReturnValue({ session });
      mockedSwrHook.mockReturnValue(swrResponse);
    });

    it("returns accessControl with latest ACP if given resourceUri", async () => {
      mockedPoliciesContainerUrlHook.mockReturnValue(policiesContainerUrl);
      renderHook(() => useAccessControl(resourceInfo), {
        wrapper,
      });
      await expect(useSWR.mock.calls[0][1]()).resolves.toBe(accessControl);
      expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
        resourceInfo,
        policiesContainerUrl,
        expect.any(Function),
        false
      );
      expect(useSWR).toHaveBeenCalledWith(
        ["useAccessControl", resourceInfo, session.fetch, policiesContainerUrl],
        expect.any(Function),
        {}
      );
    });

    it("returns undefined if policies container url returns null", async () => {
      mockedPoliciesContainerUrlHook.mockReturnValueOnce(null);
      const { result } = renderHook(() => useAccessControl(resourceInfo), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.accessControl).toBeUndefined();
        expect(result.current.error).toBeUndefined();
        expect(result.current.isValidating).toBeFalsy();
      });
    });
  });

  describe("using legacy ACP", () => {
    const policiesContainerUrl = "policiesContainer";
    beforeEach(() => {
      mockedPoliciesContainerUrlHook.mockReturnValue(policiesContainerUrl);
      mockedIsLegacyAcp.mockReturnValue({ data: true });
      jest.spyOn(accessControlFns, "isAcp").mockReturnValue(true);
      jest
        .spyOn(accessControlFns, "getAccessControl")
        .mockResolvedValue(accessControl);
      mockedUseSession.mockReturnValue({ session });
      mockedSwrHook.mockReturnValue(swrResponse);
    });

    it("returns accessControl with legacy ACP if given resourceUri", async () => {
      mockedPoliciesContainerUrlHook.mockReturnValue(policiesContainerUrl);
      mockedIsLegacyAcp.mockReturnValue({ data: true });
      renderHook(() => useAccessControl(resourceInfo), {
        wrapper,
      });
      await expect(useSWR.mock.calls[0][1]()).resolves.toBe(accessControl);
      expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
        resourceInfo,
        policiesContainerUrl,
        expect.any(Function),
        true
      );
      expect(useSWR).toHaveBeenCalledWith(
        ["useAccessControl", resourceInfo, session.fetch, policiesContainerUrl],
        expect.any(Function),
        {}
      );
    });
  });
});
