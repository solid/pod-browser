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
import { useRouter } from "next/router";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import mockConsentRequestContext from "../../../__testUtils/mockConsentRequestContext";
import ConsentRequestFrom from "../index";
import {
  TESTCAFE_ID_FOREVER_BUTTON,
  TESTCAFE_ID_DATE_PICKER_CALENDAR_BUTTON,
} from "./index";

const ConsentRequestContextProvider = mockConsentRequestContext();
jest.mock("next/router");
const mockedUseRouter = useRouter;

describe("DateInput component", () => {
  const push = jest.fn();
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { redirectUrl: "/privacy/" },
      push,
    });
  });
  test("Opens datepicker when calendar is clicked", () => {
    const { getByTestId } = renderWithTheme(
      <ConsentRequestContextProvider>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <ConsentRequestFrom />
        </MuiPickersUtilsProvider>
      </ConsentRequestContextProvider>
    );

    const calendarButton = getByTestId(TESTCAFE_ID_DATE_PICKER_CALENDAR_BUTTON);

    userEvent.click(calendarButton);
    const foreverButton = getByTestId(TESTCAFE_ID_FOREVER_BUTTON);
    expect(foreverButton).toBeInTheDocument();
    userEvent.click(foreverButton);
  });
});
