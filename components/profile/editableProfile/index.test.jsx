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
import { renderWithTheme } from "../../../__testUtils/withTheme";
import {
  aliceWebIdUrl,
  mockPersonDatasetAlice,
} from "../../../__testUtils/mockPersonResource";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import useFullProfile from "../../../src/hooks/useFullProfile";
import EditableProfile from "./index";

jest.mock("../../../src/hooks/useFullProfile");

const mockedUseFullProfile = useFullProfile;

describe("EditableProfile", () => {
  const profileDataset = mockPersonDatasetAlice();
  const mockProfileAlice = {
    names: ["Alice"],
    webId: aliceWebIdUrl,
    types: [foaf.Person],
    avatars: [],
    roles: [],
    organizations: [],
    contactInfo: {
      phones: [],
      emails: [],
    },
    editableProfileDatasets: [profileDataset],
  };

  const mockAppProfile = {
    types: [schema.SoftwareApplication],
    names: ["Mock app"],
    webId: "https://mockappurl.com",
  };

  describe("for a person", () => {
    beforeEach(() => {
      mockedUseFullProfile.mockReturnValue(mockProfileAlice);
    });

    it("renders a person profile", async () => {
      const session = mockSession();
      const SessionProvider = mockSessionContextProvider(session);
      const { asFragment, queryByText } = renderWithTheme(
        <SessionProvider>
          <EditableProfile
            profile={mockProfileAlice}
            profileDataset={profileDataset}
          />
        </SessionProvider>
      );
      await waitFor(() => {
        expect(queryByText("Alice")).toBeInTheDocument();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe("for an app", () => {
    beforeEach(() => {
      mockedUseFullProfile.mockReturnValue(mockAppProfile);
    });

    it("renders an app profile", async () => {
      const session = mockSession();
      const SessionProvider = mockSessionContextProvider(session);
      const { asFragment, queryByText } = renderWithTheme(
        <SessionProvider>
          <EditableProfile
            profileDataset={profileDataset}
            profile={mockAppProfile}
          />
        </SessionProvider>
      );
      await waitFor(() => {
        expect(queryByText("https://mockappurl.com")).toBeInTheDocument();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("renders an error if profile is unavailable", async () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { asFragment, queryByText } = renderWithTheme(
      <SessionProvider>
        <EditableProfile profileDataset={null} webId="https://somewebid.com" />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(
        queryByText("No profile document found this this WebID")
      ).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
