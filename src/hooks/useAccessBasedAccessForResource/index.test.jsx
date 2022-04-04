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
import * as accessFns from "@inrupt/solid-client-access-grants";
import useConsentBasedAccessForResource from "./index";
import getSignedVc from "../../../__testUtils/mockSignedVc";

jest.mock("@inrupt/solid-client-access-grants");

describe("useAllPermissions", () => {
  const resourceIri = "https://example.org/resource/";
  beforeEach(() => {
    jest
      .spyOn(accessFns, "getAccessGrantAll")
      .mockResolvedValue([getSignedVc()]);
  });

  it("returns an empty array if no resourceIri is given", async () => {
    const { result } = renderHook(() => useConsentBasedAccessForResource(null));
    expect(result.current.permissions).toEqual([]);
  });

  it("returns permissions if available", async () => {
    jest
      .spyOn(accessFns, "isValidAccessGrant")
      .mockResolvedValue({ errors: [] });
    const { result, waitForNextUpdate } = renderHook(() =>
      useConsentBasedAccessForResource(resourceIri)
    );

    await waitForNextUpdate();
    expect(result.current.permissions).toEqual([getSignedVc()]);
  });
  it("filters out non-valid vcs", async () => {
    jest
      .spyOn(accessFns, "isValidAccessGrant")
      .mockResolvedValue({ errors: ["error"] });
    const { result, waitForNextUpdate } = renderHook(() =>
      useConsentBasedAccessForResource(resourceIri)
    );

    await waitForNextUpdate();
    expect(result.current.permissions).toEqual([]);
  });
});
