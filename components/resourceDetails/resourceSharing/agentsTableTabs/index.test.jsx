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
import { renderWithTheme } from "../../../../__testUtils/withTheme";

import AgentTableTabs, {
  TESTCAFE_ID_TAB_ALL,
  TESTCAFE_ID_TAB_GROUPS,
  TESTCAFE_ID_TAB_PEOPLE,
} from "./index";

describe("AgentTableTabs", () => {
  const handleTabChange = jest.fn();
  it("renders tabs", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <AgentTableTabs
        handleTabChange={handleTabChange}
        selectedTabValue="Person"
      />
    );
    expect(getByTestId(TESTCAFE_ID_TAB_ALL)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_TAB_GROUPS)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_TAB_PEOPLE)).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });
  it("triggers handleTabChange when clicking on a tab", () => {
    const { getByTestId } = renderWithTheme(
      <AgentTableTabs
        handleTabChange={handleTabChange}
        selectedTabValue="Person"
      />
    );

    const tabGroups = getByTestId("tab-groups");
    userEvent.click(tabGroups);
    expect(handleTabChange).toHaveBeenCalled();
  });
});
