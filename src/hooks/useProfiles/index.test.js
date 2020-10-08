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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import useProfiles from "./index";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { getProfiles } from "../../addressBook";

jest.mock("../../addressBook");

describe("useProfiles", () => {
  describe("with no people", () => {
    it("should return null", () => {
      const session = mockSession();
      const wrapper = mockSessionContextProvider(session);
      const { result } = renderHook(() => useProfiles(null), {
        wrapper,
      });
      expect(result.current).toBeNull();
    });
  });

  describe("with people", () => {
    let session;
    let wrapper;
    const response = 42;
    const contactUrl1 =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const contactUrl2 =
      "https://user.example.com/contacts/Person/5678/index.ttl";
    const people = [
      mockSolidDatasetFrom(contactUrl1),
      mockSolidDatasetFrom(contactUrl2),
    ];

    beforeEach(() => {
      session = mockSession();
      wrapper = mockSessionContextProvider(session);
    });

    it("should call getPeople", async () => {
      getProfiles.mockResolvedValue(response);

      const { waitForNextUpdate } = renderHook(() => useProfiles(people), {
        wrapper,
      });

      await waitForNextUpdate();

      expect(getProfiles).toHaveBeenCalledWith(people, session.fetch);
    });

    it("should return response", async () => {
      getProfiles.mockResolvedValue(response);

      const { result, waitForNextUpdate } = renderHook(
        () => useProfiles(people),
        {
          wrapper,
        }
      );

      await waitForNextUpdate();

      expect(result.current).toEqual(response);
    });
  });
});
