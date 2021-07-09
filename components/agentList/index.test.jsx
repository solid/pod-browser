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
import * as solidClientFns from "@inrupt/solid-client";
import { useRouter } from "next/router";
import { foaf } from "rdf-namespaces";
import { screen, waitFor } from "@testing-library/react";
import * as addressBookFns from "../../src/addressBook";
import useAddressBookOld from "../../src/hooks/useAddressBookOld";
import useContactsOld from "../../src/hooks/useContactsOld";
import useProfiles from "../../src/hooks/useProfiles";
import { renderWithTheme } from "../../__testUtils/withTheme";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  mockProfileAlice,
  mockProfileBob,
} from "../../__testUtils/mockPersonResource";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import AgentList, { handleDeleteContact } from "./index";
import { mockAddressBookDataset } from "../../__testUtils/mockAddressBook";

jest.mock("../../src/hooks/useAddressBookOld");
jest.mock("../../src/hooks/useContactsOld");
jest.mock("../../src/hooks/useProfiles");
jest.mock("next/router");

const mockedUseRouter = useRouter;
const mockUseAddressBook = useAddressBookOld;
const mockUseContacts = useContactsOld;
const mockUseProfiles = useProfiles;

const setSearchValues = jest.fn();

describe("AgentList", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      route: "/privacy",
    });
  });
  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);
  it("renders spinner while useAddressBookOld is loading", () => {
    mockUseAddressBook.mockReturnValue([null, null]);
    mockUseContacts.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(mockUseAddressBook).toHaveBeenCalledWith();
    expect(mockUseContacts).toHaveBeenCalledWith(null, foaf.Person);
  });

  it("renders spinner while useContactsOld is loading", () => {
    mockUseAddressBook.mockReturnValue([42, null]);
    mockUseContacts.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(mockUseContacts).toHaveBeenCalledWith(42, foaf.Person);
  });

  it("renders spinner while useProfiles is loading", () => {
    mockUseAddressBook.mockReturnValue([42, null]);
    mockUseContacts.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(mockUseProfiles).toHaveBeenCalledWith("peopleData");
  });

  it("renders error if useAddressBookOld returns error", () => {
    mockUseAddressBook.mockReturnValue([null, "error"]);
    mockUseContacts.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders page when people is loaded", () => {
    mockUseAddressBook.mockReturnValue([42, null]);
    mockUseContacts.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue([
      mockPersonDatasetAlice(),
      mockPersonDatasetBob(),
    ]);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("sets search values when people is loaded", () => {
    mockUseAddressBook.mockReturnValue([null, null]);
    mockUseContacts.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue(null);

    renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(setSearchValues).toHaveBeenCalledWith("peopleData");
  });

  it("renders apps when type is app", () => {
    mockUseAddressBook.mockReturnValue([null, null]);
    mockUseContacts.mockReturnValue({
      data: null,
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue(null);

    const { getByText } = renderWithTheme(
      <SessionProvider>
        <AgentList contactType="app" setSearchValues={setSearchValues} />
      </SessionProvider>
    );
    waitFor(() => {
      expect(getByText("Mock App")).toBeInTheDocument();
    });
  });

  it("renders apps along with people when type is all", () => {
    const people = [mockProfileBob(), mockProfileAlice()];
    mockUseAddressBook.mockReturnValue([null, null]);
    mockUseContacts.mockReturnValue({
      data: people,
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue([
      mockPersonDatasetAlice(),
      mockPersonDatasetBob(),
    ]);

    const { getByText } = renderWithTheme(
      <SessionProvider>
        <AgentList contactType="all" setSearchValues={setSearchValues} />
      </SessionProvider>
    );
    waitFor(() => {
      expect(getByText(bobWebIdUrl)).toBeInTheDocument();
      expect(getByText(aliceWebIdUrl)).toBeInTheDocument();
      expect(getByText("Mock App")).toBeInTheDocument();
    });
  });

  it("renders only apps if no people available when type is all", () => {
    mockUseAddressBook.mockReturnValue([null, null]);
    mockUseContacts.mockReturnValue({
      data: null,
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue(null);

    const { getByText } = renderWithTheme(
      <SessionProvider>
        <AgentList contactType="all" setSearchValues={setSearchValues} />
      </SessionProvider>
    );
    waitFor(() => {
      expect(getByText("Mock App")).toBeInTheDocument();
    });
  });

  it("renders empty state message when there are no contacts", () => {
    mockUseAddressBook.mockReturnValue([42, null]);
    mockUseContacts.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    mockUseProfiles.mockReturnValue([]);

    renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );

    const message = screen.getByText("You don’t have any contacts yet!");

    expect(message).toBeTruthy();
  });

  it("renders error if useContacts returns error", () => {
    mockUseAddressBook.mockReturnValue([42, null]);
    mockUseContacts.mockReturnValue({
      data: undefined,
      error: "error",
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AgentList
          contactType={foaf.Person}
          setSearchValues={setSearchValues}
        />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("handleDeleteContact", () => {
  it("returns a handler that deletes a contact, updates people data and closes drawer", async () => {
    const addressBookUrl = "http://example.com/contacts";
    const contact = "contact";
    const addressBook = mockAddressBookDataset();
    const closeDrawer = jest.fn();
    const fetch = jest.fn();
    const people = [contact];
    const peopleMutate = jest.fn();
    const selectedContactIndex = 0;

    jest.spyOn(solidClientFns, "getSourceUrl").mockReturnValue(addressBookUrl);

    const mockDeleteContact = jest
      .spyOn(addressBookFns, "deleteContact")
      .mockImplementation(() => null);

    const handler = handleDeleteContact({
      addressBook,
      closeDrawer,
      fetch,
      people,
      peopleMutate,
      selectedContactIndex,
    });

    await handler();

    expect(mockDeleteContact).toHaveBeenCalledWith(
      addressBookUrl,
      contact,
      foaf.Person,
      fetch
    );
    expect(peopleMutate).toHaveBeenCalled();
    expect(closeDrawer).toHaveBeenCalled();
  });
});
