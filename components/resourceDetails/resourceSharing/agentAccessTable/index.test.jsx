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
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import AgentAccessTable from "./index";

describe("AgentAccessTable", () => {
  const permissions = [
    {
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
      webId: "https://example1.com/profile/card#me",
      profile: {
        avatar: null,
        name: "Example 1",
        types: ["https://schema.org/Person"],
      },
    },
    {
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
      webId: "https://example2.com/profile/card#me",
      profile: {
        avatar: null,
        name: "Example 2",
        types: ["https://schema.org/Person"],
      },
    },
    {
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
      webId: "https://example3.com/profile/card#me",
      profile: {
        avatar: null,
        name: "Example 3",
        types: ["https://schema.org/Person"],
      },
    },
    {
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
      webId: "https://example4.com/profile/card#me",
      profile: {
        avatar: null,
        name: "Example 4",
        types: ["https://schema.org/Person"],
      },
    },
  ];
  it("renders an empty list of permissions", () => {
    const type = "editors";
    const { asFragment } = renderWithTheme(
      <AgentAccessTable type={type} permissions={[]} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it("renders a list of permissions", async () => {
    const type = "editors";
    const { asFragment, queryAllByRole } = renderWithTheme(
      <AgentAccessTable
        type={type}
        permissions={[
          {
            acl: {
              read: true,
              write: true,
              append: true,
              control: true,
            },
            webId: "https://example1.com/profile/card#me",
            profile: {
              avatar: null,
              name: "Example 1",
              types: ["https://schema.org/Person"],
            },
          },
        ]}
      />
    );
    expect(queryAllByRole("cell")).toHaveLength(1);
    expect(asFragment()).toMatchSnapshot();
  });
  it("shows all permissions when clicking 'show all' button", async () => {
    const type = "editors";
    const { queryAllByRole, getByTestId } = renderWithTheme(
      <AgentAccessTable type={type} permissions={permissions} />
    );
    const button = getByTestId("show-all-button");
    expect(queryAllByRole("cell")).toHaveLength(3);
    userEvent.click(button);
    expect(queryAllByRole("cell")).toHaveLength(4);
  });
  it("shows first 3 permissions by default and when clicking the 'hide' button", async () => {
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
    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable type={type} permissions={permissions} />
    );
    const searchInput = getByTestId("search-input");
    userEvent.type(searchInput, "2");
    expect(queryByText("Example 4")).toBeNull();
    expect(queryByText("Example 2")).not.toBeNull();
  });
  // TODO: this will change once we have groups and a new way of filtering
  it("renders a set of tabs which filter by type", () => {
    const type = "editors";
    const { getByTestId, queryByText } = renderWithTheme(
      <AgentAccessTable
        type={type}
        permissions={[
          {
            acl: {
              read: true,
              write: true,
              append: true,
              control: true,
            },
            webId: "https://example1.com/profile/card#me",
            profile: {
              avatar: null,
              name: "Example 1",
              types: ["https://schema.org/Person"],
            },
          },
          {
            acl: {
              read: true,
              write: true,
              append: true,
              control: true,
            },
            webId: "https://example1.com/profile/card#me",
            profile: {
              avatar: null,
              name: "Not a person",
              types: ["Something else"],
            },
          },
        ]}
      />
    );
    const tabPeople = getByTestId("tab-people");
    const tabGroups = getByTestId("tab-groups");
    userEvent.click(tabPeople);
    expect(queryByText("Not a person")).toBeNull();
    expect(queryByText("Example 1")).not.toBeNull();
    userEvent.click(tabGroups);
    expect(queryByText("Example 1")).toBeNull();
    expect(queryByText("No groups found")).not.toBeNull();
  });
});
