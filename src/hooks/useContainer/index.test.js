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
import * as solidClientFns from "@inrupt/solid-client";
import { renderHook } from "@testing-library/react-hooks";
import { useSession } from "@inrupt/solid-ui-react";
import * as containerModelFns from "../../models/container";
import useContainer, { GET_CONTAINER } from "./index";
import { chain } from "../../solidClientHelpers/utils";

jest.mock("swr");
const mockedSwrHook = useSWR;

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

describe("useContainer", () => {
  const iri = "http://example.com/container/";
  const fetch = jest.fn();
  const swrResponse = 42;
  const thing = solidClientFns.createThing({ url: iri });
  const dataset = chain(solidClientFns.mockSolidDatasetFrom(iri), (t) =>
    solidClientFns.setThing(t, thing)
  );
  const container = { dataset, thing };

  beforeEach(() => {
    mockedSessionHook.mockReturnValue({ fetch });
    jest.spyOn(containerModelFns, "getContainer").mockResolvedValue(container);
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  it("caches with SWR", () => {
    const value = renderHook(() => useContainer(iri, { refreshInterval: 0 }));
    expect(value.result.current).toBe(swrResponse);
    expect(useSWR).toHaveBeenCalledWith(
      [iri, GET_CONTAINER],
      expect.any(Function),
      { refreshInterval: 0 }
    );
  });

  it("useSWR fetches data using getSolidDataset", async () => {
    renderHook(() => useContainer(iri));
    await expect(useSWR.mock.calls[0][1]()).resolves.toBe(container);
    expect(containerModelFns.getContainer).toHaveBeenCalledWith(iri, { fetch });
    expect(useSWR).toHaveBeenCalledWith(
      [iri, GET_CONTAINER],
      expect.any(Function),
      {}
    );
  });

  it("returns null if no URL is given", async () => {
    renderHook(() => useContainer(null));
    await expect(useSWR.mock.calls[0][1]()).resolves.toBeNull();
  });
});
