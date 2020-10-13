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

import React from "react";
import useSWR from "swr";
import * as solidClientFns from "@inrupt/solid-client";
import { renderHook } from "@testing-library/react-hooks";
import useDataset, { GET_DATASET } from "./index";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import mockFetch from "../../../__testUtils/mockFetch";
import mockResponse from "../../../__testUtils/mockResponse";

jest.mock("swr");

describe("useDataset", () => {
  const iri = "http://example.com";
  let value;

  beforeEach(() => {
    const fetch = mockFetch({
      [iri]: () => mockResponse(200),
    });
    const session = mockSession({ fetch });
    const SessionProvider = mockSessionContextProvider(session);
    const wrapper = ({ children }) => (
      <SessionProvider>{children}</SessionProvider>
    );
    jest.spyOn(solidClientFns, "getSolidDataset");
    useSWR.mockReturnValue(42);
    value = renderHook(() => useDataset(iri), { wrapper });
  });

  it("caches with SWR", () => {
    expect(value.result.current).toBe(42);
    expect(useSWR).toHaveBeenCalledWith(
      [iri, GET_DATASET],
      expect.any(Function)
    );
  });
  test("useSWR fetches data using getSolidDataset", () => {
    useSWR.mock.calls[0][1]();
    expect(solidClientFns.getSolidDataset).toHaveBeenCalledWith(
      iri,
      expect.any(Object)
    );
  });
});
