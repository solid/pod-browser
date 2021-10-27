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

import { waitFor } from "@testing-library/react";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import userEvent from "@testing-library/user-event";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { act } from "@testing-library/react-hooks";
import { createAccessMap } from "../../../../src/solidClientHelpers/permissions";
import AgentAccess from "./index";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import * as profileFns from "../../../../src/solidClientHelpers/profile";
import { mockProfileAlice } from "../../../../__testUtils/mockPersonResource";
import { PUBLIC_AGENT_PREDICATE } from "../../../../src/models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../../../src/models/contact/authenticated";

jest.mock("../../../../src/hooks/useAgentProfile");

const webId = "https://example.com/profile/card#me";
const dataset = mockSolidDatasetFrom("http://example.com/container/");

describe("AgentAccess", () => {
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
    it("renders skeleton placeholders when profile is not available", () => {
      const { asFragment } = renderWithTheme(
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

      expect(asFragment()).toMatchSnapshot();
    });
    it("returns null when no access", () => {
      const { asFragment } = renderWithTheme(
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

      expect(asFragment()).toMatchSnapshot();
    });

    it("renders a skeleton while loading profile", async () => {
      const { asFragment } = renderWithTheme(
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
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders an error message with a 'try again' button if it's unable to load profile", () => {
      const { asFragment, findByTestId } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: createAccessMap(true, true, false, false),
              webId,
              alias: "Editors",
              type: "agent",
              profile: null,
              profileError: "error",
            }}
          />
        </DatasetProvider>
      );
      expect(findByTestId("try-again-button")).toBeTruthy();
      expect(asFragment()).toMatchSnapshot();
    });

    it("renders a spinner after clicking 'try again' button", async () => {
      const { findByTestId } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: createAccessMap(true, true, false, false),
              webId,
              alias: "Editors",
              type: "agent",
              profile: null,
              profileError: "error",
            }}
          />
        </DatasetProvider>
      );
      const button = await findByTestId("try-again-button");
      userEvent.click(button);

      expect(findByTestId("try-again-spinner")).toBeTruthy();
    });

    it("tries to fetch the profile again when clicking 'try again' button", async () => {
      const fetchProfileSpy = jest.spyOn(profileFns, "fetchProfile");
      const { findByTestId } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: createAccessMap(true, true, false, false),
              webId,
              alias: "Editors",
              type: "agent",
              profile: null,
              profileError: "error",
            }}
          />
        </DatasetProvider>
      );
      const button = await findByTestId("try-again-button");
      userEvent.click(button);

      await waitFor(() =>
        expect(fetchProfileSpy).toHaveBeenCalledWith(webId, expect.anything())
      );
    });

    it("removes the spinner when fetching succeeds", async () => {
      const fetchProfileSpy = jest.spyOn(profileFns, "fetchProfile");

      const { findByTestId, queryByTestId } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: createAccessMap(true, true, false, false),
              webId,
              alias: "Editors",
              type: "agent",
              profile: null,
              profileError: "error",
            }}
          />
        </DatasetProvider>
      );
      const button = await findByTestId("try-again-button");
      userEvent.click(button);
      await waitFor(() =>
        expect(fetchProfileSpy).toHaveBeenCalledWith(webId, expect.anything())
      );
      fetchProfileSpy.mockResolvedValueOnce(mockProfileAlice());
      await waitFor(() =>
        expect(queryByTestId("try-again-spinner")).toBeFalsy()
      );
    });

    it("removes the spinner when fetching errors", async () => {
      const fetchProfileSpy = jest.spyOn(profileFns, "fetchProfile");
      const { getByTestId, queryByTestId } = renderWithTheme(
        <DatasetProvider solidDataset={dataset}>
          <AgentAccess
            permission={{
              acl: createAccessMap(true, true, false, false),
              webId,
              alias: "Editors",
              type: "agent",
              profile: null,
              profileError: "error",
            }}
          />
        </DatasetProvider>
      );
      const button = getByTestId("try-again-button");
      userEvent.click(button);

      await waitFor(() =>
        expect(fetchProfileSpy).toHaveBeenCalledWith(webId, expect.anything())
      );
      fetchProfileSpy.mockRejectedValue(null);
      await waitFor(() => {
        expect(queryByTestId("try-again-spinner")).toBeFalsy();
      });
    });
  });
});
