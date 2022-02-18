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
import { useSession } from "@inrupt/solid-ui-react";
import { acp_v3 as acp, mockSolidDatasetFrom } from "@inrupt/solid-client";
import useIsLegacyAcp from ".";
import { hasAcpConfiguration } from "../../accessControl/acp/helpers/index";

jest.mock("../../accessControl/acp/helpers/index");
hasAcpConfiguration.mockResolvedValue(true);

jest.mock("swr");
const mockedSwrHook = useSWR;

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
const mockedSessionHook = useSession;

jest.mock("@inrupt/solid-client", () => {
  const solidClientModule = jest.requireActual("@inrupt/solid-client");
  return {
    // We want some of the functions of the module actually available, such as
    // mockSolidDatasetFrom. Only the acp object needs to be mocked really.
    ...solidClientModule,
    acp: {
      getLinkedAcrUrl: jest.fn(),
    },
  };
});
const mockedAcp = acp;

describe("useIsLegacyAcp", () => {
  const mockedResource = mockSolidDatasetFrom("https://some.resource.iri");
  const mockedAcrUrl = "https://some.mocked.acr";
  const fetch = jest.fn();
  mockedSessionHook.mockReturnValue({ fetch });

  it("caches with SWR", () => {
    jest.spyOn(mockedAcp, "getLinkedAcrUrl").mockReturnValue(mockedAcrUrl);
    mockedSwrHook.mockReturnValue({ data: true });
    const { result } = renderHook(() => useIsLegacyAcp(mockedResource));
    expect(result.current.data).toBe(true);
    expect(mockedSwrHook).toHaveBeenCalledWith(
      [mockedAcrUrl, fetch],
      expect.any(Function)
    );
  });

  it("returns null if no resource info is given", async () => {
    jest.spyOn(mockedAcp, "getLinkedAcrUrl").mockReturnValue(mockedAcrUrl);
    renderHook(() => useIsLegacyAcp(undefined));
    expect(mockedSwrHook).toHaveBeenCalledWith(
      [null, fetch],
      expect.any(Function)
    );
  });
});
