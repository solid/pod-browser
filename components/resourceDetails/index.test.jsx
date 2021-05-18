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
import * as accessControlFns from "../../src/accessControl";

const accessControl = mockAccessControl();
const dataset = mockSolidDatasetFrom("http://example.com/container/");

describe("Resource details", () => {
  beforeEach(() => {
    jest
      .spyOn(routerFns, "useRouter")
      .mockReturnValue({ query: { resourceIri: "" } });
  });

  it("renders container details", () => {
    const { asFragment } = renderWithTheme(
      <DatasetProvider solidDataset={dataset}>
        <ResourceDetails />
      </DatasetProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a decoded container name", () => {
    const datasetWithDecodedContainerName = mockSolidDatasetFrom(
      "http://example.com/Some%20container/"
    );

    const { asFragment } = renderWithTheme(
      <DatasetProvider solidDataset={datasetWithDecodedContainerName}>
        <ResourceDetails />
      </DatasetProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Permissions component for WAC-supporting Solid servers", () => {
    jest.spyOn(accessControlFns, "isWac").mockReturnValue(true);
    const { asFragment, getByTestId } = renderWithTheme(
      <AccessControlProvider accessControl={accessControl}>
        <DatasetProvider solidDataset={dataset}>
          <ResourceDetails />
        </DatasetProvider>
      </AccessControlProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_ACCORDION_PERMISSIONS)).toBeDefined();
  });

  it("renders Sharing component for ACP-supporting Solid servers", () => {
    jest.spyOn(accessControlFns, "isAcp").mockReturnValue(true);
    const { asFragment, getByTestId } = renderWithTheme(
      <AccessControlProvider accessControl={accessControl}>
        <DatasetProvider solidDataset={dataset}>
          <ResourceDetails />
        </DatasetProvider>
      </AccessControlProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_ACCORDION_SHARING)).toBeDefined();
  });
});
