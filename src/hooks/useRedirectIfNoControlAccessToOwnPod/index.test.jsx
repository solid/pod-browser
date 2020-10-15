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
import Router from "next/router";
import React from "react";
import mockSession, { storageUrl } from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import * as accessControlFns from "../../accessControl";
import useRedirectIfNoControlAccessToOwnPod from "./index";
import useResourceInfo from "../useResourceInfo";
import usePolicies from "../usePolicies";

jest.mock("next/router");
jest.mock("../../hooks/useResourceInfo");
jest.mock("../../hooks/usePolicies");

const resourceInfo = "resourceInfo";
const policies = "policies";

describe("useRedirectIfNoControlAccessToOwnPod", () => {
  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);

  const wrapper = ({ children }) => (
    <SessionProvider>{children}</SessionProvider>
  );

  beforeEach(() => {
    useResourceInfo.mockReturnValue({ data: resourceInfo });
    usePolicies.mockReturnValue({ policies });
    jest
      .spyOn(accessControlFns, "getAccessControl")
      .mockResolvedValue({ hasAccess: () => true });
  });

  it("makes request to getAccessControl", async () => {
    const { waitForNextUpdate } = renderHook(
      () => useRedirectIfNoControlAccessToOwnPod(storageUrl),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
      resourceInfo,
      policies,
      expect.any(Function)
    );
  });

  test("Do not get redirected if user has Control access to Pod", async () => {
    const { waitForNextUpdate } = renderHook(
      () => useRedirectIfNoControlAccessToOwnPod(storageUrl),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(Router.push).not.toHaveBeenCalled();
  });

  test("Gets redirected if profile do not have Control access to all pods", async () => {
    jest
      .spyOn(accessControlFns, "getAccessControl")
      .mockResolvedValue({ hasAccess: () => false });

    const { waitForNextUpdate } = renderHook(
      () => useRedirectIfNoControlAccessToOwnPod(storageUrl),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(Router.push).toHaveBeenCalled();
  });
});
