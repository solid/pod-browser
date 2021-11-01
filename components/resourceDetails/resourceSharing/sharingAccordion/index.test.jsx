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
import { useRouter } from "next/router";
import { waitFor } from "@testing-library/dom";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import mockPersonContact from "../../../../__testUtils/mockPersonContact";
import mockAddressBook from "../../../../__testUtils/mockAddressBook";
import SharingAccordion from "./index";
import { TESTCAFE_ID_AGENT_ACCESS_TABLE } from "../agentAccessTable";
import { TESTCAFE_ID_ADVANCED_SHARING_BUTTON } from "../advancedSharingButton";
import useContacts from "../../../../src/hooks/useContacts";
import useAddressBook from "../../../../src/hooks/useAddressBook";
import mockPermissionsContextProvider from "../../../../__testUtils/mockPermissionsContextProvider";

jest.mock("next/router");
const mockedUseRouter = useRouter;

jest.mock("../../../../src/hooks/useContacts");
const mockedUseContacts = useContacts;

jest.mock("../../../../src/hooks/useAddressBook");
const mockedUseAddressBook = useAddressBook;

describe("SharingAccordion", () => {
  const addressBook = mockAddressBook();
  const PermissionsContextProvider = mockPermissionsContextProvider();

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { resourceIri: "/resource.txt" },
    });
    mockedUseAddressBook.mockReturnValue({ data: mockAddressBook() });
    mockedUseContacts.mockReturnValue({
      data: [
        mockPersonContact({
          addressBook,
          personThingUrl: "https://example.org/contacts/Person/1234/",
          name: "Example 1",
        }),
        mockPersonContact({
          addressBook,
          personThingUrl: "https://example.org/contacts/Person/3456/",
          name: "Example 2",
        }),
      ],
    });
  });
  // Note: since the permissions cannot be mocked reliably for the custom policies, those are tested separately in the table component
  it("renders two lists of named policies for editors and viewers and an Advanced Sharing button", async () => {
    const { asFragment, queryAllByTestId, queryByTestId } = renderWithTheme(
      <SharingAccordion />
    );
    await waitFor(() => {
      expect(queryAllByTestId(TESTCAFE_ID_AGENT_ACCESS_TABLE)).toHaveLength(2);
      expect(queryByTestId(TESTCAFE_ID_ADVANCED_SHARING_BUTTON)).not.toBeNull();
    });
    expect(asFragment()).toMatchSnapshot();
  });
  describe("when resource is a container", () => {
    beforeEach(() => {
      mockedUseRouter.mockReturnValue({
        query: { resourceIri: "/container/" },
      });
      mockedUseAddressBook.mockReturnValue({ data: mockAddressBook() });
      mockedUseContacts.mockReturnValue({
        data: [
          mockPersonContact({
            addressBook,
            personThingUrl: "https://example.org/contacts/Person/1234/",
            name: "Example 1",
          }),
          mockPersonContact({
            addressBook,
            personThingUrl: "https://example.org/contacts/Person/3456/",
            name: "Example 2",
          }),
        ],
      });
    });
    // since the permissions cannot be mocked reliably for the custom policies, those are tested separately in the table component
    it("renders an info box which alerts the user that sharing applies to all items inside a folder", async () => {
      const { asFragment, queryByText } = renderWithTheme(
        <PermissionsContextProvider>
          <SharingAccordion />
        </PermissionsContextProvider>
      );
      await waitFor(() => {
        expect(
          queryByText("Sharing applies to all items in this folder")
        ).not.toBeNull();
      });
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
