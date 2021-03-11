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

import { within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import React from "react";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import CustomPolicyDropdown, {
  TESTCAFE_ID_CUSTOM_POLICY_DROPDOWN,
} from "./index";

describe("CustomPolicyDropdown", () => {
  test("it renders a dropdown with the custom policies as options and View & ADd as default option", () => {
    const setCustomPolicy = jest.fn();
    const { asFragment, getByText } = renderWithTheme(
      <CustomPolicyDropdown
        setCustomPolicy={setCustomPolicy}
        defaultValue="viewAndAdd"
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByText("View & Add")).not.toBeNull();
  });
  test("dropdown is disabled if editing is true", () => {
    const setCustomPolicy = jest.fn();
    const { asFragment, getByText, getByTestId } = renderWithTheme(
      <CustomPolicyDropdown
        setCustomPolicy={setCustomPolicy}
        defaultValue="viewAndAdd"
        editing
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByText("View & Add")).not.toBeNull();
    expect(
      getByTestId(TESTCAFE_ID_CUSTOM_POLICY_DROPDOWN).firstChild
    ).toHaveAttribute("aria-disabled");
  });
  test("selecting another option calls setCustomPolicy with the correct value", () => {
    const setCustomPolicy = jest.fn();
    const { getByTestId, queryAllByRole, queryByRole } = renderWithTheme(
      <CustomPolicyDropdown
        setCustomPolicy={setCustomPolicy}
        defaultValue="viewAndAdd"
      />
    );
    const dropdown = getByTestId(TESTCAFE_ID_CUSTOM_POLICY_DROPDOWN);
    userEvent.click(within(dropdown).getByRole("button"));
    const options = queryAllByRole("option");
    expect(options).toHaveLength(3);
    userEvent.click(options[1]);
    expect(setCustomPolicy).toHaveBeenCalledWith("editOnly");
    expect(queryByRole("option")).toBeNull();
  });
});
