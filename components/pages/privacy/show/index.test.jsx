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
import * as solidClientFns from "@inrupt/solid-client";
import * as RouterFns from "next/router";
import { foaf, schema } from "rdf-namespaces";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import mockSessionContextProvider from "../../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../../__testUtils/mockSession";
import AgentPage from "./index";
import { aliceWebIdUrl } from "../../../../__testUtils/mockPersonResource";
import useFullProfile from "../../../../src/hooks/useFullProfile";

jest.mock("../../../../src/hooks/useFullProfile");
const mockedUseFullProfile = useFullProfile;

describe("Agent show page", () => {
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
  };
  beforeEach(() => {
    mockedUseFullProfile.mockReturnValue(mockProfileAlice);
  });

  it("Renders the Agent show page", async () => {
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {
        webId: "https://example.com/profile/card#me",
      },
    });

    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);

    const { asFragment, queryAllByText } = renderWithTheme(
      <SessionProvider>
        <AgentPage type={schema.Person} />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(queryAllByText("Alice")).toHaveLength(2);
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
