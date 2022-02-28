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
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/router";
import { mockUnauthenticatedSession } from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import ProviderLogin, {
  getErrorMessage,
  setupErrorHandler,
  setupLoginHandler,
  setupOnProviderChange,
  TESTCAFE_ID_LOGIN_FIELD,
} from "./index";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import useIdpFromQuery from "../../../src/hooks/useIdpFromQuery";

import { getCurrentHostname } from "../../../src/windowHelpers";

jest.mock("../../../src/windowHelpers");
jest.mock("../../../src/hooks/useIdpFromQuery");
jest.mock("next/router");

describe("ProviderLogin form", () => {
  beforeEach(() => {
    useIdpFromQuery.mockReturnValue(null);
    useRouter.mockReturnValue({ push: jest.fn() });
  });

  it("renders a webid login form", () => {
    const { asFragment } = renderWithTheme(<ProviderLogin />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a webid login form with a pre-populated input if idp is available from query", () => {
    const iri = "http://example.com";
    const label = "example.com";
    const { asFragment } = renderWithTheme(
      <ProviderLogin provider={{ iri, label }} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the login function upon submitting the form", async () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { login } = session;
    const { getByTestId } = renderWithTheme(
      <SessionProvider>
        <ProviderLogin />
      </SessionProvider>
    );
    const loginInput = getByTestId(TESTCAFE_ID_LOGIN_FIELD);
    userEvent.type(loginInput, "{enter}");
    waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
  });

  it("renders a validation error if login fails", () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <ProviderLogin defaultError={new Error()} />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("allows setting idp with query param", () => {
    const session = mockUnauthenticatedSession();
    const SessionProvider = mockSessionContextProvider(session);
    const iri = "http://example.com";
    const label = "example.com";
    const { getByTestId } = renderWithTheme(
      <SessionProvider>
        <ProviderLogin provider={{ iri, label }} />
      </SessionProvider>
    );
    const input = getByTestId(TESTCAFE_ID_LOGIN_FIELD).querySelector("input");
    expect(input.value).toEqual(iri);
    expect(document.activeElement).toEqual(input);
  });
});

describe("setupOnProviderChange", () => {
  it("sets up event handler", () => {
    const setProviderIri = jest.fn();
    const setLoginError = jest.fn();
    setupOnProviderChange(setProviderIri, setLoginError)(
      { preventDefault: jest.fn() },
      "string"
    );
    expect(setLoginError).toHaveBeenCalledWith(null);
    expect(setProviderIri).toHaveBeenCalledWith("https://string");
  });
  it("calls setProviderIri with provided string if user providers a correct URL", () => {
    const setProviderIri = jest.fn();
    const setLoginError = jest.fn();
    setupOnProviderChange(setProviderIri, setLoginError)(
      { preventDefault: jest.fn() },
      "https://string"
    );
    expect(setLoginError).toHaveBeenCalledWith(null);
    expect(setProviderIri).toHaveBeenCalledWith("https://string");
  });
  it("calls setProviderIri with correct iri when passed an object from the autocomplete options", () => {
    const setProviderIri = jest.fn();
    const setLoginError = jest.fn();
    setupOnProviderChange(setProviderIri, setLoginError)(
      { preventDefault: jest.fn() },
      { iri: "https://example.com", label: "example.com" }
    );
    expect(setLoginError).toHaveBeenCalledWith(null);
    expect(setProviderIri).toHaveBeenCalledWith("https://example.com");
  });
  it("calls setProviderIri with null for other values", () => {
    const setProviderIri = jest.fn();
    const setLoginError = jest.fn();
    setupOnProviderChange(setProviderIri, setLoginError)(
      { preventDefault: jest.fn() },
      42
    );
    expect(setLoginError).toHaveBeenCalledWith(null);
    expect(setProviderIri).toHaveBeenCalledWith(null);
  });
});

describe("setupLoginHandler", () => {
  it("sets up event handler", () => {
    const login = jest.fn();
    const setLoginError = jest.fn();
    const providerIri = "https://example.org";
    const event = { preventDefault: jest.fn() };

    setupLoginHandler(login, setLoginError, providerIri)(event, providerIri);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(login).toHaveBeenCalledWith({
      oidcIssuer: providerIri,
      clientId: "undefined/api/app",
      clientName: "Inrupt PodBrowser",
    });
  });
});

describe("setupErrorHandler", () => {
  it("sets up event handler", () => {
    const setLoginError = jest.fn();
    const error = new Error();
    setupErrorHandler(setLoginError)(error);
    expect(setLoginError).toHaveBeenCalledWith(error);
  });
});

describe("getErrorMessage", () => {
  it("has a standard message", () =>
    expect(getErrorMessage(new Error())).toEqual(
      "We were unable to log in with this URL. Please fill out a valid Solid Identity Provider."
    ));

  it("handles when URL is not an IdP for Chrome, Edge, and Firefox", () =>
    expect(getErrorMessage(new Error("fetch"))).toEqual(
      "This URL is not a Solid Identity Provider."
    ));

  it("handles when URL is not an IDP for Safari", () =>
    expect(
      getErrorMessage(new Error("Not allowed to request resource"))
    ).toEqual("This URL is not a Solid Identity Provider."));

  it("handles when value is empty", () =>
    expect(getErrorMessage(new Error("sessionId"))).toEqual(
      "Please fill out a valid Solid Identity Provider."
    ));
});
