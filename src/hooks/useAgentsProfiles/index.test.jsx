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
import useSWR from "swr";
import * as solidClientFns from "@inrupt/solid-client";
import { renderHook } from "@testing-library/react-hooks";
import useAgentsProfiles from "./index";
import {
  mockPersonDatasetBob,
  mockPersonDatasetAlice,
  bobWebIdUrl,
  aliceWebIdUrl,
  mockPersonThingBob,
  mockPersonThingAlice,
} from "../../../__testUtils/mockPersonResource";

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

jest.mock("swr");
const mockedSwrHook = useSWR;
const agentsWebIds = [bobWebIdUrl, aliceWebIdUrl];
const people = [mockPersonThingBob(), mockPersonThingAlice()];
describe("useAgentsProfiles", () => {
  const fetch = jest.fn();
  const swrResponse = 42;

  beforeEach(() => {
    mockedSessionHook.mockReturnValue({ fetch });
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  it("uses SWR to cache", () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(mockPersonDatasetBob())
      .mockResolvedValueOnce(mockPersonDatasetAlice());
    const { result } = renderHook(() => useAgentsProfiles(agentsWebIds));
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwrHook).toHaveBeenCalledWith(
      ["agents", agentsWebIds],
      expect.any(Function),
      { errorRetryCount: 0 }
    );
  });

  it("returns profiles", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(mockPersonDatasetBob())
      .mockResolvedValueOnce(mockPersonDatasetAlice());
    renderHook(() => useAgentsProfiles(agentsWebIds));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(people);
  });
  it("returns null values for profiles that cannot be fetched", async () => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(mockPersonDatasetBob())
      .mockRejectedValueOnce("error");
    renderHook(() =>
      useAgentsProfiles([bobWebIdUrl, "https://somewebidthatfails.com"])
    );
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual([
      mockPersonThingBob(),
      null,
    ]);
  });
  it("returns null is no agent web ids are passed", async () => {
    renderHook(() => useAgentsProfiles(undefined));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
  });
});
