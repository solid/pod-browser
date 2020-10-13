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
import * as solidClientFns from "@inrupt/solid-client";
import { ldp } from "rdf-namespaces";
import useSWR from "swr";
import {
  addUrl,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
} from "@inrupt/solid-client";
import React from "react";
import useContainerResourceIris, { GET_CONTAINER_RESOURCE_IRIS } from "./index";
import { chain } from "../../solidClientHelpers/utils";
import mockSession from "../../../__testUtils/mockSession";
import mockFetch from "../../../__testUtils/mockFetch";
import mockResponse from "../../../__testUtils/mockResponse";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";

jest.mock("swr");

describe("useContainerResourceIris", () => {
  const containerIri = "http://example.com/";
  const iri1 = "http://example.com/foo";
  const iri2 = "http://example.com/bar";
  let value;

  beforeEach(() => {
    const fetch = mockFetch({
      [containerIri]: () => mockResponse(200),
    });
    const session = mockSession({ fetch });
    const SessionProvider = mockSessionContextProvider(session);
    const wrapper = ({ children }) => (
      <SessionProvider>{children}</SessionProvider>
    );
    const container = chain(
      mockThingFrom(containerIri),
      (t) => addUrl(t, ldp.contains, iri1),
      (t) => addUrl(t, ldp.contains, iri2)
    );
    const data = chain(mockSolidDatasetFrom(containerIri), (t) =>
      setThing(t, container)
    );
    jest.spyOn(solidClientFns, "getSolidDataset").mockResolvedValue(data);
    useSWR.mockReturnValue(42);
    value = renderHook(() => useContainerResourceIris(containerIri), {
      wrapper,
    });
  });

  it("caches with SWR", () => {
    expect(value.result.current).toBe(42);
    expect(useSWR).toHaveBeenCalledWith(
      [containerIri, GET_CONTAINER_RESOURCE_IRIS],
      expect.any(Function)
    );
  });
  test("useSWR fetches data using getSolidDataset", async () => {
    const children = await useSWR.mock.calls[0][1]();
    expect(solidClientFns.getSolidDataset).toHaveBeenCalledWith(
      containerIri,
      expect.any(Object)
    );
    expect(children).toEqual([iri1, iri2]);
  });
});
