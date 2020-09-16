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
import { useFetchPodIrisFromWebId } from "../../../src/hooks/solidClient";
import { SessionContextProvider } from "../../../src/contexts/sessionContext";
import { resourceHref } from "../../resourceLink";
import IndexPage from "./index";
import mockSession from "../../../__testUtils/mockSession";

jest.mock("../../../src/effects/auth");
jest.mock("../../../src/hooks/solidClient");
jest.mock("@inrupt/solid-client");
jest.mock("next/router");

describe("Index page", () => {
  const podIri = "https://mypod.myhost.com";

  beforeEach(() => {
    Router.push.mockReturnValue(null);
    useFetchPodIrisFromWebId.mockReturnValue({
      data: [podIri],
    });
  });

  test("Renders null if there are no pod iris", () => {
    const session = mockSession();

    nextRouterFns.useRouter.mockReturnValue({
      replace: jest.fn().mockResolvedValue(undefined),
    });

    useFetchPodIrisFromWebId.mockReturnValue({
      data: undefined,
    });

    const tree = mount(
      <SessionContextProvider session={session}>
        <IndexPage />
      </SessionContextProvider>
    );
    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("Redirects to the resource page if there is a pod iri", () => {
    const replace = jest.fn().mockResolvedValue(undefined);

    const session = mockSession();

    nextRouterFns.useRouter.mockReturnValue({ replace });

    mount(
      <SessionContextProvider session={session}>
        <IndexPage />
      </SessionContextProvider>
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
