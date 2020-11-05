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
import * as RouterFns from "next/router";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { renderWithTheme } from "../../__testUtils/withTheme";
import Container from "./index";
import useContainerResourceIris from "../../src/hooks/useContainerResourceIris";
import useDataset from "../../src/hooks/useDataset";

jest.mock("../../src/hooks/useDataset");
jest.mock("../../src/hooks/useContainerResourceIris");

describe("Container view", () => {
  const iri = "https://example.com/container/";
  const container = mockSolidDatasetFrom(iri);

  beforeEach(() => {
    useDataset.mockReturnValue({ data: container });
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "asPath",
      replace: jest.fn(),
      query: {},
    });
  });

  test("Renders a spinner if data is loading", () => {
    useContainerResourceIris.mockReturnValue({
      data: undefined,
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("Renders a table view without data", () => {
    useContainerResourceIris.mockReturnValue({
      data: [],
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("Renders a table with data", () => {
    useContainerResourceIris.mockReturnValue({
      data: [
        "https://myaccount.mypodserver.com/inbox",
        "https://myaccount.mypodserver.com/private",
        "https://myaccount.mypodserver.com/note.txt",
      ],
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Access Forbidden if the fetch for container returns 401", () => {
    useContainerResourceIris.mockReturnValue({
      error: { message: "401" },
    });
    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Access Forbidden if the fetch for container returns 403", () => {
    useContainerResourceIris.mockReturnValue({
      error: { message: "403" },
    });
    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Access Forbidden if the fetch for container returns 404", () => {
    useContainerResourceIris.mockReturnValue({
      error: { message: "404" },
    });
    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Not supported if the fetch for container returns 500", () => {
    useContainerResourceIris.mockReturnValue({
      error: { message: "500" },
    });
    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Not Supported if resource loaded is not a container", () => {
    const resourceIri = "http://example.com/resource";
    useDataset.mockReturnValue({
      data: mockSolidDatasetFrom(resourceIri),
    });
    useContainerResourceIris.mockReturnValue({
      data: [],
      mutate: () => {},
    });
    const { asFragment } = renderWithTheme(<Container iri={resourceIri} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
