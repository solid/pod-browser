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

import React from "react";
import Router from "next/router";
import { renderHook } from "@testing-library/react-hooks";
import * as solidClientFns from "@inrupt/solid-client";
import { space } from "rdf-namespaces/dist/index";
import mockSession, {
  anotherUsersStorageUrl,
  storageUrl,
} from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import useRedirectIfNoControlAccessToOwnPod from "./index";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import {
  mockPersonDatasetAlice,
  aliceWebIdUrl,
} from "../../../__testUtils/mockPersonResource";
import { packageProfile } from "../../solidClientHelpers/profile";
import { chain } from "../../solidClientHelpers/utils";
import usePodRoot from "../usePodRoot";

jest.mock("../useAuthenticatedProfile");
jest.mock("next/router");
jest.mock("../usePodRoot");

const { addUrl } = solidClientFns;

describe("useRedirectIfNoControlAccessToOwnPod", () => {
  const alice = mockPersonDatasetAlice();
  let wrapper;

  beforeEach(() => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const aliceWithPods = chain(alice, (t) =>
      addUrl(t, space.storage, storageUrl)
    );
    useAuthenticatedProfile.mockReturnValue({
      data: packageProfile(aliceWebIdUrl, aliceWithPods),
    });
    usePodRoot.mockReturnValue(storageUrl);
    jest.spyOn(solidClientFns, "getResourceInfoWithAcl").mockResolvedValue(42);
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValue(true);

    // eslint-disable-next-line react/prop-types
    wrapper = ({ children }) => <SessionProvider>{children}</SessionProvider>;
    jest.spyOn(Router, "push").mockResolvedValue(null);
  });

  it("Do not get redirected if profile has access to all pods", async () => {
    const { waitForNextUpdate } = renderHook(
      () => useRedirectIfNoControlAccessToOwnPod(storageUrl),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(Router.push).not.toHaveBeenCalled();
  });

  it("Do not get redirected if pod is not owned by user", async () => {
    const { waitForNextUpdate } = renderHook(
      () => useRedirectIfNoControlAccessToOwnPod(anotherUsersStorageUrl),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(Router.push).not.toHaveBeenCalled();
  });

  it("Gets redirected if profile do not have access to all pods", async () => {
    const { waitForNextUpdate } = renderHook(
      () => useRedirectIfNoControlAccessToOwnPod(storageUrl),
      { wrapper }
    );
    solidClientFns.hasResourceAcl.mockReturnValue(false);

    await waitForNextUpdate();

    expect(Router.push).toHaveBeenCalled();
  });
});
