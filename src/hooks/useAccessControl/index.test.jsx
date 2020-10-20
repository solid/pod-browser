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
import useAccessControl from "./index";
import * as accessControlFns from "../../accessControl";
import usePoliciesContainer from "../usePoliciesContainer";

jest.mock("../usePoliciesContainer");

describe("useAccessControl", () => {
  const accessControl = "accessControl";
  const resourceIri = "resourceIri";
  const fetch = "fetch";
  const policiesContainer = "policiesContainer";
  const error = "error";

  beforeEach(() => {
    jest
      .spyOn(accessControlFns, "getAccessControl")
      .mockResolvedValue(accessControl);
    usePoliciesContainer.mockReturnValue({ policiesContainer });
  });

  it("returns null if given no resourceUri", () => {
    const { result } = renderHook(() => useAccessControl(null, fetch));
    expect(result.current.accessControl).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns accessControl if given resourceUri", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useAccessControl(resourceIri, fetch)
    );
    await waitForNextUpdate();
    expect(accessControlFns.getAccessControl).toHaveBeenCalledWith(
      resourceIri,
      policiesContainer,
      fetch
    );
    expect(result.current.accessControl).toBe(accessControl);
    expect(result.current.error).toBeNull();
  });

  it("returns error if usePolicies return error", async () => {
    usePoliciesContainer.mockReturnValue({ error });
    const { result } = renderHook(() => useAccessControl(resourceIri, fetch));
    expect(result.current.accessControl).toBeNull();
    expect(result.current.error).toBe(error);
  });

  it("returns error if getAccessControl fails", async () => {
    accessControlFns.getAccessControl.mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() =>
      useAccessControl(resourceIri, fetch)
    );
    await waitForNextUpdate();
    expect(result.current.accessControl).toBeNull();
    expect(result.current.error).toBe(error);
  });
});
