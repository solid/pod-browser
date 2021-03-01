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
import AddAgentButton, {
  TESTCAFE_ID_ADD_AGENT_BUTTON,
  TESTCAFE_ID_MODAL_OVERLAY,
} from "./index";
import { renderWithTheme } from "../../../../__testUtils/withTheme";

describe("AddAgentButton", () => {
  it("renders a button with the correct text", () => {
    const { asFragment } = renderWithTheme(<AddAgentButton type="editors" />);
    expect(asFragment()).toMatchSnapshot();
  });
  it("opens modal when clicking the button", () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <AddAgentButton type="editors" />
    );
    const button = getByTestId("add-agent-button");
    userEvent.click(button);
    expect(queryByTestId("agent-picker-modal")).not.toBeNull();
  });
  it("closes modal when clicking outside the modal", () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <AddAgentButton type="editors" />
    );
    const button = getByTestId(TESTCAFE_ID_ADD_AGENT_BUTTON);
    userEvent.click(button);
    const overlay = getByTestId(TESTCAFE_ID_MODAL_OVERLAY);
    userEvent.click(overlay.firstChild);
    expect(queryByTestId("agent-picker-modal")).toBeNull();
  });
});
