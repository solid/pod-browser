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
import { mount, shallow } from "enzyme";
import { mountToJson } from "enzyme-to-json";
import Router, * as nextRouterFns from "next/router";

import { useRedirectIfLoggedOut } from "../../../src/effects/auth";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import IndexPage from "./index";
import mockSession from "../../../__testUtils/mockSession";
import { resourceHref } from "../../../src/navigator";
import usePodIrisFromWebId from "../../../src/hooks/usePodIrisFromWebId";

jest.mock("../../../src/effects/auth");
jest.mock("../../../src/hooks/usePodIrisFromWebId");
jest.mock("@inrupt/solid-client");
jest.mock("next/router");

describe("Index page", () => {
  const podIri = "https://mypod.myhost.com";

  beforeEach(() => {
    Router.push.mockReturnValue(null);
    usePodIrisFromWebId.mockReturnValue({
      data: [podIri],
    });
  });

  test("Renders null if there are no pod iris", () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);

    nextRouterFns.useRouter.mockReturnValue({
      replace: jest.fn().mockResolvedValue(undefined),
    });

    usePodIrisFromWebId.mockReturnValue({
      data: undefined,
    });

    const tree = mount(
      <SessionProvider>
        <IndexPage />
      </SessionProvider>
    );
    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("Redirects to the resource page if there is a pod iri", () => {
    const replace = jest.fn().mockResolvedValue(undefined);

    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);

    nextRouterFns.useRouter.mockReturnValue({ replace });

    mount(
      <SessionProvider>
        <IndexPage />
      </SessionProvider>
    );

    expect(replace).toHaveBeenCalledWith(
      "/resource/[iri]",
      resourceHref(podIri)
    );
  });

  test("Redirects if the user is logged out", () => {
    shallow(<IndexPage />);
    expect(useRedirectIfLoggedOut).toHaveBeenCalled();
  });
});
