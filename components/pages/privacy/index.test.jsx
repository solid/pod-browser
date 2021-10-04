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
import { fireEvent, waitFor } from "@testing-library/react";
import PrivacyPage, {
  TESTCAFE_ID_TAB_ALL,
  TESTCAFE_ID_TAB_APPS,
  TESTCAFE_ID_TAB_PEOPLE,
} from "./index";
import useAgentsProfiles from "../../../src/hooks/useAgentsProfiles";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonThingAlice,
  mockPersonThingBob,
} from "../../../__testUtils/mockPersonResource";

jest.mock("../../../src/hooks/useAgentsProfiles");
jest.mock("next/router");

const mockedUseRouter = useRouter;
const mockUseAgentsProfiles = useAgentsProfiles;

describe("PrivacyPage", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      route: "/privacy",
    });
  });
  const people = [mockPersonThingBob(), mockPersonThingAlice()];
  it("renders empty state if there's no agents to show", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: null,
      error: null,
      mutate: jest.fn(),
    });
    const { asFragment } = renderWithTheme(<PrivacyPage />);
    expect(asFragment()).toMatchSnapshot();
  });
  it("renders people list when selecting people tab", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: people,
      error: null,
      mutate: jest.fn(),
    });
    const { getByTestId, getByText } = renderWithTheme(<PrivacyPage />);
    const peopleTab = getByTestId(TESTCAFE_ID_TAB_PEOPLE);
    fireEvent.click(peopleTab);
    waitFor(() => {
      expect(getByText(bobWebIdUrl)).toBeInTheDocument();
      expect(getByText(aliceWebIdUrl)).toBeInTheDocument();
    });
  });
  it("renders app list when selecting apps tab", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: null,
      error: null,
      mutate: jest.fn(),
    });

    const { getByTestId, getByText } = renderWithTheme(<PrivacyPage />);
    const appsTab = getByTestId(TESTCAFE_ID_TAB_APPS);
    fireEvent.click(appsTab);
    expect(getByText("https://mockappurl.com")).toBeInTheDocument();
  });
  it("renders both people and app lists when selecting all tab", () => {
    mockUseAgentsProfiles.mockReturnValue({
      data: people,
      error: null,
      mutate: jest.fn(),
    });

    const { getByTestId, getByText } = renderWithTheme(<PrivacyPage />);
    const allTab = getByTestId(TESTCAFE_ID_TAB_ALL);
    fireEvent.click(allTab);
    waitFor(() => {
      expect(getByText(bobWebIdUrl)).toBeInTheDocument();
      expect(getByText(aliceWebIdUrl)).toBeInTheDocument();
      expect(getByText("https://mockappurl.com")).toBeInTheDocument();
    });
  });
});
