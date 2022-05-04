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
import { foaf, schema } from "rdf-namespaces";
import { screen, waitFor } from "@testing-library/react";
import * as addressBookFns from "../../src/addressBook";
import useAddressBookOld from "../../src/hooks/useAddressBookOld";
import useContactsOld from "../../src/hooks/useContactsOld";
import useFullProfile from "../../src/hooks/useFullProfile";
import useProfiles from "../../src/hooks/useProfiles";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ContactsList, { handleDeleteContact } from "./index";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
  mockPersonDatasetAlice,
  mockPersonThingAlice,
  mockPersonThingBob,
} from "../../__testUtils/mockPersonResource";
import mockSession from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import { TESTCAFE_ID_PROFILE_LINK } from "../profileLink";

jest.mock("../../src/hooks/useAddressBookOld");
jest.mock("../../src/hooks/useContactsOld");
jest.mock("../../src/hooks/useProfiles");
jest.mock("../../src/hooks/useFullProfile");
jest.mock("next/router");

const mockedUseRouter = useRouter;

describe("ContactsList", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      route: "/contacts",
    });
  });
  const session = mockSession();
  const profile = { webIdProfile: mockPersonDatasetAlice() };
  const SessionProvider = mockSessionContextProvider(session, false, profile);
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

  it("renders page when people is loaded", async () => {
    useFullProfile
      .mockReturnValueOnce({
        webId: aliceWebIdUrl,
        names: ["Alice"],
        types: [schema.Person],
      })
      .mockReturnValueOnce({
        webId: bobWebIdUrl,
        names: ["Bob"],
        types: [schema.Person],
      });
    useAddressBookOld.mockReturnValue([42, null]);
    useContactsOld.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    useProfiles.mockReturnValue([mockPersonThingAlice(), mockPersonThingBob()]);
    const { asFragment, getAllByTestId } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(getAllByTestId(TESTCAFE_ID_PROFILE_LINK)[0]).toHaveAttribute(
        "href",
        `/contacts/${encodeURIComponent(aliceWebIdUrl)}`
      );
      expect(getAllByTestId(TESTCAFE_ID_PROFILE_LINK)[1]).toHaveAttribute(
        "href",
        `/contacts/${encodeURIComponent(bobWebIdUrl)}`
      );
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders webId for failed profiles and name for successfully fetched profiles", async () => {
    useAddressBookOld.mockReturnValue([42, null]);
    const webId = "https://somewebid.com";
    const contact = solidClientFns.addUrl(
      solidClientFns.createThing(),
      addressBookFns.vcardExtras("WebId"),
      webId
    );
    useContactsOld.mockReturnValue({
      data: "peopleData",
      error: undefined,
      mutate: () => {},
    });
    useProfiles.mockReturnValue([mockPersonThingAlice(), contact]);
    useFullProfile
      .mockReturnValueOnce({
        webId: aliceWebIdUrl,
        names: ["Alice"],
        types: [schema.Person],
      })
      .mockReturnValueOnce({
        webId,
        names: [],
        types: [schema.Person],
      });

    const { asFragment, getAllByTestId } = renderWithTheme(
      <SessionProvider>
        <ContactsList />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getAllByTestId(TESTCAFE_ID_PROFILE_LINK)[0]).toHaveTextContent(
        "Alice"
      );
      expect(getAllByTestId(TESTCAFE_ID_PROFILE_LINK)[1]).toHaveTextContent(
        webId
      );
      expect(asFragment()).toMatchSnapshot();
    });
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
    const mockDeleteContact = jest
      .spyOn(addressBookFns, "deleteContact")
      .mockImplementation(() => null);
    const addressBookUrl = "http://example.com/contacts";
    const contact = mockPersonDatasetAlice();
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
