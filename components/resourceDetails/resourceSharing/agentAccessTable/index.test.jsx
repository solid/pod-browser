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
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import AgentAccessTable, { TESTCAFE_ID_AGENT_ACCESS_TABLE } from "./index";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import usePermissionsWithProfiles from "../../../../src/hooks/usePermissionsWithProfiles";
import mockPermissionsContextProvider from "../../../../__testUtils/mockPermissionsContextProvider";
import getSignedVc from "../../../../__testUtils/mockSignedVc";
import { TESTCAFE_ID_SEARCH_INPUT } from "../agentsSearchBar";
// import {
//   TESTCAFE_ID_TAB_PEOPLE,
//   TESTCAFE_ID_TAB_GROUPS,
// } from "../agentsTableTabs";
import {
  PUBLIC_AGENT_PREDICATE,
  PUBLIC_AGENT_TYPE,
} from "../../../../src/models/contact/public";
import {
  AUTHENTICATED_AGENT_PREDICATE,
  AUTHENTICATED_AGENT_TYPE,
} from "../../../../src/models/contact/authenticated";

jest.mock("../../../../src/hooks/usePermissionsWithProfiles");
const mockedUsePermissionsWithProfiles = usePermissionsWithProfiles;

const PermissionsContextProvider = mockPermissionsContextProvider();
const EmptyPermissionsContextProvider = mockPermissionsContextProvider({
  permissions: [],
});

const profile1 = {
  avatar: null,
  webId: "https://example1.com/profile/card#me",
  name: "Example A",
  types: ["https://schema.org/Person"],
};

const profile2 = {
  avatar: null,
  webId: "https://example2.com/profile/card#me",
  name: "Example B",
  types: ["https://schema.org/Person"],
};

const profile3 = {
  avatar: null,
  webId: "https://example3.com/profile/card#me",
  name: "Example C",
  types: ["https://schema.org/Person"],
};

const profile4 = {
  avatar: null,
  webId: "https://example4.com/profile/card#me",
  name: "Example D",
  types: ["https://schema.org/Person"],
};

const appProfile = {
  avatar: null,
  name: "Mock App",
  types: ["https://schema.org/SoftwareApplication"],
};

const profiles = [profile1, profile2, profile3, profile4];

const profilesWithApp = [profile1, appProfile];

const publicPermission = {
  acl: createAccessMap(true, true, false, false),
  webId: PUBLIC_AGENT_PREDICATE,
  type: PUBLIC_AGENT_TYPE,
};

const authenticatedPermission = {
  acl: createAccessMap(true, true, false, false),
  webId: AUTHENTICATED_AGENT_PREDICATE,
  type: AUTHENTICATED_AGENT_TYPE,
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

const permissionsWithConsentAgent = [
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example1.com/profile/card#me",
    type: "agent",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://mockapp.com/app#id",
    type: "agent",
    vc: getSignedVc(),
  },
];

const permissionsWithProfiles = permissions.map((p, i) => {
  return {
    ...p,
    profile: profiles[i],
  };
});

const permissionsWithProfilesNamelessAgent = [
  ...permissionsWithProfiles,
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example6.com/profile/card#me",
    type: "agent",
    profile: {
      avatar: null,
      webId: "https://example6.com/profile/card#me",
      types: ["https://schema.org/Person"],
    },
  },
];

const permissionsWithConsentWithProfiles = permissionsWithConsentAgent.map(
  (p, i) => {
    return {
      ...p,
      profile: profilesWithApp[i],
    };
  }
);

const permissionsWithProfilesMixedTypes = [
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example1.com/profile/card#me",
    type: "agent",
    profile: profile1,
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example4.com/profile/card#me",
    type: "agent",
    profile: {
      avatar: null,
      name: "Not a person",
      types: ["Something else"],
    },
  },
];
describe("AgentAccessTable with agents", () => {
  const mockDataset = mockSolidDatasetFrom("https://example.org/resource");
  const setLoading = jest.fn();
  beforeEach(() => {
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });
  });
  it("renders a list of permissions", async () => {
    const type = "editors";
    const { asFragment, queryAllByRole } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );

    expect(queryAllByRole("cell")).toHaveLength(3);
    expect(asFragment()).toMatchSnapshot();
  });
  it("shows all permissions when clicking 'show all' button", async () => {
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });

    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    expect(queryAllByRole("cell")).toHaveLength(4);
  });
  it("agents appear in alphabetical order with public and authenticated first", async () => {
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [
        publicPermission,
        authenticatedPermission,
        ...permissionsWithProfiles,
      ],
    });

    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    const cells = queryAllByRole("cell");
    expect(cells).toHaveLength(6);
    expect(cells[0]).toHaveTextContent("Anyone");
    expect(cells[1]).toHaveTextContent("Anyone signed in");
    expect(cells[2]).toHaveTextContent("Example A");
    expect(cells[3]).toHaveTextContent("Example B");
    expect(cells[4]).toHaveTextContent("Example C");
    expect(cells[5]).toHaveTextContent("Example D");
  });
  it("agents without names appear after alphabetical ordered agents", async () => {
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [
        publicPermission,
        authenticatedPermission,
        ...permissionsWithProfilesNamelessAgent,
      ],
    });

    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    const cells = queryAllByRole("cell");
    expect(cells).toHaveLength(7);
    expect(cells[0]).toHaveTextContent("Anyone");
    expect(cells[1]).toHaveTextContent("Anyone signed in");
    expect(cells[2]).toHaveTextContent("Example A");
    expect(cells[3]).toHaveTextContent("Example B");
    expect(cells[4]).toHaveTextContent("Example C");
    expect(cells[5]).toHaveTextContent("Example D");
    expect(cells[6]).toHaveTextContent("https://example6.com/profile/card#me");
  });

  it("shows first 3 permissions by default and when clicking the 'hide' button", () => {
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });
    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );
    const showAllButton = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(showAllButton);
    expect(queryAllByRole("cell")).toHaveLength(4);
    const hideButton = getByTestId("hide-button");
    userEvent.click(hideButton);
    expect(queryAllByRole("cell")).toHaveLength(3);
  });
  it("renders a search box which filters by name or webId", async () => {
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles,
    });

    const type = "editors";
    const { getByTestId, queryByText, queryByTestId } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );
    await waitFor(() => {
      expect(queryByTestId("spinner")).toBeNull();
    });
    expect(queryByText("Example B")).not.toBeNull();
    const searchInput = getByTestId(TESTCAFE_ID_SEARCH_INPUT);
    userEvent.type(searchInput, "B");
    expect(queryByText("Example C")).toBeNull();
    expect(queryByText("Example B")).not.toBeNull();
  });
  // TODO: tabs have slightly changed so these tests need to be updated when tabs are restored
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

    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissionsWithProfilesMixedTypes,
    });
    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} setLoading={setLoading} />
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

    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissionsWithProfilesMixedTypes,
    });

    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} setLoading={setLoading} />
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
describe("AgentAccessTable with consent based agents", () => {
  const mockDataset = mockSolidDatasetFrom("https://example.org/resource");
  const setLoading = jest.fn();
  beforeEach(() => {
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: permissionsWithConsentWithProfiles,
    });
  });

  it("renders a list of permissions including consent based agent", async () => {
    const type = "editors";
    const { asFragment, queryAllByRole } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );

    expect(queryAllByRole("cell")).toHaveLength(2);
    expect(asFragment()).toMatchSnapshot();
  });
});
describe("AgentAccessTable without agents", () => {
  const mockDataset = mockSolidDatasetFrom("https://example.org/resource");
  const setLoading = jest.fn();
  it("renders an empty list of permissions if there are no permissions and the policy is not custom", () => {
    const type = "editors";
    mockedUsePermissionsWithProfiles.mockReturnValue({
      permissionsWithProfiles: [],
    });
    const { asFragment } = renderWithTheme(
      <EmptyPermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </EmptyPermissionsContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
  it("renders an empty list of permissions if permissions are unavailable", () => {
    const type = "editors";
    const { asFragment } = renderWithTheme(
      <EmptyPermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </EmptyPermissionsContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
  it("does not render table at all if there aren't any permissions for a custom policy", () => {
    const type = "viewAndAdd";
    const { asFragment, queryByTestId } = renderWithTheme(
      <EmptyPermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </EmptyPermissionsContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
    expect(queryByTestId(TESTCAFE_ID_AGENT_ACCESS_TABLE)).toBeNull();
  });
});
