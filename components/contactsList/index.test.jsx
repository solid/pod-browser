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
import { foaf } from "rdf-namespaces";
import { screen } from "@testing-library/react";
import useAddressBook from "../../src/hooks/useAddressBook";
import useContacts from "../../src/hooks/useContacts";
import useProfiles from "../../src/hooks/useProfiles";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ContactsList, { handleDeleteContact } from "./index";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
} from "../../__testUtils/mockPersonResource";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import * as contactModelFns from "../../src/models/contact";
import mockAddressBook from "../../__testUtils/mockAddressBook";

jest.mock("../../src/hooks/useAddressBook");
const mockedAddressBookHook = useAddressBook;

jest.mock("../../src/hooks/useContacts");
const mockedContactsHook = useContacts;

jest.mock("../../src/hooks/useProfiles");
const mockedProfilesHook = useProfiles;

const session = mockSession();
const SessionProvider = mockSessionContextProvider(session);
const addressBook = mockAddressBook();

describe("ContactsList", () => {
  it("renders spinner while useAddressBook is loading", () => {
    mockedAddressBookHook.mockReturnValue({ addressBook: null });
    mockedContactsHook.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });
    mockedProfilesHook.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(mockedAddressBookHook).toHaveBeenCalledWith();
    expect(mockedContactsHook).toHaveBeenCalledWith(null, foaf.Person);
  });

  it("renders spinner while useContacts is loading", () => {
    mockedAddressBookHook.mockReturnValue({ addressBook });
    mockedContactsHook.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });
    mockedProfilesHook.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(mockedContactsHook).toHaveBeenCalledWith(addressBook, foaf.Person);
  });

  it("renders spinner while useProfiles is loading", () => {
    mockedAddressBookHook.mockReturnValue({ addressBook });
    mockedContactsHook.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    mockedProfilesHook.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(mockedProfilesHook).toHaveBeenCalledWith("peopleData");
  });

  it("renders error if useAddressBook returns error", () => {
    mockedAddressBookHook.mockReturnValue({
      addressBook: null,
      error: "error",
    });
    mockedContactsHook.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders page when people is loaded", () => {
    mockedAddressBookHook.mockReturnValue({ addressBook });
    mockedContactsHook.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    mockedProfilesHook.mockReturnValue([
      mockPersonDatasetAlice(),
      mockPersonDatasetBob(),
    ]);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders empty state message when there are no contacts", () => {
    mockedAddressBookHook.mockReturnValue({ addressBook });
    mockedContactsHook.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    mockedProfilesHook.mockReturnValue([]);

    renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );

    const message = screen.getByText("You don’t have any contacts yet!");

    expect(message).toBeTruthy();
  });

  it("renders error if mockedContactsHook returns error", () => {
    mockedAddressBookHook.mockReturnValue({ addressBook });
    mockedContactsHook.mockReturnValue({
      data: undefined,
      error: "error",
      mutate: () => {},
    });

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("handleDeleteContact", () => {
  it("returns a handler that deletes a contact, updates people data and closes drawer", async () => {
    const addressBookUrl = "http://example.com/contacts";
    const contact = "contact";
    const closeDrawer = jest.fn();
    const fetch = jest.fn();
    const people = [contact];
    const peopleMutate = jest.fn();
    const selectedContactIndex = 0;

    jest.spyOn(solidClientFns, "getSourceUrl").mockReturnValue(addressBookUrl);
    const deleteContact = jest
      .spyOn(contactModelFns, "deleteContact")
      .mockResolvedValue();

    const handler = handleDeleteContact({
      addressBook,
      closeDrawer,
      fetch,
      people,
      peopleMutate,
      selectedContactIndex,
    });

    await handler();

    expect(deleteContact).toHaveBeenCalledWith(
      addressBook,
      contact,
      foaf.Person,
      fetch
    );
    expect(peopleMutate).toHaveBeenCalled();
    expect(closeDrawer).toHaveBeenCalled();
  });
});
