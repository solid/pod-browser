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

import { act, renderHook } from "@testing-library/react-hooks";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import React from "react";
import mockSession, {
  mockUnauthenticatedSession,
} from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import useBookmarks from "./index";
import * as resourceFns from "../../solidClientHelpers/resource";
import * as bookmarkFns from "../../solidClientHelpers/bookmarks";
import AlertContext from "../../contexts/alertContext";

jest.mock("@inrupt/solid-ui-react", () => {
  const uiReactModule = jest.requireActual("@inrupt/solid-ui-react");
  return {
    SessionContext: uiReactModule.SessionContext,
    useSession: jest.fn(),
  };
});
const mockedUseSession = useSession;

jest.mock("../useAuthenticatedProfile");
const mockedUseAuthenticatedProfile = useAuthenticatedProfile;

describe("useBookmarks", () => {
  const bookmarksIri = "http://example.com/bookmarks/index.ttl";
  const podUri = "http://example.com/";

  describe("with an unauthenticated user", () => {
    it("should not return any bookmarks", () => {
      const session = mockUnauthenticatedSession();
      mockedUseSession.mockReturnValue({ session });
      mockedUseAuthenticatedProfile.mockReturnValue({
        data: null,
      });
      const { result } = renderHook(() => useBookmarks());
      expect(result.current[0]).toBeUndefined();
    });
  });

  describe("with an authenticated user", () => {
    const dataset = mockSolidDatasetFrom(bookmarksIri);

    let session;
    let setMessage;
    let setAlertOpen;
    let setSeverity;

    beforeEach(() => {
      session = mockSession();
      setMessage = jest.fn();
      setAlertOpen = jest.fn();
      setSeverity = jest.fn();
      mockedUseSession.mockReturnValue({ session });
      mockedUseAuthenticatedProfile.mockReturnValue({
        data: { pods: [podUri] },
      });
    });

    describe("with an existing bookmarks index", () => {
      beforeEach(() => {
        jest
          .spyOn(resourceFns, "getResource")
          .mockResolvedValue({ response: { dataset } });
        mockedUseSession.mockReturnValue({ session });
      });

      it("should call getResource", async () => {
        const { waitForNextUpdate } = renderHook(() => useBookmarks());
        await waitForNextUpdate();
        expect(resourceFns.getResource).toHaveBeenCalledWith(
          bookmarksIri,
          session.fetch
        );
      });

      it("should return the bookmarks resource", async () => {
        const { result, waitForNextUpdate } = renderHook(() => useBookmarks());
        await waitForNextUpdate();
        expect(result.current[0].dataset).toEqual(dataset);
      });

      it("reeturns a refresh function", async () => {
        const { result, waitForNextUpdate } = renderHook(() => useBookmarks());
        await waitForNextUpdate();
        expect(resourceFns.getResource).toHaveBeenCalledTimes(1);
        act(() => {
          result.current[1]("something to update with");
        });
        await waitForNextUpdate();
        expect(resourceFns.getResource).toHaveBeenCalledTimes(2);
      });
    });

    describe("without existing bookmark index", () => {
      beforeEach(() => {
        jest.spyOn(resourceFns, "getResource").mockResolvedValue({
          response: null,
          error: "404",
        });
        jest.spyOn(bookmarkFns, "initializeBookmarks").mockResolvedValue({
          dataset,
        });
      });

      it("should return a new bookmarks resource", async () => {
        const { result, waitForNextUpdate } = renderHook(() => useBookmarks());

        await waitForNextUpdate();
        expect(result.current[0].dataset).toEqual(dataset);
      });
      it("notifies user about error", async () => {
        const error = new Error("error");
        jest.spyOn(resourceFns, "getResource").mockRejectedValue(error);
        const SessionProvider = mockSessionContextProvider(session);
        const wrapper = ({ children }) => (
          <SessionProvider sessionId="test-session" session={session}>
            <AlertContext.Provider
              value={{ setMessage, setAlertOpen, setSeverity }}
            >
              {children}
            </AlertContext.Provider>
          </SessionProvider>
        );

        const { result, waitForNextUpdate } = renderHook(() => useBookmarks(), {
          wrapper,
        });

        await waitForNextUpdate();

        expect(result.current[0]).toEqual([]);
        expect(setSeverity).toHaveBeenCalledWith("error");
        expect(setMessage).toHaveBeenCalledWith(error);
        expect(setAlertOpen).toHaveBeenCalledWith(true);
      });
    });
  });
});
