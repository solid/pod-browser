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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import usePodOwner from ".";
import usePodRootUri from "../usePodRootUri";
import useResourceInfo from "../useResourceInfo";

jest.mock("../usePodRootUri");
const mockedPodRootUriHook = usePodRootUri;

jest.mock("../useResourceInfo");
const mockedResourceInfoHook = useResourceInfo;

describe("usePodOwner", () => {
  const podRoot = "https://www.example.com";
  const podOwner = "https://www.example.com/profile#WebId";
  const hackedUri = "https://www.example.com/profile/card#me";
  const resourceIri = "https://www.example.com";
  const resourceInfo = mockSolidDatasetFrom(resourceIri);

  beforeEach(() => {
    mockedPodRootUriHook.mockReturnValue(podRoot);
    jest.spyOn(solidClientFns, "getPodOwner").mockReturnValue(podOwner);
    mockedResourceInfoHook.mockReturnValue({ data: resourceInfo, error: null });
  });

  it("returns the pod owner if available", () => {
    const { result } = renderHook(() => usePodOwner(resourceIri));
    expect(result.current.podOwnerWebId).toEqual(podOwner);
  });

  it("returns the fallback profile iri if pod owner is not available", () => {
    jest.spyOn(solidClientFns, "getPodOwner").mockReturnValue(null);

    const { result } = renderHook(() => usePodOwner(resourceIri));
    expect(result.current.podOwnerWebId).toEqual(hackedUri);
  });

  it("returns null if given resourceIri is undefined or null", () => {
    const { result } = renderHook(() => usePodOwner(null));
    expect(result.current.podOwnerWebId).toBeNull();
  });

  it("returns an error if it fails to load resource", () => {
    const error = new Error();
    mockedResourceInfoHook.mockReturnValue({ data: null, error });
    const { result } = renderHook(() => usePodOwner(resourceIri));
    expect(result.current.podOwnerWebId).toBeNull();
    expect(result.current.error).toBe(error);
  });

  it("returns fallback profile iri if error is 403", () => {
    const error = new Error("403");
    mockedResourceInfoHook.mockReturnValue({ data: null, error });
    const { result } = renderHook(() => usePodOwner(resourceIri));
    expect(result.current.podOwnerWebId).toBe(hackedUri);
    expect(result.current.error).toBe(error);
  });
});
