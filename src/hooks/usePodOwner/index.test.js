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
import usePodOwner from ".";

jest.mock("@inrupt/solid-client");

describe("usePodOwner", () => {
  test("it returns the pod owner if available", async () => {
    const resourceInfo = {
      internal_resourceInfo: {
        sourceIri: "https://www.example.com",
        linkedResources: {
          "http://www.w3.org/ns/solid/terms#podOwner": [
            "https://www.example.com/profile#WebId",
          ],
        },
      },
    };

    solidClientFns.getResourceInfo = jest.fn().mockResolvedValue(resourceInfo);
    solidClientFns.getPodOwner = jest
      .fn()
      .mockReturnValue("https://www.example.com/profile#WebId");

    const { result, waitForNextUpdate } = renderHook(() =>
      usePodOwner({ resourceIri: "https://www.example.com" })
    );
    await waitForNextUpdate();
    expect(result.current.podOwnerWebId).toEqual(
      "https://www.example.com/profile#WebId"
    );
  });
  test("it returns the fallback profile iri if pod owner is not available", async () => {
    const resourceInfo = {
      internal_resourceInfo: {
        sourceIri: "https://www.example.com",
        linkedResources: {},
      },
    };

    solidClientFns.getResourceInfo = jest.fn().mockResolvedValue(resourceInfo);
    solidClientFns.getPodOwner = jest.fn().mockReturnValue(null);

    const { result, waitForNextUpdate } = renderHook(() =>
      usePodOwner({ resourceIri: "https://www.example.com" })
    );
    await waitForNextUpdate();
    expect(result.current.podOwnerWebId).toEqual(
      "https://www.example.com/profile/card#me"
    );
  });
  test("it sets webId and error to null and exits if resource Iri is undefined", async () => {
    const resourceInfo = {
      internal_resourceInfo: {
        sourceIri: "https://www.example.com",
        linkedResources: {
          "http://www.w3.org/ns/solid/terms#podOwner": [
            "https://www.example.com/profile#WebId",
          ],
        },
      },
    };

    solidClientFns.getResourceInfo = jest.fn().mockResolvedValue(resourceInfo);
    solidClientFns.getPodOwner = jest
      .fn()
      .mockReturnValue("https://www.example.com/profile#WebId");

    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ resourceIri }) => usePodOwner({ resourceIri }),
      { initialProps: { resourceIri: "https://www.example.com " } }
    );
    await waitForNextUpdate();
    expect(result.current.podOwnerWebId).not.toBeNull();
    rerender({ resourceIri: undefined });
    expect(result.current.podOwnerWebId).toBeNull();
  });
});
