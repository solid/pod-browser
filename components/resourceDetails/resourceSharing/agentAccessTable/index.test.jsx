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
import AgentAccessTable, { TESTCAFE_ID_AGENT_ACCESS_TABLE } from "./index";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import usePolicyPermissions from "../../../../src/hooks/usePolicyPermissions";
import { fetchProfile } from "../../../../src/solidClientHelpers/profile";
import { TESTCAFE_ID_SEARCH_INPUT } from "../agentsSearchBar";

jest.mock("../../../../src/hooks/usePolicyPermissions");
const mockedUsePolicyPermissions = usePolicyPermissions;

jest.mock("../../../../src/solidClientHelpers/profile");
const mockedFetchProfile = fetchProfile;

const profile1 = {
  avatar: null,
  webId: "https://example1.com/profile/card#me",
  name: "Example 1",
  types: ["https://schema.org/Person"],
};

const profile2 = {
  avatar: null,
  webId: "https://example2.com/profile/card#me",
  name: "Example 2",
  types: ["https://schema.org/Person"],
};

const profile3 = {
  avatar: null,
  webId: "https://example3.com/profile/card#me",
  name: "Example 3",
  types: ["https://schema.org/Person"],
};

const profile4 = {
  avatar: null,
  webId: "https://example4.com/profile/card#me",
  name: "Example 4",
  types: ["https://schema.org/Person"],
};

const permissions = [
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example1.com/profile/card#me",
    type: "agent",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example2.com/profile/card#me",
    type: "agent",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example3.com/profile/card#me",
    type: "agent",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example4.com/profile/card#me",
    type: "agent",
  },
];

describe("AgentAccessTable", () => {
  it("renders an empty list of permissions if there are no permissions and the policy is not custom", () => {
    const type = "editors";
    mockedUsePolicyPermissions.mockReturnValue({
      data: [],
    });
    const { asFragment } = renderWithTheme(<AgentAccessTable type={type} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it("renders an empty list of permissions if permissions are unavailable", () => {
    const type = "editors";
    mockedUsePolicyPermissions.mockReturnValue({
      error: "error",
      data: undefined,
    });
    const { asFragment } = renderWithTheme(<AgentAccessTable type={type} />);

    expect(asFragment()).toMatchSnapshot();
  });
  it("does not render table at all if there aren't any permissions for a custom policy", () => {
    const type = "viewAndAdd";
    mockedUsePolicyPermissions.mockReturnValue({
      data: [],
    });
    const { asFragment, queryByTestId } = renderWithTheme(
      <AgentAccessTable type={type} />
    );

    expect(asFragment()).toMatchSnapshot();
    expect(queryByTestId(TESTCAFE_ID_AGENT_ACCESS_TABLE)).toBeNull();
  });
  it("renders a list of permissions", async () => {
    mockedUsePolicyPermissions.mockReturnValue({
      data: [
        {
          acl: createAccessMap(true, true, false, false),
          webId: "https://example1.com/profile/card#me",
        },
      ],
    });
    mockedFetchProfile.mockReturnValue({ profile: profile1 });
    const type = "editors";
    const { asFragment, queryAllByRole } = renderWithTheme(
      <AgentAccessTable type={type} />
    );

    expect(queryAllByRole("cell")).toHaveLength(1);
    expect(asFragment()).toMatchSnapshot();
  });
  it("shows all permissions when clicking 'show all' button", async () => {
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
    });
    mockedFetchProfile
      .mockReturnValueOnce({ profile: profile1 })
      .mockReturnValueOnce({ profile: profile2 })
      .mockReturnValueOnce({ profile: profile3 })
      .mockReturnValueOnce({ profile: profile4 });

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
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
    });
    mockedFetchProfile
      .mockReturnValueOnce({ profile: profile1 })
      .mockReturnValueOnce({ profile: profile2 })
      .mockReturnValueOnce({ profile: profile3 })
      .mockReturnValueOnce({ profile: profile4 });
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
    mockedUsePolicyPermissions.mockReturnValue({
      data: permissions,
    });
    mockedFetchProfile
      .mockReturnValueOnce({ profile: profile1 })
      .mockReturnValueOnce({ profile: profile2 })
      .mockReturnValueOnce({ profile: profile3 })
      .mockReturnValueOnce({ profile: profile4 });
    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} permissions={permissions} />
    );
    waitFor(() => {
      expect(queryByText("Example 2")).not.toBeNull();
      const searchInput = getByTestId(TESTCAFE_ID_SEARCH_INPUT);
      userEvent.type(searchInput, "2");
      expect(queryByText("Example 4")).toBeNull();
      expect(queryByText("Example 2")).not.toBeNull();
    });
  });
  // TODO: tabs have slightly changed so these tests need to be updated when tabs are restores
  it.skip("renders a set of tabs which filter by Group type", () => {
    const permissionsWithTypes = [
      {
        type: "agent",
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
      },
      {
        type: "group",
        acl: createAccessMap(true, true, false, false),
        webId: "https://example-group.com/profile/card#me",
      },
    ];

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissionsWithTypes,
      mutate: jest.fn(),
    });
    mockedFetchProfile
      .mockReturnValueOnce({ profile: profile1 })
      .mockReturnValueOnce({
        profile: {
          avatar: null,
          name: "Not a person",
        },
      });
    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} />
    );
    waitFor(() => {
      // FIXME: change these test ids
      const tabPeople = getByTestId("tab-people");
      const tabGroups = getByTestId("tab-groups");
      userEvent.click(tabPeople);
      expect(queryByText("Example 1")).not.toBeNull();
      expect(queryByText("Not a person")).toBeNull();
      userEvent.click(tabGroups);
      expect(queryByText("No groups found")).not.toBeNull();
      expect(queryByText("Example 1")).toBeNull();
    });
  });
  it.skip("renders a set of tabs which filter by People type", () => {
    const permissionsWithTypes = [
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example1.com/profile/card#me",
        type: "agent",
      },
      {
        acl: createAccessMap(true, true, false, false),
        webId: "https://example-group.com/profile/card#me",
        type: "group",
      },
    ];

    mockedUsePolicyPermissions.mockReturnValue({
      data: permissionsWithTypes,
      mutate: jest.fn(),
    });
    mockedFetchProfile
      .mockReturnValueOnce({ profile: profile1 })
      .mockReturnValueOnce({
        profile: {
          avatar: null,
          name: "Not a person",
          types: ["Something else"],
        },
      });

    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} />
    );

    waitFor(() => {
      // FIXME: change these test ids
      const tabPeople = getByTestId("tab-people");
      const tabGroups = getByTestId("tab-groups");
      userEvent.click(tabPeople);
      expect(queryByText("No people found")).not.toBeNull();
      expect(queryByText("Not a person")).toBeNull();
      userEvent.click(tabGroups);
      expect(queryByText("Example 1")).not.toBeNull();
      expect(queryByText("Example 2")).not.toBeNull();
    });
  });
});
