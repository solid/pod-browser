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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { cache, SWRConfig } from "swr";
import { foaf } from "rdf-namespaces";
import usePeople from "./index";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { getContacts } from "../../addressBook";

jest.mock("../../addressBook");

describe("usePeople", () => {
  describe("with no address book", () => {
    it("should return undefined", () => {
      const session = mockSession();
      const wrapper = mockSessionContextProvider(session);
      const { result } = renderHook(() => usePeople(null), {
        wrapper,
      });
      expect(result.current).toMatchObject({
        data: undefined,
        error: undefined,
      });
    });
  });

  describe("with address book", () => {
    let session;
    let wrapper;
    const response = 42;
    const addressBookUrl = "http://example.com/contacts/index.ttl";
    const addressBook = mockSolidDatasetFrom(addressBookUrl);

    beforeEach(() => {
      session = mockSession();
      const SessionProvider = mockSessionContextProvider(session);
      // eslint-disable-next-line react/prop-types
      wrapper = ({ children }) => (
        <SessionProvider>
          <SWRConfig value={{ dedupingInterval: 0 }}>{children}</SWRConfig>
        </SessionProvider>
      );
    });

    afterEach(() => {
      cache.clear();
    });

    it("should call getContacts", async () => {
      getContacts.mockResolvedValue({ response });

      renderHook(() => usePeople(addressBook), {
        wrapper,
      });

      expect(getContacts).toHaveBeenCalledWith(
        foaf.Person,
        addressBookUrl,
        session.fetch
      );
    });

    it("should return response", async () => {
      getContacts.mockResolvedValue({ response });

      const { result, waitFor } = renderHook(() => usePeople(addressBook), {
        wrapper,
      });

      await waitFor(() =>
        expect(result.current).toMatchObject({
          data: response,
          error: undefined,
        })
      );
    });

    it("should return error", async () => {
      const error = "Some error";
      getContacts.mockResolvedValue({ error });

      const { result, waitFor } = renderHook(() => usePeople(addressBook), {
        wrapper,
      });

      await waitFor(() =>
        expect(result.current).toMatchObject({
          data: undefined,
          error,
        })
      );
    });
  });
});
