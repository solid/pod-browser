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
import useSWR from "swr";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import mockSession, {
  mockUnauthenticatedSession,
} from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import useAddressBook from "./index";
import * as resourceFns from "../../solidClientHelpers/resource";
import mockAddressBook from "../../../__testUtils/mockAddressBook";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import { mockProfileAlice } from "../../../__testUtils/mockPersonResource";
import * as addressBookModelFns from "../../models/addressBook";
import { getAddressBookContainerIri } from "../../models/addressBook";

jest.mock("swr");
const mockedSwrHook = useSWR;

jest.mock("../useAuthenticatedProfile");
const mockedAuthenticatedProfile = useAuthenticatedProfile;

jest.mock("../../solidClientHelpers/resource");

describe("useAddressBook", () => {
  const addressBook = mockAddressBook();
  const dataset = mockSolidDatasetFrom("http://example.com");

  let mockedGetResource;

  beforeEach(() => {
    mockedAuthenticatedProfile.mockReturnValue({ data: null });
    jest
      .spyOn(addressBookModelFns, "loadAddressBook")
      .mockResolvedValue(addressBook);
    mockedGetResource = jest
      .spyOn(resourceFns, "getResource")
      .mockImplementation((iri) => ({
        response: { iri, dataset },
      }));
  });

  it("caches with SWR", () => {
    const session = mockUnauthenticatedSession();
    const wrapper = mockSessionContextProvider(session);
    const data = "data";
    const error = "error";
    mockedSwrHook.mockReturnValue({ data, error });
    const { result } = renderHook(() => useAddressBook(), {
      wrapper,
    });
    expect(result.current).toEqual({ addressBook: data, error });
    expect(mockedSwrHook).toHaveBeenCalledWith(
      ["addressBook", session],
      expect.any(Function)
    );
  });

  describe("with an unauthenticated user", () => {
    it("should not return any addressBook", async () => {
      const session = mockUnauthenticatedSession();
      const wrapper = mockSessionContextProvider(session);
      renderHook(() => useAddressBook(), { wrapper });
      await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toBeNull();
    });
  });

  describe("with an authenticated user", () => {
    const authProfile = mockProfileAlice();
    const authContactsIri = getAddressBookContainerIri(authProfile.pods[0]);

    let session;
    let wrapper;

    beforeEach(() => {
      mockedAuthenticatedProfile.mockReturnValue({ data: authProfile });
    });

    describe("with an existing address book", () => {
      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider(session);
      });

      it("should return the address book resource", async () => {
        renderHook(() => useAddressBook(), { wrapper });
        await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(
          addressBook
        );
        expect(mockedGetResource).toHaveBeenCalledWith(
          getAddressBookContainerIri(authProfile.pods[0]),
          expect.any(Function)
        );
        expect(addressBookModelFns.loadAddressBook).toHaveBeenCalledWith(
          authContactsIri,
          expect.any(Function)
        );
      });

      it("should return error if anything goes wrong", async () => {
        const error = new Error("Something went wrong");
        mockedGetResource.mockResolvedValue({ error });
        renderHook(() => useAddressBook(), { wrapper });
        await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(error);
      });
    });

    describe("with address book missing", () => {
      let saveNewAddressBook;

      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider(session);
        mockedGetResource.mockResolvedValue({ response: null, error: "404" });
        saveNewAddressBook = jest
          .spyOn(addressBookModelFns, "saveNewAddressBook")
          .mockResolvedValue(addressBook);
      });

      it("should return a new address book resource", async () => {
        renderHook(() => useAddressBook(), { wrapper });
        await expect(mockedSwrHook.mock.calls[0][1]()).resolves.toEqual(
          addressBook
        );
      });

      it("should return error if anything goes wrong when creating new address book", async () => {
        const error = new Error("Something went wrong");
        saveNewAddressBook.mockImplementation(() => {
          throw error;
        });
        renderHook(() => useAddressBook(), { wrapper });
        await expect(mockedSwrHook.mock.calls[0][1]()).rejects.toEqual(error);
      });
    });
  });
});
