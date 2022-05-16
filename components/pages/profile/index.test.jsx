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
import { useRouter } from "next/router";
import { foaf } from "rdf-namespaces";
import * as solidClientFns from "@inrupt/solid-client";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../__testUtils/mockSession";
import ProfilePage from "./index";
import {
  mockPersonDatasetAlice,
  aliceWebIdUrl,
} from "../../../__testUtils/mockPersonResource";
import useFullProfile from "../../../src/hooks/useFullProfile";

jest.mock("next/router");
jest.mock("../../../src/hooks/useFullProfile");

const mockedUseRouter = useRouter;
const mockedUseFullProfile = useFullProfile;

describe("Profile page", () => {
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

  beforeEach(() => {
    mockedUseFullProfile.mockReturnValue(mockProfileAlice);
    jest
      .spyOn(solidClientFns, "getEffectiveAccess")
      .mockReturnValue({ user: { read: true, write: true, append: true } });
    mockedUseRouter.mockReturnValue({
      query: {
        webId: aliceWebIdUrl,
      },
    });
  });

  it("Renders the profile page", async () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session, false);

    const { asFragment, queryAllByText } = renderWithTheme(
      <SessionProvider>
        <ProfilePage />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(queryAllByText("Alice")).toHaveLength(1);
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("returns null if session request is in progress", () => {
    const sessionRequestInProgress = true;
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(
      session,
      sessionRequestInProgress
    );

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ProfilePage />
      </SessionProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("Renders the profile page without editable profile", async () => {
    const mockProfile = {
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
      editableProfileDatasets: [],
    };
    mockedUseFullProfile.mockReturnValue(mockProfile);
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session, false);

    const { asFragment, queryAllByText } = renderWithTheme(
      <SessionProvider>
        <ProfilePage />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(queryAllByText("Alice")).toHaveLength(2);
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
