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
import { deleteContact } from "../../src/addressBook";
import useAddressBookOld from "../../src/hooks/useAddressBookOld";
import useContactsOld from "../../src/hooks/useContactsOld";
import useProfiles from "../../src/hooks/useProfiles";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ContactsList, { handleDeleteContact } from "./index";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
} from "../../__testUtils/mockPersonResource";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";

jest.mock("../../src/addressBook");
jest.mock("../../src/hooks/useAddressBookOld");
jest.mock("../../src/hooks/useContactsOld");
jest.mock("../../src/hooks/useProfiles");

describe("ContactsList", () => {
  const session = mockSession();
  const SessionProvider = mockSessionContextProvider(session);
  it("renders spinner while useAddressBookOld is loading", () => {
    useAddressBookOld.mockReturnValue([null, null]);
    useContactsOld.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });
    useProfiles.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(useAddressBookOld).toHaveBeenCalledWith();
    expect(useContactsOld).toHaveBeenCalledWith(null, foaf.Person);
  });

  it("renders spinner while useContactsOld is loading", () => {
    useAddressBookOld.mockReturnValue([42, null]);
    useContactsOld.mockReturnValue({
      data: undefined,
      error: undefined,
      mutate: () => {},
    });
    useProfiles.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(useContactsOld).toHaveBeenCalledWith(42, foaf.Person);
  });

  it("renders spinner while useProfiles is loading", () => {
    useAddressBookOld.mockReturnValue([42, null]);
    useContactsOld.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    useProfiles.mockReturnValue(null);

    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
    expect(useProfiles).toHaveBeenCalledWith("peopleData");
  });

  it("renders error if useAddressBookOld returns error", () => {
    useAddressBookOld.mockReturnValue([null, "error"]);
    useContactsOld.mockReturnValue({
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
    useAddressBookOld.mockReturnValue([42, null]);
    useContactsOld.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    useProfiles.mockReturnValue([
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
    useAddressBookOld.mockReturnValue([42, null]);
    useContactsOld.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    useProfiles.mockReturnValue([]);

    renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );

    const message = screen.getByText("You don’t have any contacts yet!");

    expect(message).toBeTruthy();
  });

  it("renders error if useContacts returns error", () => {
    useAddressBookOld.mockReturnValue([42, null]);
    useContactsOld.mockReturnValue({
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
    const addressBook = "address book";
    const closeDrawer = jest.fn();
    const fetch = jest.fn();
    const people = [contact];
    const peopleMutate = jest.fn();
    const selectedContactIndex = 0;

    jest.spyOn(solidClientFns, "getSourceUrl").mockReturnValue(addressBookUrl);

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
      addressBookUrl,
      contact,
      foaf.Person,
      fetch
    );
    expect(peopleMutate).toHaveBeenCalled();
    expect(closeDrawer).toHaveBeenCalled();
  });
});
