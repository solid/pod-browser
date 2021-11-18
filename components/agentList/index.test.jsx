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
import { useRouter } from "next/router";
import { foaf, schema } from "rdf-namespaces";
import { screen, waitFor } from "@testing-library/react";
import useAgentsProfiles from "../../src/hooks/useAgentsProfiles";
import { renderWithTheme } from "../../__testUtils/withTheme";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonThingAlice,
  mockPersonThingBob,
} from "../../__testUtils/mockPersonResource";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import AgentList from "./index";
import { mockApp } from "../../__testUtils/mockApp";

jest.mock("../../src/hooks/useAgentsProfiles");
jest.mock("next/router");

const mockedUseRouter = useRouter;
const mockUseAgentsProfiles = useAgentsProfiles;

const setSearchValues = jest.fn();

describe("AgentList", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      route: "/privacy",
    });
  });
  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);
  const agents = [mockPersonThingBob(), mockPersonThingAlice(), mockApp()];
  it("renders spinner while agent profiles are loading", async () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: null,
      error: null,
      isValidating: true,
    });

    const { asFragment, getByTestId } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getByTestId("spinner")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders page when agents is loaded", async () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: agents,
      error: null,
      isValidating: false,
    });

    const { asFragment, getByText } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getByText("Bob")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("sets search values when agents are loaded", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: ["agentsData"],
      error: null,
      isValidating: true,
    });

    renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(setSearchValues).toHaveBeenCalledWith(["agentsData"]);
  });

  it("renders apps when type is app", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: agents,
      error: null,
      isValidating: true,
    });

    const { getByText } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={schema.SoftwareApplication}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    waitFor(() => {
      expect(getByText("Mock App")).toBeInTheDocument();
    });
  });

  it("renders apps along with people when type is all", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: agents,
      error: null,
      isValidating: true,
    });

    const { getByText } = renderWithTheme(
      <SessionProvider>
        <AgentList contactType="all" setSearchValues={setSearchValues} />
      </SessionProvider>
    );
    waitFor(() => {
      expect(getByText(bobWebIdUrl)).toBeInTheDocument();
      expect(getByText(aliceWebIdUrl)).toBeInTheDocument();
      expect(getByText("Mock App")).toBeInTheDocument();
    });
  });

  it("renders only apps if no people available when type is all", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: [mockApp()],
      error: null,
      isValidating: true,
    });

    const { getByText } = renderWithTheme(
      <SessionProvider>
        <AgentList contactType="all" setSearchValues={setSearchValues} />
      </SessionProvider>
    );
    waitFor(() => {
      expect(getByText("Mock App")).toBeInTheDocument();
    });
  });

  it("renders empty state message when there are no agents", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: null,
      error: undefined,
      mutate: () => {},
    });

    renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );

    const message = screen.getByText("No one else has access to your Pod");

    expect(message).toBeTruthy();
  });
});
