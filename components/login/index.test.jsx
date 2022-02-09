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
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Login, {
  TESTCAFE_ID_OTHER_PROVIDERS_BUTTON,
  TESTCAFE_ID_LOGIN_TITLE,
} from "./index";
import { renderWithTheme } from "../../__testUtils/withTheme";
import useIdpFromQuery from "../../src/hooks/useIdpFromQuery";
import { TESTCAFE_ID_LOGIN_FIELD } from "./provider";

jest.mock("../../src/hooks/useIdpFromQuery");
const mockedUseIdpFromQuery = useIdpFromQuery;

describe("Login form", () => {
  beforeEach(() => {
    mockedUseIdpFromQuery.mockReturnValue(null);
  });

  it("renders a login page with a sign in button and a 'Sign in with other provider' button", async () => {
    const { asFragment, getByTestId } = renderWithTheme(<Login />);
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_LOGIN_TITLE)).not.toBeNull();
    });
    expect(asFragment()).toMatchSnapshot();
  });
  it("clicking the 'other providers' button displays a form", async () => {
    const { getByTestId } = renderWithTheme(<Login />);
    const button = getByTestId(TESTCAFE_ID_OTHER_PROVIDERS_BUTTON);
    userEvent.click(button);
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_LOGIN_FIELD)).not.toBeNull();
    });
  });
});
