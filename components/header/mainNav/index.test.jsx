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
import { useSession } from "@inrupt/solid-ui-react";
import { useRouter } from "next/router";
import { waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import MainNav, { TESTCAFE_ID_MAIN_NAV } from "./index";
import mockSession, {
  mockUnauthenticatedSession,
} from "../../../__testUtils/mockSession";
import { GROUPS_PAGE_ENABLED_FOR } from "../../../src/featureFlags";

jest.mock("@inrupt/solid-ui-react", () => {
  return {
    useSession: jest.fn(),
  };
});
const mockedSessionHook = useSession;

jest.mock("next/router");
const mockedRouterHook = useRouter;

describe("MainNav", () => {
  beforeEach(() => {
    mockedRouterHook.mockReturnValue({
      pathname: "/resource/[iri]",
    });
  });

  it("renders navigation", async () => {
    const session = mockUnauthenticatedSession();
    mockedSessionHook.mockReturnValue({ session });

    const { asFragment, getByTestId } = renderWithTheme(<MainNav />);
    await waitFor(() => {
      expect(
        getByTestId(TESTCAFE_ID_MAIN_NAV).querySelectorAll("li")
      ).toHaveLength(3);
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders Group and Privacy for people with the feature flag turned on", async () => {
    const session = mockSession({ webId: GROUPS_PAGE_ENABLED_FOR[0] });
    mockedSessionHook.mockReturnValue({ session });

    const { asFragment, getByTestId } = renderWithTheme(<MainNav />);
    await waitFor(() => {
      expect(
        getByTestId(TESTCAFE_ID_MAIN_NAV).querySelectorAll("li")
      ).toHaveLength(5);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
