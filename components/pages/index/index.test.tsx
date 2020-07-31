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

import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import * as nextRouterFns from "next/router";

import { useRedirectIfLoggedOut } from "../../../src/effects/auth";
import { useFetchPodIrisFromWebId } from "../../../src/hooks/solidClient";
import { resourceHref } from "../../resourceLink";
import IndexPage from "./index";

jest.mock("../../../src/effects/auth");
jest.mock("../../../src/hooks/solidClient");
jest.mock("@inrupt/solid-client");
jest.mock("next/router");

describe("Index page", () => {
  test("Renders null if there are no pod iris", () => {
    (nextRouterFns.useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn().mockResolvedValue(undefined),
    });

    (useFetchPodIrisFromWebId as jest.Mock).mockReturnValue({
      data: undefined,
    });

    const tree = shallow(<IndexPage />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Redirects to the resource page if there is a pod iri", () => {
    const replace = jest.fn().mockResolvedValue(undefined);
    const podIri = "https://mypod.myhost.com";

    (nextRouterFns.useRouter as jest.Mock).mockReturnValue({ replace });

    (useFetchPodIrisFromWebId as jest.Mock).mockReturnValue({
      data: [podIri],
    });

    shallow(<IndexPage />);

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
