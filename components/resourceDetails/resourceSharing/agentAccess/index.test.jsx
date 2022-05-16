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
import { act } from "react-test-renderer";
import { foaf } from "rdf-namespaces";
import { waitFor } from "@testing-library/react";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import userEvent from "@testing-library/user-event";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import AgentAccess, {
  PROFILE_ERROR_MESSAGE,
  TESTCAFE_ID_SKELETON_PLACEHOLDER,
  TESTCAFE_ID_TRY_AGAIN_BUTTON,
  TESTCAFE_ID_TRY_AGAIN_SPINNER,
} from "./index";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import * as profileFns from "../../../../src/solidClientHelpers/profile";
import { mockProfileAlice } from "../../../../__testUtils/mockPersonResource";
import { PUBLIC_AGENT_PREDICATE } from "../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../src/models/contact/authenticated";
import useFullProfile from "../../../../src/hooks/useFullProfile";

jest.mock("../../../../src/hooks/useAgentProfile");
jest.mock("../../../../src/hooks/useFullProfile");

const webId = "https://example.com/profile/card#me";
const iri = "https://example.com/resource.txt";
const dataset = mockSolidDatasetFrom(iri);

const profile = {
  names: ["Alice"],
  webId,
  types: [foaf.Person],
  avatars: ["http://alice.example.com/alice.jpg"],
  roles: [],
  organizations: [],
  contactInfo: {
    phones: [],
    emails: [],
  },
};

describe("AgentAccess", () => {
  useFullProfile.mockReturnValue(profile);
  describe("with profile", () => {
    const permission = {
      acl: createAccessMap(true, true, false, false),
      webId,
      alias: "Editors",
      type: "agent",
      profile: mockProfileAlice(),
    };

    it("renders", async () => {
      const { asFragment, getByText } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess permission={permission} />
        </DatasetProvider>
      );
      await waitFor(() => {
        expect(getByText("Alice")).toBeInTheDocument();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });
  describe("for public agent", () => {
    const permission = {
      acl: createAccessMap(true, true, false, false),
      webId: PUBLIC_AGENT_PREDICATE,
      alias: "Editors",
      type: "public",
    };
    it("renders correctly", async () => {
      const { asFragment, getByText } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess permission={permission} />
        </DatasetProvider>
      );
      await waitFor(() => {
        expect(getByText("Anyone")).toBeInTheDocument();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });
  describe("for authenticated agent", () => {
    const permission = {
      acl: createAccessMap(true, true, false, false),
      webId: AUTHENTICATED_AGENT_PREDICATE,
      alias: "Editors",
      type: "authenticated",
    };
    it("renders correctly", async () => {
      const { asFragment, getByText } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess permission={permission} />
        </DatasetProvider>
      );
      await waitFor(() => {
        expect(getByText("Anyone signed in")).toBeInTheDocument();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });
  describe("without profile", () => {
    it("renders skeleton placeholders when profile is not available", async () => {
      useFullProfile.mockReturnValue(null);

      const { asFragment, getByTestId } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: createAccessMap(true, true, false, false),
              webId,
              alias: "Editors",
              type: "agent",
              profile: undefined,
              profileError: undefined,
            }}
          />
        </DatasetProvider>
      );
      await waitFor(() => {
        expect(
          getByTestId(TESTCAFE_ID_SKELETON_PLACEHOLDER)
        ).toBeInTheDocument();
      });
      expect(asFragment()).toMatchSnapshot();
    });
    it("returns null when no access", async () => {
      const fetchProfileSpy = jest.spyOn(profileFns, "fetchProfile");
      fetchProfileSpy.mockRejectedValue("error");
      const { asFragment, queryByText } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: null,
              webId,
              alias: "Editors",
              type: "agent",
            }}
          />
        </DatasetProvider>
      );
      await waitFor(() => {
        expect(queryByText(webId)).toBeNull();
      });
      expect(asFragment()).toMatchSnapshot();
    });
    it("renders a skeleton while loading profile", async () => {
      const fetchProfileSpy = jest.spyOn(profileFns, "fetchProfile");
      fetchProfileSpy.mockResolvedValue("profile");
      const { asFragment, getByTestId } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: createAccessMap(true, true, false, false),
              webId,
              alias: "Editors",
              type: "agent",
              profile: undefined,
              profileError: undefined,
            }}
          />
        </DatasetProvider>
      );
      await waitFor(() => {
        expect(
          getByTestId(TESTCAFE_ID_SKELETON_PLACEHOLDER)
        ).toBeInTheDocument();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
