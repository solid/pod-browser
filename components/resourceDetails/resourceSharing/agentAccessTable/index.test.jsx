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
import { foaf, schema } from "rdf-namespaces";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import AgentAccessTable, { TESTCAFE_ID_AGENT_ACCESS_TABLE } from "./index";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import useFullProfile from "../../../../src/hooks/useFullProfile";
import mockPermissionsContextProvider from "../../../../__testUtils/mockPermissionsContextProvider";
import getSignedVc from "../../../../__testUtils/mockSignedVc";
import { TESTCAFE_ID_SEARCH_INPUT } from "../agentsSearchBar";
import {
  PUBLIC_AGENT_PREDICATE,
  PUBLIC_AGENT_TYPE,
} from "../../../../src/models/contact/public";
import {
  AUTHENTICATED_AGENT_PREDICATE,
  AUTHENTICATED_AGENT_TYPE,
} from "../../../../src/models/contact/authenticated";

jest.mock("../../../../src/hooks/useFullProfile");
const mockedUseFullProfile = useFullProfile;

const publicPermission = {
  acl: createAccessMap(true, true, false, false),
  webId: PUBLIC_AGENT_PREDICATE,
  alias: "editors",
  type: PUBLIC_AGENT_TYPE,
};

const authenticatedPermission = {
  acl: createAccessMap(true, true, false, false),
  webId: AUTHENTICATED_AGENT_PREDICATE,
  alias: "editors",
  type: AUTHENTICATED_AGENT_TYPE,
};

const permissions = [
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example1.com/profile/card#me",
    type: "agent",
    alias: "editors",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example2.com/profile/card#me",
    type: "agent",
    alias: "editors",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example3.com/profile/card#me",
    type: "agent",
    alias: "editors",
  },
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://example4.com/profile/card#me",
    type: "agent",
    alias: "editors",
  },
];

const permissionsWithAccessGrantBasedAccessAgent = [
  permissions[0],
  {
    acl: createAccessMap(true, true, false, false),
    webId: "https://mockapp.com/app#id",
    type: "agent",
    alias: "editors",
    vc: getSignedVc(),
  },
];

const profile1 = {
  names: ["Example A"],
  webId: "https://example1.com/profile/card#me",
  types: [foaf.Person],
  avatars: [],
  roles: [],
  organizations: [],
  contactInfo: {
    phones: [],
    emails: [],
  },
};
const profile2 = {
  names: ["Example B"],
  webId: "https://example2.com/profile/card#me",
  types: [foaf.Person],
  avatars: [],
  roles: [],
  organizations: [],
  contactInfo: {
    phones: [],
    emails: [],
  },
};
const profile3 = {
  names: ["Example C"],
  webId: "https://example3.com/profile/card#me",
  types: [foaf.Person],
  avatars: [],
  roles: [],
  organizations: [],
  contactInfo: {
    phones: [],
    emails: [],
  },
};
const profile4 = {
  names: ["Example C"],
  webId: "https://example4.com/profile/card#me",
  types: [foaf.Person],
  avatars: [],
  roles: [],
  organizations: [],
  contactInfo: {
    phones: [],
    emails: [],
  },
};

const appProfile = {
  names: ["Mock App"],
  webId: "https://mockappurl.com",
  types: [schema.SoftwareApplication],
  avatars: [],
  roles: [],
  organizations: [],
  contactInfo: {
    phones: [],
    emails: [],
  },
};

const PermissionsContextProvider = mockPermissionsContextProvider({
  permissions,
});
const EmptyPermissionsContextProvider = mockPermissionsContextProvider({
  permissions: [],
});
const PermissionsContextProviderWithPublicAndAuth =
  mockPermissionsContextProvider({
    permissions: [...permissions, publicPermission, authenticatedPermission],
  });
const PermissionsContextProviderWithAccessGrants =
  mockPermissionsContextProvider({
    permissions: permissionsWithAccessGrantBasedAccessAgent,
  });

describe("AgentAccessTable with access based agents", () => {
  const mockDataset = mockSolidDatasetFrom("https://example.org/resource");
  const setLoading = jest.fn();

  it("renders a list of permissions including access based agent", async () => {
    const type = "editors";
    mockedUseFullProfile
      .mockReturnValueOnce(profile1)
      .mockReturnValueOnce(profile2)
      .mockReturnValueOnce(profile3)
      .mockReturnValueOnce(profile4);
    const { asFragment, queryAllByRole } = renderWithTheme(
      <PermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProvider>
    );
    await waitFor(() => {
      expect(queryAllByRole("cell")).toHaveLength(3);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("shows all permissions when clicking 'show all' button", async () => {
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
    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <PermissionsContextProviderWithPublicAndAuth>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProviderWithPublicAndAuth>
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    await waitFor(() => {
      const cells = queryAllByRole("cell");
      expect(cells).toHaveLength(6);
      expect(cells[0]).toHaveTextContent("Anyone");
      expect(cells[1]).toHaveTextContent("Anyone signed in");
    });
  });

  it("shows first 3 permissions by default and when clicking the 'hide' button", () => {
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

describe("AgentAccessTable with access grant based agents", () => {
  const mockDataset = mockSolidDatasetFrom("https://example.org/resource");
  const setLoading = jest.fn();

  it("renders a list of permissions including access grant based agent", async () => {
    const type = "editors";
    mockedUseFullProfile
      .mockReturnValueOnce(profile1)
      .mockReturnValueOnce(appProfile);
    const { asFragment, queryAllByRole } = renderWithTheme(
      <PermissionsContextProviderWithAccessGrants>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} />
        </DatasetProvider>
      </PermissionsContextProviderWithAccessGrants>
    );

    expect(queryAllByRole("cell")).toHaveLength(2);
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("AgentAccessTable without agents", () => {
  const mockDataset = mockSolidDatasetFrom("https://example.org/resource");
  const setLoading = jest.fn();

  it("renders spinner if loading", () => {
    const type = "editors";
    const { asFragment } = renderWithTheme(
      <EmptyPermissionsContextProvider>
        <DatasetProvider solidDataset={mockDataset}>
          <AgentAccessTable type={type} setLoading={setLoading} loading />
        </DatasetProvider>
      </EmptyPermissionsContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders an empty list of permissions if there are no permissions and the policy is not custom", () => {
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
