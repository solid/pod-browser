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
import * as solidClientFns from "@inrupt/solid-client";
import { mockSolidDatasetFrom, setUrl } from "@inrupt/solid-client";
import { space } from "rdf-namespaces";
import usePodRootUri from "./index";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import useResourceInfo from "../useResourceInfo";
import useDataset from "../useDataset";
import {
  aliceWebIdUrl,
  mockPersonDatasetAlice,
} from "../../../__testUtils/mockPersonResource";

jest.mock("../useAuthenticatedProfile");
const mockedAuthenticatedProfileHook = useAuthenticatedProfile;

jest.mock("../useResourceInfo");
const mockedResourceInfoHook = useResourceInfo;

jest.mock("../useDataset");
const mockedDatasetHook = useDataset;

const location = "https://foo.com/bar/baz";
const locationWithNoEndingSlash = "https://bar.com";
const podRoot = "https://foo.com/bar/";
const profile = {
  webId: "webId",
  pods: [podRoot, locationWithNoEndingSlash],
};
const resourceInfo = mockSolidDatasetFrom(location);

describe("usePodRootUri", () => {
  beforeEach(() => {
    jest.spyOn(solidClientFns, "getPodOwner").mockReturnValue(aliceWebIdUrl);
    mockedAuthenticatedProfileHook.mockReturnValue(profile);
    mockedResourceInfoHook.mockReturnValue({ data: resourceInfo });
    mockedDatasetHook.mockReturnValue({
      data: mockPersonDatasetAlice((t) => setUrl(t, space.storage, podRoot)),
    });
  });

  it("will return undefined if location is undefined", () => {
    const { result } = renderHook(() => usePodRootUri("undefined"));
    expect(result.current).toBeUndefined();
  });

  it("will return null owner's full profile fails to load", () => {
    const profileNoPods = {
      webId: "webId",
      pods: [],
    };
    mockedAuthenticatedProfileHook.mockReturnValue(profileNoPods);
    mockedDatasetHook.mockReturnValue({ error: new Error() });
    const { result } = renderHook(() => usePodRootUri(location));
    expect(result.current).toBeNull();
  });
});
