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
import { acp_v1 as acp } from "@inrupt/solid-client";
import usePoliciesContainer from "./index";
import mockSession, { storageUrl } from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { getPoliciesContainerUrl } from "../../accessControl/acp";

import * as resourceHelperFns from "../../solidClientHelpers/resource";
import useResourceInfo from "../useResourceInfo";

jest.mock("../useResourceInfo");

describe("usePoliciesContainer", () => {
  const response = "response";
  const error = "error";
  const policiesContainerUri = getPoliciesContainerUrl(storageUrl);

  let wrapper;

  beforeEach(() => {
    const session = mockSession();
    wrapper = mockSessionContextProvider(session);
    jest
      .spyOn(resourceHelperFns, "getOrCreateContainer")
      .mockResolvedValue({ response });
    jest.spyOn(acp, "hasLinkedAcr").mockReturnValue(true);
    useResourceInfo.mockReturnValue({ data: "podRootData" });
  });

  it("returns null by default", () => {
    const { result } = renderHook(() => usePoliciesContainer(), { wrapper });
    expect(result.current.policiesContainer).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns response if ACP is supported", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => usePoliciesContainer(),
      {
        wrapper,
      }
    );

    await waitForNextUpdate();

    expect(result.current.policiesContainer).toBe(response);
    expect(result.current.error).toBeNull();
    expect(resourceHelperFns.getOrCreateContainer).toHaveBeenCalledWith(
      policiesContainerUri,
      expect.any(Function)
    );
  });

  it("returns null if ACP is not supported", () => {
    acp.hasLinkedAcr.mockReturnValue(false);
    const { result } = renderHook(() => usePoliciesContainer(), {
      wrapper,
    });

    expect(result.current.policiesContainer).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("return an error if getOrCreateContainer fails", async () => {
    resourceHelperFns.getOrCreateContainer.mockResolvedValue({ error });
    const { result, waitForNextUpdate } = renderHook(
      () => usePoliciesContainer(),
      {
        wrapper,
      }
    );

    await waitForNextUpdate();

    expect(result.current.policiesContainer).toBeNull();
    expect(result.current.error).toBe(error);
  });

  it("return an error if useResourceInfo fails", () => {
    useResourceInfo.mockReturnValue({ error });
    const { result } = renderHook(() => usePoliciesContainer(), {
      wrapper,
    });

    expect(result.current.policiesContainer).toBeNull();
    expect(result.current.error).toBe(error);
  });
});
