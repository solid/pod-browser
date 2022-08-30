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

import { useSession } from "@inrupt/solid-ui-react";
import { getEffectiveAccess, getResourceInfo } from "@inrupt/solid-client";
import { renderHook } from "@testing-library/react-hooks";
import { waitFor } from "@testing-library/dom";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../__testUtils/mockSession";
import useAccessToResourceAndParentContainer from ".";

jest.mock("@inrupt/solid-ui-react", () => {
  const uiReactModule = jest.requireActual("@inrupt/solid-ui-react");
  return {
    SessionContext: uiReactModule.SessionContext,
    useSession: jest.fn(),
  };
});
const mockedUseSession = useSession;

jest.mock("@inrupt/solid-client");

describe("useAccessToResourceAndParentContainer", () => {
  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);

  const readAccess = { read: true, write: false, append: false };

  const noAccess = { read: false, write: false, append: false };

  const wrapper = ({ children }) => (
    <SessionProvider>{children}</SessionProvider>
  );

  beforeEach(() => {
    mockedUseSession.mockReturnValue({ session });
  });

  it("returns null if given no iri", async () => {
    const { result } = renderHook(
      () => useAccessToResourceAndParentContainer(null),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual({
        accessToParentContainer: null,
        accessToResource: null,
      });
    });
  });

  it("returns null if iri is a container iri", async () => {
    const { result } = renderHook(
      () =>
        useAccessToResourceAndParentContainer(
          "https://example.pod.com/container/"
        ),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual({
        accessToParentContainer: null,
        accessToResource: null,
      });
    });
  });

  it("returns correct access if user has access to resource and not to parent container", async () => {
    getResourceInfo
      .mockRejectedValueOnce("error")
      .mockResolvedValueOnce("resourceInfo");
    getEffectiveAccess.mockReturnValueOnce({ user: readAccess });
    const { result } = renderHook(
      () =>
        useAccessToResourceAndParentContainer(
          "https://example.pod.com/container/resource.txt"
        ),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual({
        accessToParentContainer: null,
        accessToResource: readAccess,
      });
    });
  });

  it("returns correct access if user has access to both resource and  parent container", async () => {
    getResourceInfo.mockResolvedValue("resourceInfo");
    getEffectiveAccess.mockReturnValue({ user: readAccess });
    const { result } = renderHook(
      () =>
        useAccessToResourceAndParentContainer(
          "https://example.pod.com/container/resource.txt"
        ),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual({
        accessToParentContainer: readAccess,
        accessToResource: readAccess,
      });
    });
  });
  it("returns correct access if user has no access to resource or parent container", async () => {
    getResourceInfo.mockRejectedValue("error");
    const { result } = renderHook(
      () =>
        useAccessToResourceAndParentContainer(
          "https://example.pod.com/container/resource.txt"
        ),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      expect(result.current).toEqual({
        accessToParentContainer: null,
        accessToResource: null,
      });
    });
  });
});
