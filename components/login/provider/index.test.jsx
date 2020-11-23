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
import userEvent from "@testing-library/user-event";
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

jest.mock("../../../src/windowHelpers");
jest.mock("../../../src/hooks/useIdpFromQuery");

describe("ProviderLogin form", () => {
  beforeEach(() => {
    useIdpFromQuery.mockReturnValue(null);
  });

  it("renders a webid login form", () => {
    const { asFragment } = renderWithTheme(<ProviderLogin />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("calls the login function upon submitting the form", () => {
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
    expect(login).toHaveBeenCalled();
  });

  it("renders a validation error if login fails", () => {
    const { asFragment } = renderWithTheme(
      <ProviderLogin defaultError={new Error()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("allows setting idp with query param", () => {
    const iri = "http://example.com";
    useIdpFromQuery.mockReturnValue({
      iri,
      label: "example.com",
    });
    const { getByTestId } = renderWithTheme(<ProviderLogin />);
    const input = getByTestId(TESTCAFE_ID_LOGIN_FIELD).querySelector("input");
    expect(input.value).toEqual(iri);
    expect(document.activeElement).toEqual(input);
  });
});

describe("setupOnProviderChange", () => {
  it("sets up event handler", () => {
    const setProviderIri = jest.fn();
    setupOnProviderChange(setProviderIri)({}, 42);
    expect(setProviderIri).toHaveBeenCalledWith(42);
  });
});

describe("setupLoginHandler", () => {
  it("sets up event handler", () => {
    const login = jest.fn();
    const event = { preventDefault: jest.fn() };
    setupLoginHandler(login)(event);
    expect(event.preventDefault).toHaveBeenCalledWith();
    expect(login).toHaveBeenCalledWith();
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
  it("handles when value is not a value for Chrome and Edge", () =>
    expect(getErrorMessage(new Error("Invalid URL"))).toEqual(
      "This value is not a URL. Please fill out a valid Solid Identity Provider."
    ));
  it("handles when value is not a value for Firefox", () =>
    expect(getErrorMessage(new Error("URL constructor"))).toEqual(
      "This value is not a URL. Please fill out a valid Solid Identity Provider."
    ));
  it("handles when value is empty", () =>
    expect(getErrorMessage(new Error("sessionId"))).toEqual(
      "Please provide a URL. Please fill out a valid Solid Identity Provider."
    ));
});
