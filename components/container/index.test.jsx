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
import * as solidClientFns from "@inrupt/solid-client";
import { act } from "@testing-library/react-hooks";
import { waitFor } from "@testing-library/dom";
import { space } from "rdf-namespaces";
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import Container from "./index";
import useContainer from "../../src/hooks/useContainer";
import useAuthenticatedProfile from "../../src/hooks/useAuthenticatedProfile";
import { mockProfileAlice } from "../../__testUtils/mockPersonResource";
import usePodRootUri from "../../src/hooks/usePodRootUri";
import useResourceInfo from "../../src/hooks/useResourceInfo";
import useAccessControl from "../../src/hooks/useAccessControl";
import { mockContainer } from "../../__testUtils/mockContainer";
import { mockModel } from "../../__testUtils/mockModel";
import { getContainerResourceUrlAll } from "../../src/models/container";
import { TESTCAFE_ID_AUTH_PROFILE_LOAD_ERROR } from "../authProfileLoadError";
import { TESTCAFE_ID_POD_ROOT_LOAD_ERROR } from "../podRootLoadError";
import { TESTCAFE_ID_NO_CONTROL_ERROR } from "../noControlWarning";
import { TESTCAFE_ID_ACCESS_FORBIDDEN } from "../accessForbidden";
import { TESTCAFE_ID_RESOURCE_NOT_FOUND } from "../resourceNotFound";
import { TESTCAFE_ID_NOT_SUPPORTED } from "../notSupported";
import { TESTCAFE_ID_SPINNER } from "../spinner";
import * as accessControlFns from "../../src/accessControl";
import mockAccessControl from "../../__testUtils/mockAccessControl";

jest.mock("../../src/hooks/useContainer");
const mockedContainerHook = useContainer;

jest.mock("../../src/models/container");
const mockedGetContainerResourceUrlAll = getContainerResourceUrlAll;

jest.mock("../../src/hooks/useAuthenticatedProfile");
const mockedAuthenticatedProfileHook = useAuthenticatedProfile;

jest.mock("../../src/hooks/usePodRootUri");
const mockedPodRootUriHook = usePodRootUri;

jest.mock("../../src/hooks/useResourceInfo");
const mockedResourceInfoHook = useResourceInfo;

jest.mock("../../src/hooks/useAccessControl");
const mockedAccessControlHook = useAccessControl;

const acpFns = solidClientFns.acp_v3;

describe("Container view", () => {
  const iri = "https://example.com/container/";
  const resourceIri = "https://example.com/container/resource.txt";
  const container = mockContainer(iri);
  const { dataset } = container;

  beforeEach(() => {
    act(() => {
      jest.spyOn(accessControlFns, "isAcp").mockReturnValue(true);
      jest.spyOn(acpFns, "isAcpControlled").mockResolvedValue(true);
    });
    mockedContainerHook.mockReturnValue({
      data: container,
      mutate: jest.fn(),
      update: jest.fn(),
    });
    mockedAuthenticatedProfileHook.mockReturnValue({
      data: mockProfileAlice((t) =>
        solidClientFns.addUrl(t, space.storage, "https://example.com/")
      ),
    });
    mockedPodRootUriHook.mockReturnValue(iri);
    mockedResourceInfoHook.mockReturnValue({ data: dataset });
    mockedAccessControlHook.mockReturnValue({
      accessControl: mockAccessControl(),
    });
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "asPath",
      replace: jest.fn(),
      query: {},
      push: jest.fn(),
    });
    mockedGetContainerResourceUrlAll.mockReturnValue([
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ]);
  });

  test("renders a table", async () => {
    const { asFragment, getByText } = renderWithTheme(<Container iri={iri} />);
    await waitFor(() => {
      expect(getByText("inbox")).toBeInTheDocument();
      expect(getByText("private")).toBeInTheDocument();
      expect(getByText("note.txt")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders a table for parent container if iri is a resource", () => {
    const { asFragment } = renderWithTheme(<Container iri={resourceIri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("Renders a spinner if data is loading", () => {
    mockedGetContainerResourceUrlAll.mockReturnValue(undefined);

    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
  });

  it("renders a spinner if iri is undefined (can happen during build step)", () => {
    const { getByTestId } = renderWithTheme(<Container iri={undefined} />);
    expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
  });

  it("renders Access Forbidden if the fetch for container returns 401", () => {
    mockedContainerHook.mockReturnValue({
      error: new Error("401"),
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_ACCESS_FORBIDDEN)).toBeDefined();
  });

  it("renders Access Forbidden if the fetch for container returns 403", () => {
    mockedContainerHook.mockReturnValue({
      error: new Error("403"),
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_ACCESS_FORBIDDEN)).toBeDefined();
  });

  it("renders Access Forbidden if the fetch for container returns 404", () => {
    mockedContainerHook.mockReturnValue({
      error: new Error("404"),
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_RESOURCE_NOT_FOUND)).toBeDefined();
  });

  it("renders Not supported if the fetch for container returns 500", () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    mockedContainerHook.mockReturnValue({
      error: new Error("500"),
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <SessionProvider>
        <Container iri={iri} />
      </SessionProvider>
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_NOT_SUPPORTED)).toBeDefined();
  });

  it("renders Not Supported if resource loaded is not a container", () => {
    mockedContainerHook.mockReturnValue({
      data: mockModel(resourceIri),
      mutate: jest.fn(),
    });
    const { asFragment } = renderWithTheme(<Container iri={resourceIri} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders AuthProfileLoadError if fetching authenticated profile fails", () => {
    mockedAuthenticatedProfileHook.mockReturnValue({ error: new Error() });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_AUTH_PROFILE_LOAD_ERROR)).toBeDefined();
  });

  it("renders PodRootLoadError if it fails to fetch resourceInfo for podRoot", () => {
    mockedResourceInfoHook.mockReturnValue({ error: new Error() });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_POD_ROOT_LOAD_ERROR)).toBeDefined();
  });

  it("renders NoControlError if it fails to get access control for podRoot", () => {
    mockedAccessControlHook.mockReturnValue({ error: new Error() });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_NO_CONTROL_ERROR)).toBeDefined();
  });
});
