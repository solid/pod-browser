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
import { mount } from "enzyme";
import { mountToJson } from "enzyme-to-json";
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
  handleSubmit,
  EXISTING_WEBID_ERROR_MESSAGE,
  NO_NAME_ERROR_MESSAGE,
} from "./index";
import * as addressBookFns from "../../src/addressBook";
import { WithTheme } from "../../__testUtils/mountWithTheme";
import { defaultTheme } from "../../src/theme";
import {
  mockPersonDatasetAlice,
  mockProfileAlice,
} from "../../__testUtils/mockPersonResource";
import * as profileHelperFns from "../../src/solidClientHelpers/profile";
import { contactsContainerIri } from "../../src/addressBook";

describe("AddContact", () => {
  test("it renders the Add Contact form", () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const tree = mount(
      <SessionProvider>
        <WithTheme theme={defaultTheme}>
          <AddContact />
        </WithTheme>
      </SessionProvider>
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });

  test("it renders a spinner when user is not logged in", () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider(session);
    const tree = mount(
      <SessionProvider>
        <WithTheme theme={defaultTheme}>
          <AddContact />
        </WithTheme>
      </SessionProvider>
    );

    expect(mountToJson(tree)).toMatchSnapshot();
  });
});
describe("handleSubmit", () => {
  const addressBook = mockSolidDatasetFrom("https://example.com/addressBook");

  test("it alerts the user and exits if the webid already exists", async () => {
    const personDataset = mockPersonDatasetAlice();
    const personProfile = mockProfileAlice();
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      addressBook,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
    });
    jest
      .spyOn(profileHelperFns, "fetchProfile")
      .mockResolvedValue(personProfile);
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([personDataset]);
    await handler();
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertError).toHaveBeenCalledWith(EXISTING_WEBID_ERROR_MESSAGE);
  });
  test("it alerts the user and exits if the webid doesn't have a name", async () => {
    const personUri = "http://example.com/marie#me";
    const mockProfile = { webId: personUri };
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      addressBook,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
    });
    jest.spyOn(profileHelperFns, "fetchProfile").mockResolvedValue(mockProfile);
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([]);
    await handler();
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledWith(NO_NAME_ERROR_MESSAGE);
  });
  test("it saves a new contact", async () => {
    const personUri = "http://example.com/alice#me";
    const personDataset = addStringNoLocale(
      mockThingFrom(personUri),
      vcard.fn,
      "Alice"
    );
    const contactsIri = contactsContainerIri("http://www.example.com/");
    const peopleDataset = mockSolidDatasetFrom(contactsIri);
    const peopleDatasetWithContact = setThing(peopleDataset, personDataset);
    const mockProfile = mockProfileAlice();
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      addressBook,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
    });
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([]);
    jest.spyOn(profileHelperFns, "fetchProfile").mockResolvedValue(mockProfile);
    jest.spyOn(addressBookFns, "saveContact").mockResolvedValue({
      response: peopleDatasetWithContact,
      error: null,
    });
    await handler();
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).toHaveBeenCalledWith(
      "Alice was added to your contacts"
    );
    expect(alertError).not.toHaveBeenCalled();
  });
  test("it alerts the user if there is an error while creating the contact", async () => {
    const mockProfile = mockProfileAlice();
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      addressBook,
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
    });
    jest.spyOn(profileHelperFns, "fetchProfile").mockResolvedValue(mockProfile);
    jest
      .spyOn(addressBookFns, "findContactInAddressBook")
      .mockResolvedValue([]);
    jest.spyOn(addressBookFns, "saveContact").mockResolvedValue({
      response: null,
      error: "There was an error saving the resource",
    });
    await handler();
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledWith(
      "There was an error saving the resource"
    );
  });
});
