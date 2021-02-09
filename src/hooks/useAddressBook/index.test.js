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
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import { mockProfileAlice } from "../../../__testUtils/mockPersonResource";
import mockAddressBook, {
  mockAddressBookDataset,
} from "../../../__testUtils/mockAddressBook";
import useAddressBook, { ERROR_USE_ADDRESS_BOOK_NO_POD_ROOT } from "./index";
import { getAddressBookContainerUrl } from "../../models/addressBook";
import { ERROR_CODES } from "../../error";

jest.mock("@inrupt/solid-ui-react");
const mockedSessionHook = useSession;

jest.mock("../useAuthenticatedProfile");
const mockedAuthenticatedProfileHook = useAuthenticatedProfile;

jest.mock("swr");
const mockedSwrHook = useSWR;

describe("useAddressBook", () => {
  const fetch = jest.fn();
  const profile = mockProfileAlice();
  const addressBookContainerUrl = getAddressBookContainerUrl(profile.pods[0]);
  const addressBookDataset = mockAddressBookDataset({
    containerUrl: addressBookContainerUrl,
  });
  const mockedAddressBook = mockAddressBook({
    containerUrl: addressBookContainerUrl,
  });
  const swrResponse = 42;

  let mockedGetSolidDataset;

  beforeEach(() => {
    mockedSessionHook.mockReturnValue({ fetch });
    mockedAuthenticatedProfileHook.mockReturnValue({ data: profile });
    mockedGetSolidDataset = jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(addressBookDataset);
    mockedSwrHook.mockReturnValue(swrResponse);
  });

  it("uses SWR to cache", () => {
    const { result } = renderHook(() => useAddressBook());
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwrHook).toHaveBeenCalledWith(
      ["addressBook", profile],
      expect.any(Function),
      { errorRetryCount: 0 }
    );
  });

  it("loads existing address book", async () => {
    renderHook(() => useAddressBook());
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(
      mockedAddressBook
    );
  });

  it("creates a new address book if none exist from before", async () => {
    mockedGetSolidDataset.mockRejectedValue(ERROR_CODES.NOT_FOUND);
    renderHook(() => useAddressBook());
    const newAddressBook = await mockedSwrHook.mock.calls[0][1]();
    expect(newAddressBook.containerUrl).toEqual(addressBookContainerUrl);
    expect(newAddressBook.dataset).toBeDefined();
    expect(newAddressBook.thing).toBeDefined();
  });

  it("returns null while loading authenticated profile", async () => {
    mockedAuthenticatedProfileHook.mockReturnValue({});
    renderHook(() => useAddressBook());
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
  });

  it("throws an error if authenticated profile fails to load", async () => {
    const error = "error";
    mockedAuthenticatedProfileHook.mockReturnValue({ error });
    renderHook(() => useAddressBook());
    await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(error);
  });

  it("throws an error if it there's something wrong when loading the address book", async () => {
    mockedGetSolidDataset.mockRejectedValue(ERROR_CODES.FORBIDDEN);
    renderHook(() => useAddressBook());
    await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(
      ERROR_CODES.FORBIDDEN
    );
  });

  it("throws an error if no pod is found for profile", async () => {
    mockedAuthenticatedProfileHook.mockReturnValue({ data: { pods: [] } });
    renderHook(() => useAddressBook());
    await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(
      new Error(ERROR_USE_ADDRESS_BOOK_NO_POD_ROOT)
    );
  });
});
