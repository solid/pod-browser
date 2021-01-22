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
import { renderHook } from "@testing-library/react-hooks";
import { SWRConfig } from "swr";
import { foaf } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import useContacts from "./index";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import * as addressBookFns from "../../addressBook";
import mockAddressBook from "../../../__testUtils/mockAddressBook";

describe("useContacts", () => {
  describe("with no address book", () => {
    it("should return undefined", () => {
      const session = mockSession();
      const wrapper = mockSessionContextProvider(session);
      const { result } = renderHook(() => useContacts(null, foaf.Person), {
        wrapper,
      });
      expect(result.current).toMatchObject({
        data: undefined,
        error: undefined,
      });
    });
  });

  describe("with address book", () => {
    const response = 42;
    const dataset = "dataset";
    const addressBook = mockAddressBook();

    let session;
    let wrapper;
    let mockedGetSolidDataset;
    let mockedGetContacts;

    beforeEach(() => {
      session = mockSession();
      const SessionProvider = mockSessionContextProvider(session);
      // eslint-disable-next-line react/prop-types
      wrapper = ({ children }) => (
        <SessionProvider>
          <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
        </SessionProvider>
      );
      mockedGetSolidDataset = jest
        .spyOn(solidClientFns, "getSolidDataset")
        .mockResolvedValue(dataset);
      mockedGetContacts = jest
        .spyOn(addressBookFns, "getContacts")
        .mockResolvedValue(response);
    });

    it("return response if all is good", async () => {
      const { result, waitFor } = renderHook(
        () => useContacts(addressBook, foaf.Person),
        {
          wrapper,
        }
      );

      await waitFor(() => expect(result.current.data).toBe(response));
    });

    it("returns error if it fails to load people index", async () => {
      const error = "Some error";
      jest.spyOn(solidClientFns, "getSolidDataset").mockRejectedValue(error);

      const { result, waitFor } = renderHook(
        () => useContacts(addressBook, foaf.Person),
        {
          wrapper,
        }
      );
      await waitFor(() => expect(result.current.error).toEqual(error));
    });

    it("returns error if it fails to load contacts", async () => {
      const error = "Some error";
      jest.spyOn(addressBookFns, "getContacts").mockRejectedValue(error);

      const { result, waitFor } = renderHook(
        () => useContacts(addressBook, foaf.Person),
        {
          wrapper,
        }
      );
      await waitFor(() => expect(result.current.error).toEqual(error));
    });
  });
});
