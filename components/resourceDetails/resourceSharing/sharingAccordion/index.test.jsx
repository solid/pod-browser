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
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import mockPersonContact from "../../../../__testUtils/mockPersonContact";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import SharingAccordion from "./index";
import { TESTCAFE_ID_AGENT_ACCESS_TABLE } from "../agentAccessTable";
import { TESTCAFE_ID_ADVANCED_SHARING_BUTTON } from "../advancedSharingButton";
import useContacts from "../../../../src/hooks/useContacts";
import useAddressBook from "../../../../src/hooks/useAddressBook";

jest.mock("../../../../src/hooks/useContacts");
const mockedUseContacts = useContacts;

jest.mock("../../../../src/hooks/useAddressBook");
const mockedUseAddressBook = useAddressBook;

describe("SharingAccordion", () => {
  beforeEach(() => {
    mockedUseAddressBook.mockReturnValue({ data: mockAddressBook() });
    mockedUseContacts.mockReturnValue({
      data: [
        mockPersonContact(
          mockAddressBook(),
          "https://example.org/contacts/Person/1234/",
          "Example 1"
        ),
        mockPersonContact(
          mockAddressBook(),
          "https://example.org/contacts/Person/3456/",
          "Example 2"
        ),
      ],
    });
  });
  // Note: since the permissions cannot be mocked reliably for the custom policies, those tested separately in the table component
  test("it renders three lists of named policies for editors, viewers and blocked and an Advanced Sharing button", () => {
    const { asFragment, queryAllByTestId, queryByTestId } = renderWithTheme(
      <SharingAccordion />
    );
    expect(queryAllByTestId(TESTCAFE_ID_AGENT_ACCESS_TABLE)).toHaveLength(3);
    expect(queryByTestId(TESTCAFE_ID_ADVANCED_SHARING_BUTTON)).not.toBeNull();
    expect(asFragment()).toMatchSnapshot();
  });
});
