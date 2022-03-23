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
import { renderWithTheme } from "../../__testUtils/withTheme";
import SurveyWidget from "./index";
import { TESTCAFE_ID_WIDGET_BUTTON } from "./widgetButton";
import {
  RESEARCH_SURVEY_URL,
  TESTCAFE_ID_CLOSE_WIDGET_BUTTON,
  TESTCAFE_ID_WIDGET_BOX,
} from "./widgetBox";

describe("Survey Widget", () => {
  it("renders a button", () => {
    const { asFragment, getByTestId } = renderWithTheme(<SurveyWidget />);
    expect(getByTestId(TESTCAFE_ID_WIDGET_BUTTON)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
  it("opens the widget containing a link when clicking the button", async () => {
    const { getByTestId, getByRole } = renderWithTheme(<SurveyWidget />);
    expect(getByTestId(TESTCAFE_ID_WIDGET_BUTTON)).toBeInTheDocument();
    const widgetButton = getByTestId(TESTCAFE_ID_WIDGET_BUTTON);
    userEvent.click(widgetButton);
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_WIDGET_BOX)).toBeInTheDocument();
      expect(getByRole("link")).toBeInTheDocument();
      expect(getByRole("link")).toHaveAttribute("href", RESEARCH_SURVEY_URL);
    });
  });
  it("closes the widget when clicking the close button", async () => {
    const { getByTestId, queryByTestId } = renderWithTheme(<SurveyWidget />);
    const widgetButton = getByTestId(TESTCAFE_ID_WIDGET_BUTTON);
    userEvent.click(widgetButton);
    expect(getByTestId(TESTCAFE_ID_WIDGET_BOX)).toBeInTheDocument();
    const closeButton = getByTestId(TESTCAFE_ID_CLOSE_WIDGET_BUTTON);
    userEvent.click(closeButton);
    await waitFor(() => {
      expect(queryByTestId(TESTCAFE_ID_WIDGET_BOX)).not.toBeInTheDocument();
    });
  });
});
