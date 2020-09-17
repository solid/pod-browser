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
import mockSession, {
  mockUnauthenticatedSession,
} from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import useAddressBook from "./index";
import { getResource } from "../../solidClientHelpers/resource";
import { contactsContainerIri, saveNewAddressBook } from "../../addressBook";

jest.mock("../../solidClientHelpers/resource");
jest.mock("../../addressBook/index");

describe("useAddressBook", () => {
  const contactsIri = "http://example.com/contacts/";

  beforeEach(() => {
    contactsContainerIri.mockReturnValue(contactsIri);
  });

  describe("with an unauthenticated user", () => {
    it("should not return any addressBook", () => {
      const session = mockUnauthenticatedSession();
      const wrapper = mockSessionContextProvider({ session });
      const { result } = renderHook(() => useAddressBook(), {
        wrapper,
      });
      expect(result.current).toEqual([null, null]);
    });
  });

  describe("with an authenticated user", () => {
    let session;
    let wrapper;

    describe("with an existing address book", () => {
      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider({ session });
      });

      it("should call getResource", async () => {
        const dataset = 42;
        getResource.mockResolvedValue({ response: { dataset } });
        const { waitForNextUpdate } = renderHook(() => useAddressBook(), {
          wrapper,
        });
        await waitForNextUpdate();
        expect(getResource).toHaveBeenCalledWith(contactsIri, session.fetch);
      });

      it("should return the address book resource", async () => {
        const dataset = 42;
        getResource.mockResolvedValue({ response: { dataset } });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBook(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([dataset, null]);
      });

      it("should return error if anything goes wrong", async () => {
        const error = "Something went wrong";
        getResource.mockResolvedValue({ error });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBook(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([null, error]);
      });
    });

    describe("with address book missing", () => {
      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider({ session });
        getResource.mockResolvedValue({ response: null, error: "404" });
      });

      it("should return a new address book resource", async () => {
        const dataset = 1337;
        saveNewAddressBook.mockResolvedValue({
          response: {
            index: dataset,
          },
        });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBook(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([dataset, null]);
      });

      it("should return error if anything goes wrong when creating new address book", async () => {
        const error = "Something went wrong";
        saveNewAddressBook.mockResolvedValue({ error });
        const { result, waitForNextUpdate } = renderHook(
          () => useAddressBook(),
          {
            wrapper,
          }
        );
        await waitForNextUpdate();
        expect(result.current).toEqual([null, error]);
      });
    });
  });
});
