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

import { renderWithTheme } from "../../../__testUtils/withTheme";
import GroupsPage from "./index";
import { TESTCAFE_ID_GROUP_LIST } from "../../groupList";
import { TESTCAFE_ID_GROUP_VIEW } from "../../groupView";
import useContacts from "../../../src/hooks/useContacts";

jest.mock("../../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

describe("GroupsPage", () => {
  it("renders", () => {
    mockedContactsHook.mockReturnValue({ data: [] });
    const { asFragment, getByTestId } = renderWithTheme(<GroupsPage />);
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_GROUP_LIST)).toBeDefined();
    expect(getByTestId(TESTCAFE_ID_GROUP_VIEW)).toBeDefined();
  });
});
