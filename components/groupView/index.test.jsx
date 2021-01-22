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

import { renderWithTheme } from "../../__testUtils/withTheme";
import useContacts from "../../src/hooks/useContacts";
import { TESTID_SPINNER } from "../spinner";
import GroupView, { TESTID_GROUP_VIEW_ERROR } from "./index";
import { TESTID_GROUP_VIEW_EMPTY } from "../groupViewEmpty";

jest.mock("../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

describe("GroupView", () => {
  it("renders an empty list when no groups is loaded", () => {
    mockedContactsHook.mockReturnValue({ data: [] });
    const { asFragment, getByTestId } = renderWithTheme(<GroupView />);
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTID_GROUP_VIEW_EMPTY)).toBeDefined();
  });

  it("renders a spinner while groups are loading", () => {
    mockedContactsHook.mockReturnValue({});
    const { getByTestId } = renderWithTheme(<GroupView />);
    expect(getByTestId(TESTID_SPINNER)).toBeDefined();
  });

  it("renders an error if something goes wrong when loading groups", () => {
    const errorMessage = "error";
    mockedContactsHook.mockReturnValue({ error: new Error(errorMessage) });
    const { getByTestId } = renderWithTheme(<GroupView />);
    expect(getByTestId(TESTID_GROUP_VIEW_ERROR).innerHTML).toContain(
      errorMessage
    );
  });
});
