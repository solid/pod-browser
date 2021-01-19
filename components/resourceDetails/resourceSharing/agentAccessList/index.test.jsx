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
import userEvent from "@testing-library/user-event";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import * as permissionHelpers from "../../../../src/solidClientHelpers/permissions";
import AgentAccessList from ".";
import { AccessControlProvider } from "../../../../src/contexts/accessControlContext";
import mockAccessControl from "../../../../__testUtils/mockAccessControl";
import usePermissions from "../../../../src/hooks/usePermissions";

jest.mock("../../../../src/hooks/usePermissions");

const datasetUrl = "http://example.com/dataset";
const dataset = mockSolidDatasetFrom(datasetUrl);
const { ACL } = permissionHelpers;
const webId = "webId";
const permission = {
  webId,
  alias: ACL.CONTROL.alias,
  acl: ACL.CONTROL.acl,
  profile: { webId },
};

describe("AgentAccessList", () => {
  it("renders loading while loading permissions for access control", () => {
    usePermissions.mockReturnValue({ permissions: null });
    const { asFragment } = renderWithTheme(
      <AgentAccessList accessControl={null} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an empty list of permissions", async () => {
    usePermissions.mockReturnValue({ permissions: [] });
    const accessControl = mockAccessControl();
    const { asFragment } = renderWithTheme(
      <AccessControlProvider accessControl={accessControl}>
        <DatasetProvider dataset={dataset}>
          <AgentAccessList />
        </DatasetProvider>
      </AccessControlProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a list of permissions", async () => {
    usePermissions.mockReturnValue({ permissions: [permission] });
    const accessControl = mockAccessControl({
      permissions: [permission],
    });
    const { asFragment } = renderWithTheme(
      <AccessControlProvider accessControl={accessControl}>
        <DatasetProvider dataset={dataset}>
          <AgentAccessList />
        </DatasetProvider>
      </AccessControlProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it("shows all permissions when clicking 'show all' button", async () => {
    usePermissions.mockReturnValue({
      permissions: [permission, permission, permission, permission],
    });
    const accessControl = mockAccessControl({
      permissions: [permission, permission, permission, permission],
    });
    const { getByTestId, getAllByRole } = renderWithTheme(
      <AccessControlProvider accessControl={accessControl}>
        <DatasetProvider dataset={dataset}>
          <AgentAccessList />
        </DatasetProvider>
      </AccessControlProvider>
    );
    const button = getByTestId("agent-access-list-show-all");
    userEvent.click(button);
    const listItems = getAllByRole("listitem");
    expect(listItems).toHaveLength(4);
  });
});
