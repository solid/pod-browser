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
import { vcard } from "rdf-namespaces";
import {
  addStringNoLocale,
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
} from "@inrupt/solid-client";
import mockSession, {
  mockUnauthenticatedSession,
} from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import AddContact, {
  EXISTING_WEBID_ERROR_MESSAGE,
  FETCH_PROFILE_FAILED_ERROR_MESSAGE,
  handleSubmit,
  NO_NAME_ERROR_MESSAGE,
} from "./index";
import * as addressBookFns from "../../src/addressBook";
import { contactsContainerIri } from "../../src/addressBook";
import { renderWithTheme } from "../../__testUtils/withTheme";
import {
  aliceWebIdUrl,
  mockPersonDatasetAlice,
  mockProfileAlice,
} from "../../__testUtils/mockPersonResource";
import * as profileHelperFns from "../../src/solidClientHelpers/profile";

describe("AddContact", () => {
  test("it renders the Add Contact form", () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AddContact />
      </SessionProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test("it renders a spinner when user is not logged in", () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <AddContact />
      </SessionProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
describe("handleSubmit", () => {
  const addressBookUri = "https://example.com/addressBook";
  const addressBook = mockSolidDatasetFrom(addressBookUri);
  let setAgentId;
  let setIsLoading;
  let alertError;
  let alertSuccess;
  let setDirtyForm;
  const fetch = "fetch";

  beforeEach(() => {
    setAgentId = jest.fn();
    setIsLoading = jest.fn();
    alertError = jest.fn();
    alertSuccess = jest.fn();
    setDirtyForm = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it alerts the user and exits if the webid already exists", async () => {
    const personDataset = mockPersonDatasetAlice();
    const personProfile = mockProfileAlice();
    const people = [personDataset];
    const handler = handleSubmit({
      addressBook,
      setAgentId,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      setDirtyForm,
      people,
    });
    jest
      .spyOn(profileHelperFns, "fetchProfile")
      .mockResolvedValue(personProfile);
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([personDataset]);
    await handler("alreadyExistingWebId");
    expect(addressBookFns.findContactInAddressBook).toHaveBeenCalledWith(
      people,
      aliceWebIdUrl,
      fetch
    );
    expect(setAgentId).toHaveBeenCalledTimes(0);
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertError).toHaveBeenCalledWith(EXISTING_WEBID_ERROR_MESSAGE);
    expect(setDirtyForm).toHaveBeenCalledWith(true);
  });
  test("it alerts the user and exits if the webid doesn't have a name", async () => {
    const personUri = "http://example.com/marie#me";
    const mockProfile = { webId: personUri };
    const handler = handleSubmit({
      addressBook,
      setAgentId,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      setDirtyForm,
    });
    jest.spyOn(profileHelperFns, "fetchProfile").mockResolvedValue(mockProfile);
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([]);
    await handler(personUri);
    expect(setAgentId).toHaveBeenCalledTimes(0);
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledWith(NO_NAME_ERROR_MESSAGE);
  });
  test("it alerts the user and exits if fetching the profile fails", async () => {
    const mockProfileError = new Error("error");
    const handler = handleSubmit({
      addressBook,
      setAgentId,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      setDirtyForm,
    });
    jest
      .spyOn(profileHelperFns, "fetchProfile")
      .mockRejectedValueOnce(mockProfileError);
    await handler("iri");
    expect(setAgentId).toHaveBeenCalledTimes(0);
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledWith(FETCH_PROFILE_FAILED_ERROR_MESSAGE);
  });
  test("it saves a new contact", async () => {
    const personUri = "http://example.com/alice#me";
    const personDataset = addStringNoLocale(
      mockThingFrom(personUri),
      vcard.fn,
      "Alice"
    );
    const contactsIri = contactsContainerIri("http://www.example.com/");
    const people = mockSolidDatasetFrom(contactsIri);
    const peopleMutate = jest.fn();
    const peopleDatasetWithContact = setThing(people, personDataset);
    const mockProfile = mockProfileAlice();
    const handler = handleSubmit({
      addressBook,
      setAgentId,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      setDirtyForm,
      people,
      peopleMutate,
    });
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([]);
    jest.spyOn(profileHelperFns, "fetchProfile").mockResolvedValue(mockProfile);
    jest.spyOn(addressBookFns, "saveContact").mockResolvedValue({
      response: peopleDatasetWithContact,
      error: null,
    });
    await handler(personUri);
    expect(setAgentId).toHaveBeenCalledWith("");
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).toHaveBeenCalledWith(
      "Alice was added to your contacts"
    );
    expect(alertError).not.toHaveBeenCalled();
    expect(setDirtyForm).toHaveBeenCalledWith(false);
  });
  test("it alerts the user if there is an error while creating the contact", async () => {
    const mockProfile = mockProfileAlice();
    const handler = handleSubmit({
      addressBook,
      setAgentId,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      setDirtyForm,
    });
    jest.spyOn(profileHelperFns, "fetchProfile").mockResolvedValue(mockProfile);
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([]);
    jest.spyOn(addressBookFns, "saveContact").mockResolvedValue({
      response: null,
      error: "There was an error saving the resource",
    });
    await handler(aliceWebIdUrl);
    expect(setAgentId).toHaveBeenCalledTimes(0);
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledWith(
      "There was an error saving the resource"
    );
  });
});
