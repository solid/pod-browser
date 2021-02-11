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

import userEvent from "@testing-library/user-event";
import React from "react";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import UserMenu from "./index";
import useAuthenticatedProfile from "../../../src/hooks/useAuthenticatedProfile";
import { mockProfileAlice } from "../../../__testUtils/mockPersonResource";
import { TESTCAFE_ID_SPINNER } from "../../spinner";

jest.mock("../../../src/hooks/useAuthenticatedProfile");
const mockedAuthenticatedProfileHook = useAuthenticatedProfile;

describe("UserMenu", () => {
  beforeEach(() => {
    mockedAuthenticatedProfileHook.mockReturnValue({
      data: mockProfileAlice(),
    });
  });

  test("renders a menu", () => {
    const { asFragment } = renderWithTheme(<UserMenu />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a spinner while loading user profile", () => {
    mockedAuthenticatedProfileHook.mockReturnValue({ data: null });
    const { getByTestId } = renderWithTheme(<UserMenu />);
    expect(getByTestId(TESTCAFE_ID_SPINNER)).toBeDefined();
  });

  it("renders fallback for name and user photo if not available", () => {
    mockedAuthenticatedProfileHook.mockReturnValue({ data: {} });
    const { asFragment } = renderWithTheme(<UserMenu />);
    expect(asFragment()).toMatchSnapshot();
  });
});
