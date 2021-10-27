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
import usePoliciesContainerUrl from "./index";
import { getPoliciesContainerUrl } from "../../models/policy";
import usePodRootUri from "../usePodRootUri";

jest.mock("../usePodRootUri");
jest.mock("@inrupt/solid-client");

const mockedPodRootUri = usePodRootUri;

describe("usePoliciesContainerUrl", () => {
  describe("latest ACP systems", () => {
    const podRootUrl = "http://example.com/";
    const policiesContainerUrl = getPoliciesContainerUrl(podRootUrl);

    beforeEach(() => {
      mockedPodRootUri.mockReturnValue(null);
    });

    it("returns null when podRootUrl is yet undetermined", () => {
      const { result } = renderHook(() => usePoliciesContainerUrl(null));
      expect(result.current).toBeNull();
    });

    it("returns response when podRootUrl is finished", async () => {
      const clientModule = jest.requireMock("@inrupt/solid-client");
      // The usePoliciesContainerUrl hook discovers the policy container from the
      // linked ACR.
      clientModule.acp_v3 = {
        getLinkedAcrUrl: () => policiesContainerUrl,
      };
      mockedPodRootUri.mockReturnValue(podRootUrl);
      const { result } = renderHook(() => usePoliciesContainerUrl(podRootUrl));
      expect(result.current).toBe(policiesContainerUrl);
    });
  });
});
