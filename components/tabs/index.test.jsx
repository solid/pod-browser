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
import { renderWithTheme } from "../../__testUtils/withTheme";

import Tabs from "./index";

const tabs = [
  {
    label: "All",
    testid: "tab-all",
    value: "all",
  },
  {
    label: "People",
    testid: "tab-people",
    value: "person",
  },
  {
    label: "Apps",
    testid: "tab-apps",
    value: "app", // this string for now until we define what type the app contact will be
  },
];

describe("Tabs", () => {
  const handleTabChange = jest.fn();
  it("renders tabs", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <Tabs
        handleTabChange={handleTabChange}
        selectedTabValue="Person"
        tabs={tabs}
      />
    );
    expect(getByTestId("tab-all")).toBeDefined();
    expect(getByTestId("tab-people")).toBeDefined();
    expect(getByTestId("tab-apps")).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });
  it("triggers handleTabChange when clicking on a tab", () => {
    const { getByTestId } = renderWithTheme(
      <Tabs
        handleTabChange={handleTabChange}
        selectedTabValue="Person"
        tabs={tabs}
      />
    );

    const tabPeople = getByTestId("tab-people");
    userEvent.click(tabPeople);
    expect(handleTabChange).toHaveBeenCalled();
  });
});
