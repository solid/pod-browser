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
import { createAccessMap } from "../../solidClientHelpers/permissions";
import usePermissionsWithProfiles from "./index";
import { fetchProfile } from "../../solidClientHelpers/profile";

jest.mock("../../solidClientHelpers/profile");
jest.mock("@inrupt/solid-ui-react");

describe("usePermissionsWithProfiles", () => {
  const webId = "webId";
  const permission = {
    webId,
    alias: "Editors",
    acl: createAccessMap(true, true, false, false),
  };
  useSession.mockReturnValue({ fetch: jest.fn() });
  it("exits if no permissions", () => {
    const { result } = renderHook(() => usePermissionsWithProfiles(null));
    expect(result.current.permissionsWithProfiles).toEqual([]);
  });

  it("returns permissions with profiles", async () => {
    const permissions = [permission];

    const profile = {
      name: "Example",
      avatar: null,
      webId: "https://example.org",
    };

    fetchProfile.mockResolvedValue(profile);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePermissionsWithProfiles(permissions)
    );

    await waitForNextUpdate();

    const expected = [
      {
        webId,
        alias: "Editors",
        acl: createAccessMap(true, true, false, false),
        profile: {
          name: "Example",
          avatar: null,
          webId: "https://example.org",
        },
      },
    ];

    expect(result.current.permissionsWithProfiles).toEqual(expected);
  });
  it("returns permissions with profile error if fetching fails", async () => {
    const permissions = [permission];

    const error = {
      error: "error",
    };

    fetchProfile.mockRejectedValueOnce(error);
    const { result, waitForNextUpdate } = renderHook(() =>
      usePermissionsWithProfiles(permissions)
    );

    await waitForNextUpdate();

    const expected = [
      {
        webId,
        alias: "Editors",
        acl: createAccessMap(true, true, false, false),
        profile: undefined,
        profileError: error,
      },
    ];

    expect(result.current.permissionsWithProfiles).toEqual(expected);
  });
});
