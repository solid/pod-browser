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
import { useRouter } from "next/router";

import { render } from "@testing-library/react";
import IndexPage from "./index";
import { resourceHref } from "../../../src/navigator";
import usePodIrisFromWebId from "../../../src/hooks/usePodIrisFromWebId";
import TestApp from "../../../__testUtils/testApp";

jest.mock("../../../src/hooks/usePodIrisFromWebId");
jest.mock("../../../src/hooks/usePreviousPage");
jest.mock("next/router");

describe("Index page", () => {
  const podIri = "https://mypod.myhost.com";

  beforeEach(() => {
    usePodIrisFromWebId.mockReturnValue({
      data: [podIri],
    });
  });

  it("Renders null if there are no pod iris", () => {
    const replaceMock = jest.fn().mockResolvedValue();
    useRouter.mockReturnValue({ replace: replaceMock });

    usePodIrisFromWebId.mockReturnValue({
      data: undefined,
    });

    const { asFragment } = render(
      <TestApp>
        <IndexPage />
      </TestApp>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("Renders null if there is an empty array of pod iris", () => {
    useRouter.mockReturnValue({
      replace: jest.fn().mockResolvedValue(undefined),
    });

    usePodIrisFromWebId.mockReturnValue({
      data: [],
    });

    const { asFragment } = render(
      <TestApp>
        <IndexPage />
      </TestApp>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("Redirects to the resource page if there is a pod iri", () => {
    const replaceMock = jest.fn().mockResolvedValue();
    useRouter.mockReturnValue({ replace: replaceMock });

    render(
      <TestApp>
        <IndexPage />
      </TestApp>
    );

    expect(replaceMock).toHaveBeenCalledWith(
      "/resource/[iri]",
      resourceHref(podIri)
    );
  });

  it("silently fails on router errors", () => {
    // This case should never actually happen, but there's test coverage just in case:
    const replaceMock = jest.fn().mockRejectedValue();
    useRouter.mockReturnValue({ replace: replaceMock });

    const { asFragment } = render(
      <TestApp>
        <IndexPage />
      </TestApp>
    );

    expect(replaceMock).toHaveBeenCalledWith(
      "/resource/[iri]",
      resourceHref(podIri)
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
