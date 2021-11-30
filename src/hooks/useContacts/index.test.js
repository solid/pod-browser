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
import { renderHook } from "@testing-library/react-hooks";
import useAddressBook from "../useAddressBook";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import useContacts from "./index";
import { GROUP_CONTACT } from "../../models/contact/group";
import { addIndexToMockedAddressBook } from "../../../__testUtils/mockContact";
import { chain } from "../../solidClientHelpers/utils";
import { PERSON_CONTACT } from "../../models/contact/person";
import * as contactModelFns from "../../models/contact";
import { ERROR_CODES } from "../../error";

jest.mock("../useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
const mockedSessionHook = useSession;

jest.mock("swr");
const mockedSwrHook = useSWR;

const addressBook = mockAddressBook();
const addressBookWithGroups = chain(addressBook, (a) =>
  addIndexToMockedAddressBook(a, GROUP_CONTACT)
);

describe("useContacts", () => {
  const fetch = jest.fn();
  const swrResponse = 42;
  const types = [GROUP_CONTACT, PERSON_CONTACT];
  const groupResponse = [1337];

  beforeEach(() => {
    mockedAddressBookHook.mockReturnValue({ data: addressBookWithGroups });
    mockedSessionHook.mockReturnValue({ fetch });
    mockedSwrHook.mockReturnValue(swrResponse);
    jest
      .spyOn(contactModelFns, "getContactAll")
      .mockResolvedValue(groupResponse);
  });

  it("uses SWR to cache", () => {
    const { result } = renderHook(() => useContacts(types));
    expect(result.current).toEqual(swrResponse);
    expect(mockedSwrHook).toHaveBeenCalledWith(
      ["contacts", addressBookWithGroups, ...types],
      expect.any(Function),
      { errorRetryCount: 0 }
    );
  });

  it("returns contacts", async () => {
    renderHook(() => useContacts(types));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(
      groupResponse
    );
  });

  it("returns null while address book is loading", async () => {
    mockedAddressBookHook.mockReturnValue({});
    renderHook(() => useContacts(types));
    await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
  });

  it("fails if address book fails to load", async () => {
    mockedAddressBookHook.mockReturnValue({ error: ERROR_CODES.FORBIDDEN });
    renderHook(() => useContacts(types));
    await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(
      ERROR_CODES.FORBIDDEN
    );
  });
});
