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

import * as solidClientFns from "@inrupt/solid-client";
import { act, renderHook } from "@testing-library/react-hooks";
import { useSession } from "@inrupt/solid-ui-react";
import * as containerModelFns from "../../models/container";
import useContainer from "./index";
import { chain } from "../../solidClientHelpers/utils";

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

describe("useContainer", () => {
  const iri = "http://example.com/container/";
  const fetch = jest.fn();
  const thing = solidClientFns.createThing({ url: iri });
  const dataset = chain(solidClientFns.mockSolidDatasetFrom(iri), (t) =>
    solidClientFns.setThing(t, thing)
  );
  const container = { dataset, thing };

  beforeEach(() => {
    mockedSessionHook.mockReturnValue({ fetch });
  });

  it("fetches data using getSolidDataset", async () => {
    jest.spyOn(containerModelFns, "getContainer").mockResolvedValue(container);
    const { result, waitForNextUpdate } = renderHook(() => useContainer(iri));
    await waitForNextUpdate();
    expect(result.current.data).toBe(container);
    expect(containerModelFns.getContainer).toHaveBeenCalledWith(iri, { fetch });
  });

  it("returns null if no URL is given", async () => {
    jest.spyOn(containerModelFns, "getContainer").mockResolvedValue(container);
    const { result } = renderHook(() => useContainer(null));
    expect(result.current.data).toBeNull();
  });

  it("returns an update function that fetches data using getSolidDataset", async () => {
    jest.spyOn(containerModelFns, "getContainer").mockResolvedValue(container);
    const { result, waitForNextUpdate } = renderHook(() => useContainer(iri));
    const { update } = result.current;
    act(() => update());
    await waitForNextUpdate();
    expect(result.current.data).toBe(container);
    expect(containerModelFns.getContainer).toHaveBeenCalledWith(iri, { fetch });
  });

  it("returns an error if fetching fails", async () => {
    jest
      .spyOn(containerModelFns, "getContainer")
      .mockRejectedValue(new Error("error"));
    const { result, waitForNextUpdate } = renderHook(() => useContainer(iri));
    await waitForNextUpdate();
    expect(result.current.error.message).toBe("error");
    expect(containerModelFns.getContainer).toHaveBeenCalledWith(iri, { fetch });
  });

  it("returns an error if fetching fails when calling update", async () => {
    jest
      .spyOn(containerModelFns, "getContainer")
      .mockRejectedValue(new Error("error"));
    const { result, waitForNextUpdate } = renderHook(() => useContainer(iri));
    await waitForNextUpdate();
    const { update } = result.current;
    act(() => update());
    await waitForNextUpdate();
    expect(result.current.error.message).toBe("error");
    expect(containerModelFns.getContainer).toHaveBeenCalledWith(iri, { fetch });
  });

  it("does not return an error if fetching fails when calling update when deleting current container", async () => {
    jest
      .spyOn(containerModelFns, "getContainer")
      .mockRejectedValue(new Error("error"));
    const { result, waitForNextUpdate } = renderHook(() => useContainer(iri));
    await waitForNextUpdate();
    const { update } = result.current;
    const deletingCurrentContainer = true;
    act(() => {
      update(deletingCurrentContainer);
    });
    await waitForNextUpdate();
    expect(result.current.error).toBeNull();
    expect(containerModelFns.getContainer).toHaveBeenCalledWith(iri, { fetch });
  });
});
