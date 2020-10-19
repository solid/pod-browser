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
import mockSession, { storageUrl } from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import * as accessControlFns from "../../accessControl";
import useRedirectIfNoControlAccessToOwnPod from "./index";
import useResourceInfo from "../useResourceInfo";

jest.mock("next/router");
jest.mock("../../hooks/useResourceInfo");

const resourceInfo = "resourceInfo";

describe("useRedirectIfNoControlAccessToOwnPod", () => {
  let wrapper;

  beforeEach(() => {
    const session = mockSession();
    wrapper = mockSessionContextProvider(session);
    useResourceInfo.mockReturnValue({ data: resourceInfo });
    jest.spyOn(accessControlFns, "hasAccess").mockReturnValue(true);
  });

  it("Do not redirect if user has Control access to Pod", () => {
    renderHook(() => useRedirectIfNoControlAccessToOwnPod(storageUrl), {
      wrapper,
    });

    expect(Router.push).not.toHaveBeenCalled();
  });

  it("redirects if profile do not have Control access to all pods", () => {
    accessControlFns.hasAccess.mockReturnValue(false);

    renderHook(() => useRedirectIfNoControlAccessToOwnPod(storageUrl), {
      wrapper,
    });

    expect(Router.push).toHaveBeenCalledWith("/access-required");
  });
});
