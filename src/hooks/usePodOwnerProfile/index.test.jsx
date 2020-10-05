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
import * as RouterFns from "next/router";
import usePodOwnerProfile from "./index";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
} from "../../../__testUtils/mockPersonResource";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import useFetchProfile from "../useFetchProfile";

jest.mock("../useFetchProfile");
jest.mock("../useAuthenticatedProfile");

describe("usePodOwnerProfile", () => {
  const resourceUrl = "http://example.com/foo/bar";
  const userProfileUri = "http://example.com/profile/card#me";
  const userProfile = mockPersonDatasetAlice();
  const authProfile = mockPersonDatasetBob();

  beforeEach(() => {
    useAuthenticatedProfile.mockReturnValue({ data: authProfile });
    useFetchProfile.mockReturnValue({ data: userProfile });
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({ query: {} });
  });

  it("returns the authenticated profile if no iri is given in router", () => {
    const { result } = renderHook(() => usePodOwnerProfile());
    expect(result.current.profile).toEqual(authProfile);
  });

  it("returns the user profile for the Pod if iri is given in router", () => {
    RouterFns.useRouter.mockReturnValue({
      query: { iri: encodeURIComponent(resourceUrl) },
    });
    const { result } = renderHook(() => usePodOwnerProfile());
    expect(result.current.profile).toEqual(userProfile);
    expect(useFetchProfile).toHaveBeenCalledWith(userProfileUri);
  });

  it("should return null while requests are loading", () => {
    useAuthenticatedProfile.mockReturnValue({ data: null });
    const { result } = renderHook(() => usePodOwnerProfile());
    expect(result.current.profile).toBeNull();
  });
});
