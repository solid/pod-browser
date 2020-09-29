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
import useFindResourceOwner from ".";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
} from "../../../__testUtils/mockPersonResource";
import { getResource } from "../../solidClientHelpers/resource";

jest.mock("../../solidClientHelpers/resource");

describe("useFindResourceOwner", () => {
  describe("with a profile and formatted name", () => {
    const userWebId = "http://example.com/alice#me";
    const userProfile = mockPersonDatasetAlice();
    it("should return the user name", async () => {
      getResource.mockResolvedValue({
        response: { dataset: userProfile, iri: userWebId },
        error: null,
      });
      const { result, waitForNextUpdate } = renderHook(() =>
        useFindResourceOwner(userWebId)
      );
      await waitForNextUpdate();
      expect(result.current.ownerName).toEqual("Alice");
    });
  });
  describe("with a profile and a name", () => {
    const userWebId = "http://example.com/bob#me";
    const userProfile = mockPersonDatasetBob();
    it("should return the user name", async () => {
      getResource.mockResolvedValue({
        response: { dataset: userProfile, iri: userWebId },
        error: null,
      });
      const { result, waitForNextUpdate } = renderHook(() =>
        useFindResourceOwner(userWebId)
      );
      await waitForNextUpdate();
      expect(result.current.ownerName).toEqual("Bob");
    });
  });
  describe("without a profile", () => {
    const userWebId = "http://example.com/bob#me";
    it("should return null", async () => {
      getResource.mockResolvedValue({
        response: undefined,
        error: "error",
      });
      const { result, waitForNextUpdate } = renderHook(() =>
        useFindResourceOwner(userWebId)
      );
      await waitForNextUpdate();
      expect(result.current.ownerName).toBeNull();
    });
  });
});
