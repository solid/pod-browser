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

import useSWR from "swr";
import { renderHook } from "@testing-library/react-hooks";
import mockAccessControl from "../../../__testUtils/mockAccessControl";
import usePolicyPermissions from "./index";
import { AccessControlProvider } from "../../contexts/accessControlContext";

jest.mock("swr");
const mockedSwr = useSWR;

describe("usePolicyPermissions", () => {
  const accessControl = mockAccessControl();
  const swrResponse = 42;
  const policyName = "policyName";

  const wrapper = ({ children }) => (
    <AccessControlProvider accessControl={accessControl}>
      {children}
    </AccessControlProvider>
  );

  beforeEach(() => {
    mockedSwr.mockReturnValue(swrResponse);
  });

  it("uses SWR to cache responses", () => {
    const { result } = renderHook(() => usePolicyPermissions(policyName), {
      wrapper,
    });
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwr).toHaveBeenCalledWith(
      [accessControl, policyName],
      expect.any(Function),
      {}
    );
  });

  it("passes on SWR options", () => {
    const options = { revalidateOnFocus: false };
    const { result } = renderHook(
      () => usePolicyPermissions(policyName, options),
      {
        wrapper,
      }
    );
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwr).toHaveBeenCalledWith(
      [accessControl, policyName],
      expect.any(Function),
      options
    );
  });

  it("calls accessControl.getPermissionsForPolicy to retrieve permissions", async () => {
    renderHook(() => usePolicyPermissions(policyName), {
      wrapper,
    });
    await mockedSwr.mock.calls[0][1]();
    expect(accessControl.getPermissionsForPolicy).toHaveBeenCalledWith(
      policyName
    );
  });
});
