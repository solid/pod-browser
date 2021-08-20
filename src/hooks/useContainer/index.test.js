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

import { useSession } from "@inrupt/solid-ui-react";
import * as solidClientFns from "@inrupt/solid-client";
import { renderHook } from "@testing-library/react-hooks";
import useSWR from "swr";
import useContainer from "./index";
import { ERROR_CODES } from "../../error";
import createContainer from "../../../__testUtils/createContainer";

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

jest.mock("swr");
const mockedSwrHook = useSWR;

describe("useContainer", () => {
  const fetch = jest.fn();
  const containerUrl = "https://example.org/container/";
  const containerDataset = createContainer(containerUrl);
  const containerThing = solidClientFns.getThing(
    containerDataset,
    containerUrl
  );
  const container = { dataset: containerDataset, thing: containerThing };
  const swrResponse = 42;

  let mockedGetSolidDataset;

  beforeEach(() => {
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  it("uses SWR to cache", () => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(containerDataset);
    mockedSessionHook.mockReturnValue({
      fetch,
      sessionRequestInProgress: false,
    });
    const { result } = renderHook(() => useContainer(containerUrl));
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwrHook).toHaveBeenCalledWith(
      ["container", containerUrl, false],
      expect.any(Function)
    );
  });

  it("loads container", async () => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(containerDataset);
    mockedSessionHook.mockReturnValue({
      fetch,
      sessionRequestInProgress: false,
    });
    renderHook(() => useContainer(containerUrl));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(container);
  });

  it("throws an error if container cannot be fetched", async () => {
    const error = "error";

    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockRejectedValue(error);
    mockedSessionHook.mockReturnValue({
      fetch,
      sessionRequestInProgress: false,
    });
    renderHook(() => useContainer(containerUrl));
    await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(error);
  });

  it("throws an error if it there's something wrong when fetching the container", async () => {
    mockedSessionHook.mockReturnValue({
      fetch,
      sessionRequestInProgress: false,
    });
    mockedGetSolidDataset.mockRejectedValue(ERROR_CODES.FORBIDDEN);
    renderHook(() => useContainer(containerUrl));
    await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(
      ERROR_CODES.FORBIDDEN
    );
  });

  it("returns null while session is in progress", async () => {
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(containerDataset);
    mockedSessionHook.mockReturnValue({
      fetch,
      sessionRequestInProgress: true,
    });
    renderHook(() => useContainer(containerUrl));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
  });
});
