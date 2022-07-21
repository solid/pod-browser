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
import mockPermissionsContextProvider from "../../__testUtils/mockPermissionsContextProvider";
import useAccessGrantBasedAccessForResource from "../../src/hooks/useAccessGrantBasedAccessForResource";

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

jest.mock("../../src/hooks/useAccessGrantBasedAccessForResource");
const mockedUseAccessGrantBasedAccessForResource =
  useAccessGrantBasedAccessForResource;

const acpFns = solidClientFns.acp_v3;
const PermissionsContextProvider = mockPermissionsContextProvider();

describe("Container view", () => {
  const iri = "https://example.com/container/";
  const resourceIri = "https://example.com/container/resource.txt";
  const container = mockContainer(iri);
  const { dataset } = container;
  const accessControlData = {
    accessControl: mockAccessControl(),
    accessControlType: "acp",
  };

  beforeEach(() => {
    jest.spyOn(accessControlFns, "isAcp").mockReturnValue(true);
    jest.spyOn(acpFns, "isAcpControlled").mockResolvedValue(true);
    mockedContainerHook.mockReturnValue({
      data: container,
      mutate: jest.fn(),
      update: jest.fn(),
    });
    mockedAuthenticatedProfileHook.mockReturnValue(
      mockProfileAlice((t) =>
        solidClientFns.addUrl(t, space.storage, "https://example.com/")
      )
    );
    mockedPodRootUriHook.mockReturnValue(iri);
    mockedResourceInfoHook.mockReturnValue({
      data: dataset,
      isValidating: false,
      mutate: jest.fn(),
      error: null,
    });
    mockedAccessControlHook.mockReturnValue({
      data: accessControlData,
      error: undefined,
      isValidating: false,
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
    mockedUseAccessGrantBasedAccessForResource.mockReturnValue({
      permissions: [],
    });
  });

  it("renders a table", async () => {
    const { asFragment, getByText } = renderWithTheme(
      <PermissionsContextProvider>
        <Container iri={iri} />
      </PermissionsContextProvider>
    );
    await waitFor(() => {
      expect(getByText("inbox")).toBeInTheDocument();
      expect(getByText("private")).toBeInTheDocument();
      expect(getByText("note.txt")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a table for parent container if iri is a resource", async () => {
    mockedGetContainerResourceUrlAll.mockReturnValue([
      "https://myaccount.mypodserver.com/resource.txt",
    ]);
    const { asFragment, getByText } = renderWithTheme(
      <Container iri={resourceIri} />
    );
    await waitFor(() => {
      expect(getByText("resource.txt")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("Renders a spinner if data is loading", async () => {
    mockedGetContainerResourceUrlAll.mockReturnValue(undefined);

    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a spinner if iri is undefined (can happen during build step)", async () => {
    const { getByTestId } = renderWithTheme(<Container iri={undefined} />);
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
    });
  });

  it("renders Access Forbidden if the fetch for container returns 401", async () => {
    mockedContainerHook.mockReturnValue({
      error: new Error("401"),
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_ACCESS_FORBIDDEN)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Access Forbidden if the fetch for container returns 403", async () => {
    mockedContainerHook.mockReturnValue({
      error: new Error("403"),
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_ACCESS_FORBIDDEN)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Not Found if the fetch for container returns 404", async () => {
    mockedContainerHook.mockReturnValue({
      error: new Error("404"),
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_RESOURCE_NOT_FOUND)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Not supported if the fetch for container returns 500", async () => {
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
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_NOT_SUPPORTED)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Not Supported if resource loaded is not a container", async () => {
    mockedContainerHook.mockReturnValue({
      data: mockModel(resourceIri),
      mutate: jest.fn(),
    });

    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={resourceIri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_NOT_SUPPORTED)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders AuthProfileLoadError if fetching authenticated profile fails", async () => {
    mockedAccessControlHook.mockReturnValue({
      data: accessControlData,
      error: undefined,
      isValidating: false,
    });
    mockedAuthenticatedProfileHook.mockReturnValue(null);
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_AUTH_PROFILE_LOAD_ERROR)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders PodRootLoadError if it fails to fetch resourceInfo for podRoot", async () => {
    mockedResourceInfoHook.mockReturnValue({ error: new Error() });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_POD_ROOT_LOAD_ERROR)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders NoControlError if it fails to get access control for podRoot", async () => {
    mockedAccessControlHook.mockReturnValue({
      error: new Error(),
      isValidating: false,
    });
    const { asFragment, getByTestId } = renderWithTheme(
      <Container iri={iri} />
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_NO_CONTROL_ERROR)).toBeDefined();
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
