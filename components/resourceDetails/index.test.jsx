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
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import * as routerFns from "next/router";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ResourceDetails, {
  TESTCAFE_ID_ACCORDION_PERMISSIONS,
  TESTCAFE_ID_ACCORDION_SHARING,
} from "./index";
import mockAccessControl from "../../__testUtils/mockAccessControl";
import { AccessControlProvider } from "../../src/contexts/accessControlContext";
import mockPermissionsContextProvider from "../../__testUtils/mockPermissionsContextProvider";
import useConsentBasedAccessForResource from "../../src/hooks/useConsentBasedAccessForResource";
import useAcp from "../../src/hooks/useAcp";
import useWac from "../../src/hooks/useWac";
import { TESTCAFE_ID_AGENT_ACCESS_TABLE } from "./resourceSharing/agentAccessTable";

const accessControl = mockAccessControl();
const dataset = mockSolidDatasetFrom("http://example.com/container/");

jest.mock("../../src/hooks/useConsentBasedAccessForResource");
const mockedUseConsentBasedAccessForResource = useConsentBasedAccessForResource;

jest.mock("../../src/hooks/useAcp");
jest.mock("../../src/hooks/useWac");
const mockUseAcp = useAcp;
const mockUseWac = useWac;

jest.mock("../../src/hooks/useConsentBasedAccessForResource");
const mockUseConsentBasedAccessForResource = useConsentBasedAccessForResource;

describe("Resource details", () => {
  beforeEach(() => {
    jest
      .spyOn(routerFns, "useRouter")
      .mockReturnValue({ query: { resourceIri: "" }, push: jest.fn() });
    mockedUseConsentBasedAccessForResource.mockReturnValue([]);
  });

  it("renders container details", async () => {
    mockUseAcp.mockReturnValue({ data: true });
    mockUseWac.mockReturnValue({ data: false });
    const { asFragment, getByText } = renderWithTheme(
      <DatasetProvider solidDataset={dataset}>
        <ResourceDetails />
      </DatasetProvider>
    );
    await waitFor(() => {
      expect(getByText("container")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a decoded container name", async () => {
    mockUseAcp.mockReturnValue({ data: true });
    mockUseWac.mockReturnValue({ data: false });
    const datasetWithDecodedContainerName = mockSolidDatasetFrom(
      "http://example.com/Some%20container/"
    );

    const { asFragment, getByText } = renderWithTheme(
      <DatasetProvider solidDataset={datasetWithDecodedContainerName}>
        <ResourceDetails />
      </DatasetProvider>
    );
    await waitFor(() => {
      expect(getByText("Some container")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Permissions component for WAC-supporting Solid servers", async () => {
    mockUseAcp.mockReturnValue({ data: false });
    mockUseWac.mockReturnValue({ data: true });
    const { asFragment, getByTestId, getByText } = renderWithTheme(
      <AccessControlProvider accessControl={accessControl}>
        <DatasetProvider solidDataset={dataset}>
          <ResourceDetails />
        </DatasetProvider>
      </AccessControlProvider>
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_ACCORDION_PERMISSIONS)).toBeDefined();
      expect(getByText("Permissions")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  }, 30000);

  it("renders Sharing component for ACP-supporting Solid servers", async () => {
    mockUseAcp.mockReturnValue({ data: true });
    mockUseWac.mockReturnValue({ data: false });
    const PermissionsContextProvider = mockPermissionsContextProvider();
    mockUseConsentBasedAccessForResource.mockReturnValue({ permissions: [] });
    const {
      asFragment,
      getByTestId,
      getByText,
      queryAllByTestId,
    } = renderWithTheme(
      <AccessControlProvider accessControl={accessControl}>
        <DatasetProvider solidDataset={dataset}>
          <PermissionsContextProvider>
            <ResourceDetails />
          </PermissionsContextProvider>
        </DatasetProvider>
      </AccessControlProvider>
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_ACCORDION_SHARING)).toBeDefined();
      expect(getByText("Sharing")).toBeInTheDocument();
    });
    userEvent.click(getByText("Sharing"));
    await waitFor(() => {
      expect(queryAllByTestId(TESTCAFE_ID_AGENT_ACCESS_TABLE)).toHaveLength(2);
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
