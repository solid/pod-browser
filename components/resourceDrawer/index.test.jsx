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
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { waitFor } from "@testing-library/dom";
import * as solidClientFns from "@inrupt/solid-client";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import ResourceDrawer, {
  handleCloseDrawer,
  handleRedirectToParentContainer,
} from "./index";
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockDetailsContextMenuProvider from "../../__testUtils/mockDetailsContextMenuProvider";
import useResourceInfo from "../../src/hooks/useResourceInfo";
import useAccessControl from "../../src/hooks/useAccessControl";
import mockAccessControl from "../../__testUtils/mockAccessControl";
import { ResourceInfoProvider } from "../../src/contexts/resourceInfoContext";
import mockPermissionsContextProvider from "../../__testUtils/mockPermissionsContextProvider";
import useConsentBasedAccessForResource from "../../src/hooks/useConsentBasedAccessForResource";
import usePermissionsWithProfiles from "../../src/hooks/usePermissionsWithProfiles";
import useAllPermissions from "../../src/hooks/useAllPermissions";

jest.mock("../../src/hooks/useResourceInfo");
const mockUseResourceInfo = useResourceInfo;
jest.mock("../../src/hooks/useAccessControl");
jest.mock("../../src/hooks/useConsentBasedAccessForResource");
const mockUseConsentBasedAccessForResource = useConsentBasedAccessForResource;
jest.mock("../../src/hooks/usePermissionsWithProfiles");
const mockedUsePermissionsWithProfiles = usePermissionsWithProfiles;
jest.mock("../../src/hooks/useAllPermissions");
const mockedUseAllPermissions = useAllPermissions;

const mockedUseRouter = jest.spyOn(RouterFns, "useRouter");

const acp = solidClientFns.acp_v3;

const iri = "/iri/";
const iriWithSpaces = "/iri with spaces/";

describe("ResourceDrawer view", () => {
  const resourceInfo = solidClientFns.mockSolidDatasetFrom(iri);
  const resourceInfoWithSpaces = solidClientFns.mockSolidDatasetFrom(
    iriWithSpaces
  );
  jest.spyOn(acp, "isAcpControlled").mockResolvedValue(true);
  jest.spyOn(acp, "hasLinkedAcr").mockResolvedValue(true);

  let accessControl;
  let fetch;
  let session;
  let SessionProvider;
  let DetailsMenuContext;

  const data = resourceInfo;
  const error = null;
  const mutate = () => {};
  const isValidating = false;
  const swr = { data, error, mutate, isValidating };

  beforeEach(() => {
    fetch = jest.fn();
    session = mockSession({
      fetch,
    });
    SessionProvider = mockSessionContextProvider(session);
    accessControl = mockAccessControl();
    mockUseConsentBasedAccessForResource.mockReturnValue({ permissions: [] });
    mockedUsePermissionsWithProfiles.mockReturnValue({ permissions: [] });
    mockedUseAllPermissions.mockReturnValue({ permissions: [] });

    useAccessControl.mockReturnValue({ accessControl });
    mockUseResourceInfo.mockReturnValue(swr);

    DetailsMenuContext = mockDetailsContextMenuProvider({
      menuOpen: true,
      setMenuOpen: jest.fn,
    });
  });
  const PermissionsContextProvider = mockPermissionsContextProvider();

  test("it renders a loading view when context has no iri", async () => {
    mockUseResourceInfo.mockReturnValue({ data: null });
    const DetailsContext = mockDetailsContextMenuProvider({
      menuOpen: true,
      setMenuOpen: jest.fn,
    });

    mockedUseRouter.mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {},
    });

    const { asFragment, queryByText } = renderWithTheme(
      <DetailsContext>
        <PermissionsContextProvider>
          <DatasetProvider solidDataset={resourceInfo}>
            <ResourceDrawer />
          </DatasetProvider>
        </PermissionsContextProvider>
      </DetailsContext>
    );
    await waitFor(() => {
      expect(queryByText("iri")).not.toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test("it renders a Contents view when the router query has an iri", async () => {
    mockedUseRouter.mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {
        resourceIri: iri,
        action: "details",
      },
    });
    const { asFragment, getByText } = renderWithTheme(
      <SessionProvider>
        <ResourceInfoProvider swr={swr}>
          <DetailsMenuContext>
            <PermissionsContextProvider>
              <DatasetProvider solidDataset={resourceInfo}>
                <ResourceDrawer />
              </DatasetProvider>
            </PermissionsContextProvider>
          </DetailsMenuContext>
        </ResourceInfoProvider>
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getByText("iri")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  test("it renders without errors when iri contains spaces", async () => {
    mockUseResourceInfo.mockReturnValue({
      ...swr,
      data: resourceInfoWithSpaces,
    });
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {
        resourceIri: iriWithSpaces,
        action: "details",
      },
    });
    const { asFragment, getByText } = renderWithTheme(
      <SessionProvider>
        <ResourceInfoProvider swr={{ ...swr, data: resourceInfoWithSpaces }}>
          <DetailsMenuContext>
            <PermissionsContextProvider>
              <DatasetProvider solidDataset={resourceInfo}>
                <ResourceDrawer />
              </DatasetProvider>
            </PermissionsContextProvider>
          </DetailsMenuContext>
        </ResourceInfoProvider>
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getByText("iri with spaces")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("uses resource dataset", () => {
    jest.spyOn(RouterFns, "useRouter").mockReturnValueOnce({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {
        resourceIri: iri,
        action: "details",
      },
    });
    renderWithTheme(
      <SessionProvider>
        <DetailsMenuContext>
          <PermissionsContextProvider>
            <DatasetProvider solidDataset={resourceInfo}>
              <ResourceDrawer />
            </DatasetProvider>
          </PermissionsContextProvider>
        </DetailsMenuContext>
      </SessionProvider>
    );
    expect(useResourceInfo).toHaveBeenCalledWith(encodeURI(iri), {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    });
  });

  it("uses access control", () => {
    renderWithTheme(
      <SessionProvider>
        <DetailsMenuContext>
          <PermissionsContextProvider>
            <DatasetProvider solidDataset={resourceInfo}>
              <ResourceDrawer />
            </DatasetProvider>
          </PermissionsContextProvider>
        </DetailsMenuContext>
      </SessionProvider>
    );
    expect(useAccessControl).toHaveBeenCalledWith(resourceInfo);
  });

  it("renders a specific error message if resource fails with 403", () => {
    useResourceInfo.mockReturnValue({ error: new Error("403") });

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <DetailsMenuContext>
          <PermissionsContextProvider>
            <DatasetProvider solidDataset={resourceInfo}>
              <ResourceDrawer />
            </DatasetProvider>
          </PermissionsContextProvider>
        </DetailsMenuContext>
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an error message if resource fails to load", () => {
    useResourceInfo.mockReturnValue({ error: new Error("error") });

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <DetailsMenuContext>
          <PermissionsContextProvider>
            <DatasetProvider solidDataset={resourceInfo}>
              <ResourceDrawer />
            </DatasetProvider>
          </PermissionsContextProvider>
        </DetailsMenuContext>
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("handleCloseDrawer", () => {
  test("it creates a function to close the drawer", async () => {
    const setMenuOpen = jest.fn();
    const router = {
      asPath: "/path?with=query",
      replace: jest.fn(),
    };
    const handler = handleCloseDrawer({ setMenuOpen, router });
    await handler();

    expect(setMenuOpen).toHaveBeenCalledWith(false);
    expect(router.replace).toHaveBeenCalledWith("/resource/[iri]", "/path");
  });

  it("defaults pathname to /", async () => {
    const setMenuOpen = jest.fn();
    const router = {
      asPath: "?with=query",
      replace: jest.fn(),
    };
    const handler = handleCloseDrawer({ setMenuOpen, router });
    await handler();

    expect(setMenuOpen).toHaveBeenCalledWith(false);
    expect(router.replace).toHaveBeenCalledWith("/resource/[iri]", "/");
  });
});

describe("handleRedirectToParentContainer", () => {
  test("it creates a function that closes the drawer and redirects to parent container", async () => {
    const setMenuOpen = jest.fn();
    const router = {
      replace: jest.fn(),
    };
    const subfolderIri = "https://example.org/folder/subfolder/";
    const handler = handleRedirectToParentContainer({
      setMenuOpen,
      iri: subfolderIri,
      router,
    });
    await handler();

    expect(setMenuOpen).toHaveBeenCalledWith(false);
    expect(router.replace).toHaveBeenCalledWith(
      "/resource/[iri]",
      `/resource/${encodeURIComponent("https://example.org/folder/")}`
    );
  });
});
