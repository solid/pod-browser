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
import { useSession } from "@inrupt/solid-ui-react";
import {
  mockAuthenticatedSession,
  mockUnauthenticatedSession,
} from "../../../__testUtils/mockSession";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import {
  alicePodRoot,
  mockProfileAlice,
} from "../../../__testUtils/mockPersonResource";
import useContactsContainerUrl from "./index";
import { joinPath } from "../../stringHelpers";

jest.mock("../useAuthenticatedProfile");
const mockedAuthenticatedProfileHook = useAuthenticatedProfile;

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
const mockedSessionHook = useSession;

describe("useContactsContainerUrl", () => {
  beforeEach(() => {
    mockedSessionHook.mockReturnValue({
      session: mockAuthenticatedSession(),
    });
  });
  beforeEach(() => {
    mockedAuthenticatedProfileHook.mockReturnValue({
      data: mockProfileAlice(),
    });
  });

  it("returns the URL to the contacts container", () => {
    const { result } = renderHook(() => useContactsContainerUrl());
    expect(result.current).toEqual(joinPath(alicePodRoot, "contacts/"));
  });

  it("returns null if not logged in", () => {
    mockedSessionHook.mockReturnValue({
      session: mockUnauthenticatedSession(),
    });
    const { result } = renderHook(() => useContactsContainerUrl());
    expect(result.current).toBeNull();
  });

  it("returns null if profile is not authenticated yet", () => {
    mockedAuthenticatedProfileHook.mockReturnValue({ data: null });
    const { result } = renderHook(() => useContactsContainerUrl());
    expect(result.current).toBeNull();
  });
});
