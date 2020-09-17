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
  profileTurtle,
  webIdUrl,
} from "../../../__testUtils/mockSession";
import usePodBrowserSettings from "./index";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { getOrCreateSettings } from "../../solidClientHelpers/settings";
import mockFetch from "../../../__testUtils/mockFetch";
import mockResponse from "../../../__testUtils/mockResponse";
import podBrowserPrefs from "../../solidClientHelpers/mocks/podBrowserPrefs.ttl";

jest.mock("../../solidClientHelpers/settings");
jest.mock("@inrupt/solid-client");

describe("usePodBrowserSettings", () => {
  const settingsUrl = "http://example.com/settings/podBrowserPrefs.ttl";

  describe("when profile and session is loaded", () => {
    it("should return a dataset for pod browser settings", async () => {
      const session = mockSession({
        fetch: mockFetch({
          [webIdUrl]: () => mockResponse(200, profileTurtle),
          [settingsUrl]: () => mockResponse(200, podBrowserPrefs),
        }),
      });
      // TODO: Wanted to avoid the use of mockResolvedValue, but didn't find another way
      const dataset = "testDataset";
      getOrCreateSettings.mockResolvedValue(dataset);
      const wrapper = mockSessionContextProvider({ session });
      const { result, waitForNextUpdate } = renderHook(
        () => usePodBrowserSettings(),
        { wrapper }
      );
      await waitForNextUpdate();
      expect(result.current).toEqual(dataset);
    });
  });

  describe("when user is unauthenticated", () => {
    it("should return null", () => {
      const session = mockUnauthenticatedSession();
      const wrapper = mockSessionContextProvider({ session });
      const { result } = renderHook(() => usePodBrowserSettings(), { wrapper });
      expect(result.current).toBeNull();
    });
  });
});
