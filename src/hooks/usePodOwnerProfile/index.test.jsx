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
import usePodOwnerProfile from "./index";
import { mockPersonDatasetAlice } from "../../../__testUtils/mockPersonResource";
import { getResource } from "../../solidClientHelpers/resource";

jest.mock("../../solidClientHelpers/resource");

describe("usePodOwnerProfile", () => {
  const userWebId = "http://example.com/alice#me";
  const podUri = "http://example.com/";
  const userProfile = mockPersonDatasetAlice();
  it("should return the user profile", async () => {
    getResource.mockResolvedValue({
      response: { dataset: userProfile, iri: userWebId },
      error: null,
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      usePodOwnerProfile(podUri)
    );
    await waitForNextUpdate();
    expect(result.current.profile.dataset).toEqual(userProfile);
    expect(result.current.error).toBeNull();
  });
  it("should return null if there's an error fetching the profile", async () => {
    getResource.mockResolvedValue({
      response: null,
      error: "error",
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      usePodOwnerProfile(podUri)
    );
    await waitForNextUpdate();

    expect(result.current.error).toEqual("error");
    expect(result.current.profile).toBeNull();
  });
});
