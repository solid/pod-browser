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
import { getStringNoLocale, getUrl } from "@inrupt/solid-client";
import { vcard } from "rdf-namespaces";
import mockSession, {
  mockUnauthenticatedSession,
} from "../../__testUtils/mockSession";
import mockSessionContextProvider from "../../__testUtils/mockSessionContextProvider";
import AddContact, {
  handleSubmit,
  EXISTING_WEBID_ERROR_MESSAGE,
  NO_NAME_ERROR_MESSAGE,
} from "./index";
import { findContactInAddressBook, saveContact } from "../../src/addressBook";
import { WithTheme } from "../../__testUtils/mountWithTheme";
import { defaultTheme } from "../../src/theme";
import { mockPersonDatasetAlice } from "../../__testUtils/mockPersonResource";
import { getResource } from "../../src/solidClientHelpers/resource";

jest.mock("@inrupt/solid-client");
jest.mock("next/router");
jest.mock("../../src/addressBook");
jest.mock("../../src/solidClientHelpers/resource");

beforeEach(() => {
  jest.resetModules();
});

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

    expect(tree).toMatchSnapshot();
  });
});
describe("handleSubmit", () => {
  test("it alerts the user and exits if the webid already exists", async () => {
    const personUri = "http://example.com/alice#me";
    const personDataset = mockPersonDatasetAlice();
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      webId: personUri,
    });
    getResource.mockResolvedValue({
      response: { dataset: personDataset, iri: personUri },
    });
    getUrl.mockReturnValue("https://www.example.com/");
    findContactInAddressBook.mockResolvedValue([personDataset]);
    await handler();
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertError).toHaveBeenCalledWith(EXISTING_WEBID_ERROR_MESSAGE);
  });
  test("it alerts the user and exits if the webid doesn't have a name", async () => {
    const { mockThingFrom } = jest.requireActual("@inrupt/solid-client");
    const personUri = "http://example.com/marie#me";
    const personDataset = mockThingFrom(personUri);
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      webId: personUri,
    });
    getUrl.mockReturnValue("https://www.example.com/");
    getResource.mockResolvedValue({
      response: { dataset: personDataset, iri: personUri },
    });
    findContactInAddressBook.mockResolvedValue([]);
    await handler();
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertError).toHaveBeenCalledWith(NO_NAME_ERROR_MESSAGE);
  });
  test("it saves a new contact", async () => {
    const {
      setThing,
      mockSolidDatasetFrom,
      mockThingFrom,
      addStringNoLocale,
    } = jest.requireActual("@inrupt/solid-client");
    const personUri = "http://example.com/alice#me";
    const personDataset = addStringNoLocale(
      mockThingFrom(personUri),
      vcard.fn,
      "Alice"
    );
    const peopleDataset = mockSolidDatasetFrom(
      "https://www.example.com/contacts"
    );
    const peopleDatasetWithContact = setThing(peopleDataset, personDataset);
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      webId: personUri,
    });
    getResource.mockResolvedValue({
      response: { dataset: personDataset, iri: personUri },
      error: null,
    });
    getUrl.mockReturnValue("https://www.example.com/");
    getStringNoLocale.mockReturnValue("Alice");
    findContactInAddressBook.mockResolvedValue([]);
    saveContact.mockResolvedValue({
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
    const { mockThingFrom } = jest.requireActual("@inrupt/solid-client");
    const personUri = "http://example.com/alice#me";
    const personDataset = mockThingFrom(personUri);
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      webId: personUri,
    });
    getResource.mockResolvedValue({
      response: { dataset: personDataset, iri: personUri },
      error: null,
    });
    getUrl.mockReturnValue("https://www.example.com/");
    getStringNoLocale.mockReturnValue("Alice");
    findContactInAddressBook.mockResolvedValue([]);
    saveContact.mockResolvedValue({
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
  test("it alerts the user if there is an error while fetching the profile", async () => {
    const { mockThingFrom } = jest.requireActual("@inrupt/solid-client");
    const personUri = "http://example.com/alice#me";
    const personDataset = mockThingFrom(personUri);
    const setIsLoading = jest.fn();
    const alertError = jest.fn();
    const alertSuccess = jest.fn();
    const handler = handleSubmit({
      setIsLoading,
      alertError,
      alertSuccess,
      fetch,
      webId: personUri,
    });
    getResource
      .mockResolvedValueOnce({
        response: { dataset: personDataset, iri: personUri },
        error: null,
      })
      .mockResolvedValueOnce({
        response: null,
        error: "There was an error fetching the profile",
      });
    await handler();
    expect(setIsLoading).toHaveBeenCalledTimes(2);
    expect(alertSuccess).not.toHaveBeenCalled();
    expect(alertError).toHaveBeenCalledWith(
      "There was an error fetching the profile"
    );
  });
});
