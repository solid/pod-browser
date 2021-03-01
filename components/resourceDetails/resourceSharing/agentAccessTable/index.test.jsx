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
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/dom";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import AgentAccessTable from "./index";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import usePolicyPermissions from "../../../../src/hooks/usePolicyPermissions";
import usePermissionsWithProfiles from "../../../../src/hooks/usePermissionsWithProfiles";

jest.mock("../../../../src/hooks/usePolicyPermissions");
const mockedUsePolicyPermissions = usePolicyPermissions;

jest.mock("../../../../src/hooks/usePermissionsWithProfiles");
const mockedUsePermissionsWithProfiles = usePermissionsWithProfiles;

const permissions = [
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example1.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 1",
      types: ["https://schema.org/Person"],
    },
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example2.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 2",
      types: ["https://schema.org/Person"],
    },
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example3.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 3",
      types: ["https://schema.org/Person"],
    },
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example4.com/profile/card#me",
    profile: {
      avatar: null,
      name: "Example 4",
      types: ["https://schema.org/Person"],
    },
  },
];

describe("AgentAccessTable", () => {
  it("renders an empty list of permissions if there are no permissions", () => {
    const type = "editors";
    mockedUsePolicyPermissions.mockReturnValue({
      data: [],
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [],
    });
    const { asFragment } = renderWithTheme(<AgentAccessTable type={type} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it("renders an empty list of permissions if permissions are unavailable", () => {
    const type = "editors";
    mockedUsePolicyPermissions.mockReturnValue({
      error: "error",
      data: undefined,
      mutate: jest.fn(),
    });
    const { asFragment } = renderWithTheme(<AgentAccessTable type={type} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it("does not render table at all if there aren't any permissions for a custom policy", () => {
    const type = "viewAndAdd";
    mockedUsePolicyPermissions.mockReturnValue({
      data: [],
      mutate: jest.fn(),
    });
    const { asFragment } = renderWithTheme(<AgentAccessTable type={type} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it("renders a list of permissions", async () => {
    mockedUsePolicyPermissions.mockReturnValueOnce({
      data: [
        {
          acl: createAccessMap(true, true, false, false),
          webId: "https://example1.com/profile/card#me",
          profile: {
            avatar: null,
            name: "Example 1",
            types: ["https://schema.org/Person"],
          },
        },
      ],
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [
        {
          acl: createAccessMap(true, true, false, false),
          webId: "https://example1.com/profile/card#me",
          profile: {
            avatar: null,
            name: "Example 1",
            types: ["https://schema.org/Person"],
          },
        },
      ],
    });
    const type = "editors";
    const { asFragment, queryAllByRole } = renderWithTheme(
      <AgentAccessTable type={type} />
    );

    expect(queryAllByRole("cell")).toHaveLength(1);
    expect(asFragment()).toMatchSnapshot();
  });
  it("shows all permissions when clicking 'show all' button", async () => {
    mockedUsePolicyPermissions.mockReturnValueOnce({
      data: permissions,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <AgentAccessTable type={type} />
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    expect(queryAllByRole("cell")).toHaveLength(4);
  });
  it("shows first 3 permissions by default and when clicking the 'hide' button", async () => {
    mockedUsePolicyPermissions.mockReturnValueOnce({
      data: permissions,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <AgentAccessTable type={type} permissions={permissions} />
    );
    const showAllButton = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(showAllButton);
    expect(queryAllByRole("cell")).toHaveLength(4);
    const hideButton = getByTestId("hide-button");
    userEvent.click(hideButton);
    expect(queryAllByRole("cell")).toHaveLength(3);
  });
  it("renders a search box which filters by name or webId", () => {
    mockedUsePolicyPermissions.mockReturnValueOnce({
      data: permissions,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissions,
    });
    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} permissions={permissions} />
    );
    const searchInput = getByTestId("search-input");
    userEvent.type(searchInput, "2");
    expect(queryByText("Example 4")).toBeNull();
    expect(queryByText("Example 2")).not.toBeNull();
  });
  // TODO: this will change once we have groups and a new way of filtering when we have groups
  it("renders a set of tabs which filter by Group type", () => {
    const permissionsWithTypes = [
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
        profile: {
          avatar: null,
          name: "Example 1",
          types: ["https://schema.org/Person"],
        },
      },
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
        profile: {
          avatar: null,
          name: "Not a person",
          types: ["Something else"],
        },
      },
    ];

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissionsWithTypes,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissionsWithTypes,
    });

    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} />
    );
    const tabPeople = getByTestId("tab-people");
    const tabGroups = getByTestId("tab-groups");
    userEvent.click(tabPeople);
    expect(queryByText("Example 1")).not.toBeNull();
    expect(queryByText("Not a person")).toBeNull();
    userEvent.click(tabGroups);
    expect(queryByText("No groups found")).not.toBeNull();
    expect(queryByText("Example 1")).toBeNull();
  });
  it("renders a set of tabs which filter by People type", () => {
    const permissionsWithTypes = [
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
        profile: {
          avatar: null,
          name: "Example 1",
          types: ["Not a Person"],
        },
      },
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
        profile: {
          avatar: null,
          name: "Example 2",
          types: ["Not a Person"],
        },
      },
    ];

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissionsWithTypes,
      mutate: jest.fn(),
    });
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissionsWithTypes,
    });

    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} />
    );
    const tabPeople = getByTestId("tab-people");
    const tabGroups = getByTestId("tab-groups");
    userEvent.click(tabPeople);
    waitFor(() => {
      expect(queryByText("No people found")).not.toBeNull();
      expect(queryByText("Not a person")).toBeNull();
      userEvent.click(tabGroups);
      expect(queryByText("Example 1")).not.toBeNull();
      expect(queryByText("Example 2")).not.toBeNull();
    });
  });
});
