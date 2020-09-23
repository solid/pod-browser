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
import mockSession, {
  mockUnauthenticatedSession,
} from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import useBookmarks from "./index";
import { getResource } from "../../solidClientHelpers/resource";
import { initializeBookmarks } from "../../solidClientHelpers/bookmarks";

jest.mock("../../solidClientHelpers/resource");
jest.mock("../../solidClientHelpers/bookmarks");

describe("useBookmarks", () => {
  const bookmarksIri = "http://example.com/bookmarks/index.ttl";

  describe("with an unauthenticated user", () => {
    it("should not return any bookmarks", () => {
      const session = mockUnauthenticatedSession();
      const wrapper = mockSessionContextProvider(session);
      const { result } = renderHook(() => useBookmarks(), {
        wrapper,
      });
      const expectedDataset = result.current[0];
      expect(expectedDataset).toBeUndefined();
    });
  });

  describe("with an authenticated user", () => {
    let session;
    let wrapper;

    describe("with an existing bookmarks index", () => {
      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider(session);
      });

      it("should call getResource", async () => {
        const dataset = mockSolidDatasetFrom(bookmarksIri);
        getResource.mockResolvedValue({ response: { dataset } });
        const { waitForNextUpdate } = renderHook(() => useBookmarks(), {
          wrapper,
        });
        await waitForNextUpdate();
        expect(getResource).toHaveBeenCalledWith(bookmarksIri, session.fetch);
      });

      it("should return the bookmarks resource", async () => {
        const dataset = mockSolidDatasetFrom(bookmarksIri);
        getResource.mockResolvedValue({ response: { dataset } });
        const { result, waitForNextUpdate } = renderHook(() => useBookmarks(), {
          wrapper,
        });
        await waitForNextUpdate();
        const expectedDataset = result.current[0].dataset;
        expect(expectedDataset).toEqual(dataset);
      });
    });

    describe("without existing bookmark index", () => {
      beforeEach(() => {
        session = mockSession();
        wrapper = mockSessionContextProvider(session);
        getResource.mockResolvedValueOnce({
          response: null,
          error: "404",
        });
      });

      it("should return a new bookmarks resource", async () => {
        const dataset = mockSolidDatasetFrom(bookmarksIri);
        const { result, waitForNextUpdate } = renderHook(() => useBookmarks(), {
          wrapper,
        });

        initializeBookmarks.mockResolvedValueOnce({
          dataset,
        });
        await waitForNextUpdate();
        const expectedDataset = result.current[0].dataset;
        expect(expectedDataset).toEqual(dataset);
      });
    });
  });
});
