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
import useAuthenticatedProfile from "../../src/hooks/useAuthenticatedProfile";
import { mockProfileAlice } from "../../__testUtils/mockPersonResource";
import usePodRootUri from "../../src/hooks/usePodRootUri";
import useResourceInfo from "../../src/hooks/useResourceInfo";
import useAccessControl from "../../src/hooks/useAccessControl";
import { TESTCAFE_ID_AUTH_PROFILE_LOAD_ERROR } from "../authProfileLoadError";
import { TESTCAFE_ID_POD_ROOT_LOAD_ERROR } from "../podRootLoadError";
import { TESTCAFE_ID_NO_CONTROL_ERROR } from "../noControlWarning";
import { TESTCAFE_ID_ACCESS_FORBIDDEN } from "../accessForbidden";
import { TESTCAFE_ID_RESOURCE_NOT_FOUND } from "../resourceNotFound";
import { TESTCAFE_ID_NOT_SUPPORTED } from "../notSupported";

jest.mock("../../src/hooks/useDataset");
jest.mock("../../src/hooks/useContainerResourceIris");
jest.mock("../../src/hooks/useAuthenticatedProfile");
jest.mock("../../src/hooks/usePodRootUri");
jest.mock("../../src/hooks/useResourceInfo");
jest.mock("../../src/hooks/useAccessControl");

describe("Container view", () => {
  const iri = "https://example.com/container/";
  const container = mockSolidDatasetFrom(iri);

  beforeEach(() => {
    useDataset.mockReturnValue({ data: container });
    useAuthenticatedProfile.mockReturnValue({
      data: mockProfileAlice(),
    });
    usePodRootUri.mockReturnValue(iri);
    useResourceInfo.mockReturnValue({ data: container });
    useAccessControl.mockReturnValue({});
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "asPath",
      replace: jest.fn(),
      query: {},
    });
    useContainerResourceIris.mockReturnValue({
      data: [
        "https://myaccount.mypodserver.com/inbox",
        "https://myaccount.mypodserver.com/private",
        "https://myaccount.mypodserver.com/note.txt",
      ],
      mutate: () => {},
    });
  });

  it("renders a table", () => {
    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("Renders a spinner if data is loading", () => {
    useContainerResourceIris.mockReturnValue({
      data: undefined,
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(<Container iri={iri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Access Forbidden if the fetch for container returns 401", () => {
    useDataset.mockReturnValue({
      error: { message: "401" },
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_ACCESS_FORBIDDEN)).toBeDefined();
  });

  it("renders Access Forbidden if the fetch for container returns 403", () => {
    useDataset.mockReturnValue({
      error: { message: "403" },
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_ACCESS_FORBIDDEN)).toBeDefined();
  });

  it("renders Access Forbidden if the fetch for container returns 404", () => {
    useDataset.mockReturnValue({
      error: { message: "404" },
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_RESOURCE_NOT_FOUND)).toBeDefined();
  });

  it("renders Not supported if the fetch for container returns 500", () => {
    useDataset.mockReturnValue({
      error: { message: "500" },
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_NOT_SUPPORTED)).toBeDefined();
  });

  it("renders Not Supported if resource loaded is not a container", () => {
    const resourceIri = "http://example.com/resource";
    useDataset.mockReturnValue({
      data: mockSolidDatasetFrom(resourceIri),
    });
    const { asFragment } = renderWithTheme(<Container iri={resourceIri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders AuthProfileLoadError if fetching authenticated profile fails", () => {
    useAuthenticatedProfile.mockReturnValue({ error: new Error() });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_AUTH_PROFILE_LOAD_ERROR)).toBeDefined();
  });

  it("renders PodRootLoadError if it fails to fetch resourceInfo for podRoot", () => {
    useResourceInfo.mockReturnValue({ error: new Error() });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_POD_ROOT_LOAD_ERROR)).toBeDefined();
  });

  it("renders NoControlError if it fails to get access control for podRoot", () => {
    useAccessControl.mockReturnValue({ error: new Error() });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_NO_CONTROL_ERROR)).toBeDefined();
  });
});
