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
import { renderWithTheme } from "../../../__testUtils/withTheme";
import RequestSection, {
  TESTCAFE_ID_REQUEST_SELECT_ALL_BUTTON,
  TESTCAFE_ID_REQUEST_EXPAND_SECTION_BUTTON,
} from "./index";

const sectionDetails = {
  mode: ["Read", "Write"],
  hasStatus: "ConsentStatusRequested",
  forPersonalData: [
    "https://pod.inrupt.com/alice/private/data",
    "https://pod.inrupt.com/alice/private/data-2/",
    "https://pod.inrupt.com/alice/private/data-3",
  ],
  forPurpose: "https://example.com/SomeSpecificPurpose",
};

describe("consentRequestContext", () => {
  test("Renders initial context data", async () => {
    const { asFragment } = renderWithTheme(
      <RequestSection agentName="agent_name" sectionDetails={sectionDetails} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test("it selects all switches in a section", () => {
    const { getByTestId, getAllByRole } = renderWithTheme(
      <RequestSection agentName="agent_name" sectionDetails={sectionDetails} />
    );

    const selectAll = getByTestId(TESTCAFE_ID_REQUEST_SELECT_ALL_BUTTON);
    const switches = getAllByRole("checkbox");
    expect(getAllByRole("checkbox", { checked: false })).toHaveLength(
      switches.length
    );

    userEvent.click(selectAll);
    expect(getAllByRole("checkbox", { checked: true })).toHaveLength(
      switches.length
    );
    expect(selectAll).toHaveFocus();
  });

  test("it expands a sub-section and selects switch in it", () => {
    const { getByTestId, getAllByRole } = renderWithTheme(
      <RequestSection agentName="agent_name" sectionDetails={sectionDetails} />
    );

    const expandSection = getByTestId(
      TESTCAFE_ID_REQUEST_EXPAND_SECTION_BUTTON
    );
    const switches = getAllByRole("checkbox", { checked: false });
    expect(getAllByRole("checkbox", { checked: false })).toHaveLength(
      switches.length
    );

    userEvent.click(expandSection);
    expect(getAllByRole("checkbox")).toHaveLength(switches.length + 3);

    const updatedSwitches = getAllByRole("checkbox", { checked: false });

    userEvent.click(updatedSwitches[4]);
    expect(getAllByRole("checkbox", { checked: false })).toHaveLength(
      updatedSwitches.length - 1
    );
  });

  test("it selects a single switch when clicked", () => {
    const { getAllByRole } = renderWithTheme(
      <RequestSection agentName="agent_name" sectionDetails={sectionDetails} />
    );

    const switches = getAllByRole("checkbox");
    expect(getAllByRole("checkbox", { checked: false })).toHaveLength(
      switches.length
    );
    userEvent.click(switches[0]);
    expect(getAllByRole("checkbox", { checked: false })).toHaveLength(
      switches.length - 1
    );
  });
});
