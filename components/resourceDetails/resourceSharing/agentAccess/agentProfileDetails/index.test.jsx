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
import { foaf } from "rdf-namespaces";
import AgentProfileDetails from "./index";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import { PUBLIC_AGENT_PREDICATE } from "../../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../../src/models/contact/authenticated";
import { TESTCAFE_ID_MENU_BUTTON } from "../agentAccessOptionsMenu";
import useFullProfile from "../../../../../src/hooks/useFullProfile";

const webId = "https://example.com/profile/card#me";

jest.mock("../../../../../src/hooks/useFullProfile");
const mockedUseFullProfile = useFullProfile;

describe("AgentProfileDetails", () => {
  const profile = {
    names: ["Example Agent"],
    webId,
    types: [foaf.Person],
    avatars: [],
    roles: [],
    organizations: [],
    contactInfo: {
      phones: [],
      emails: [],
    },
  };
  const permission = { webId, alias: "editors", type: "agent" };
  const resourceIri = "/iri/";

  const publicProfile = {
    webId: PUBLIC_AGENT_PREDICATE,
  };
  const publicPermission = {
    webId: PUBLIC_AGENT_PREDICATE,
    alias: "editors",
    type: "public",
  };

  const authenticatedProfile = {
    webId: AUTHENTICATED_AGENT_PREDICATE,
  };
  const authenticatedPermission = {
    webId: AUTHENTICATED_AGENT_PREDICATE,
    alias: "editors",
    type: "authenticated",
  };

  it("renders without error", () => {
    mockedUseFullProfile.mockReturnValue(profile);
    const { asFragment } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it("renders action button for non-inherited permissions", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={permission}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_MENU_BUTTON)).not.toBeNull();
  });
  it("does not render action button for inherited permissions", () => {
    const inheritedPermission = {
      webId,
      alias: "editors",
      type: "agent",
      inherited: true,
    };
    const { asFragment, queryByTestId } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={inheritedPermission}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByTestId(TESTCAFE_ID_MENU_BUTTON)).toBeNull();
  });

  it("renders correctly for public agent", () => {
    const { asFragment, queryByText } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={publicPermission}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByText("Anyone")).not.toBeNull();
  });

  it("renders correctly for authenticated agent", () => {
    const { asFragment, queryByText } = renderWithTheme(
      <AgentProfileDetails
        resourceIri={resourceIri}
        permission={authenticatedPermission}
        setLoading={jest.fn()}
        setLocalAccess={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByText("Anyone signed in")).not.toBeNull();
  });
});
