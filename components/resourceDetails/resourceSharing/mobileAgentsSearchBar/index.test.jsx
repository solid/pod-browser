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
import userEvent from "@testing-library/user-event";
import { waitFor } from "@testing-library/dom";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import MobileAgentsSearchBar, {
  TESTCAFE_ID_MOBILE_SEARCH_INPUT,
  TESTCAFE_ID_SEARCH_BUTTON,
  TESTCAFE_ID_CLOSE_BUTTON,
} from "./index";

describe("AgentSearchBar", () => {
  const handleFilterChange = jest.fn();
  it("renders a search icon", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <MobileAgentsSearchBar handleFilterChange={handleFilterChange} />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_SEARCH_BUTTON)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_MOBILE_SEARCH_INPUT)).not.toBeVisible();
  });
  it("clicking the icon expands the search bar", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <MobileAgentsSearchBar handleFilterChange={handleFilterChange} />
    );
    expect(asFragment()).toMatchSnapshot();
    const button = getByTestId(TESTCAFE_ID_SEARCH_BUTTON);
    userEvent.click(button);
    waitFor(() =>
      expect(getByTestId(TESTCAFE_ID_MOBILE_SEARCH_INPUT)).toBeVisible()
    );
  });
  it("clicking the close icon hides the search bar", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <MobileAgentsSearchBar handleFilterChange={handleFilterChange} />
    );
    expect(asFragment()).toMatchSnapshot();
    const searchButton = getByTestId(TESTCAFE_ID_SEARCH_BUTTON);
    userEvent.click(searchButton);
    const closeButton = getByTestId(TESTCAFE_ID_CLOSE_BUTTON);
    userEvent.click(closeButton);

    waitFor(() =>
      expect(getByTestId(TESTCAFE_ID_MOBILE_SEARCH_INPUT)).not.toBeVisible()
    );
  });
  it("triggers handleFilterChange when typing into the search input", () => {
    const { getByTestId } = renderWithTheme(
      <MobileAgentsSearchBar handleFilterChange={handleFilterChange} />
    );

    const input = getByTestId(TESTCAFE_ID_MOBILE_SEARCH_INPUT);
    userEvent.type(input, "A");

    expect(handleFilterChange).toHaveBeenCalled();
  });
});
