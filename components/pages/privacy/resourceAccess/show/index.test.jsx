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
import * as solidClientFns from "@inrupt/solid-client";
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { schema } from "rdf-namespaces";
import { useRouter } from "next/router";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import AgentResourceAccessShowPage, { TESTCAFE_ID_TAB_PROFILE } from "./index";
import {
  bobWebIdUrl,
  mockPersonDatasetBob,
} from "../../../../../__testUtils/mockPersonResource";
import mockSessionContextProvider from "../../../../../__testUtils/mockSessionContextProvider";
import mockSession from "../../../../../__testUtils/mockSession";

jest.mock("next/router");

const mockedUseRouter = useRouter;

describe("Resource access show page", () => {
  const profileDataset = mockPersonDatasetBob();
  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(profileDataset);
    mockedUseRouter.mockReturnValue({
      query: {
        webId: bobWebIdUrl,
      },
    });
  });

  it("renders a resource access page for a person", async () => {
    const { asFragment, getAllByText } = renderWithTheme(
      <SessionProvider>
        <AgentResourceAccessShowPage type={schema.Person} />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getAllByText("Bob")).toHaveLength(2);
      expect(getAllByText(bobWebIdUrl)).toHaveLength(1);
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a resource access page for an app", async () => {
    const { asFragment, getAllByText } = renderWithTheme(
      <AgentResourceAccessShowPage type={schema.SoftwareApplication} />
    );
    await waitFor(() => {
      expect(getAllByText("Mock App")).toHaveLength(1);
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders profile when clicking on profile tab", async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AgentResourceAccessShowPage type={schema.SoftwareApplication} />
    );
    const tab = getByTestId(TESTCAFE_ID_TAB_PROFILE);
    userEvent.click(tab);
    await waitFor(() => {
      expect(getByText("Mock App")).toBeInTheDocument();
    });
  });
});
