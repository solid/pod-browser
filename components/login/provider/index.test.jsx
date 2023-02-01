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
import { act, waitFor, screen, getAllByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/router";
import { validateProviderIri } from "./validateProviderIri";
import { defaultIdentityProviders } from "../../../constants/provider";

import ProviderLogin, {
  TESTCAFE_ID_LOGIN_FIELD,
  TESTCAFE_ID_GO_BUTTON,
  translateError,
} from "./index";

import { renderWithTheme } from "../../../__testUtils/withTheme";

jest.mock("./validateProviderIri");
jest.mock("../../../src/hooks/useIdpFromQuery");
jest.mock("next/router");

describe("ProviderLogin form", () => {
  beforeEach(() => {
    useRouter.mockReturnValue({ push: jest.fn() });
    validateProviderIri.mockReturnValue({ issuer: "https://example.com/" });
  });

  it("renders a provider login form", () => {
    const { asFragment, getByTestId } = renderWithTheme(
      <ProviderLogin handleLogin={() => {}} />
    );

    const loginInput = getByTestId(TESTCAFE_ID_LOGIN_FIELD);

    expect(asFragment()).toMatchSnapshot();
    expect(document.activeElement).toEqual(loginInput);
  });

  it("renders a provider login form with a pre-populated input if provider prop passed", async () => {
    const iri = "http://example.com";
    const label = "example.com";

    const handleLogin = jest.fn();
    validateProviderIri.mockReturnValue({ issuer: "http://example.com/" });

    const { asFragment, getByTestId } = renderWithTheme(
      <ProviderLogin provider={{ iri, label }} handleLogin={handleLogin} />
    );
    expect(asFragment()).toMatchSnapshot();

    const submitBtn = getByTestId(TESTCAFE_ID_GO_BUTTON);
    submitBtn.click();

    await waitFor(() => {
      expect(validateProviderIri).toHaveBeenCalledWith(iri);
      expect(handleLogin).toHaveBeenCalledWith("http://example.com/");
    });
  });

  it("can be cleared using a button", async () => {
    const handleLogin = jest.fn();

    const { asFragment, getByTestId, getByLabelText } = renderWithTheme(
      <ProviderLogin handleLogin={handleLogin} />
    );

    const loginInput = getByTestId(TESTCAFE_ID_LOGIN_FIELD);
    userEvent.type(loginInput, "a");

    await waitFor(() => {
      expect(loginInput.value).toBe("a");
    });

    const clearButton = getByLabelText("Clear");
    userEvent.click(clearButton);

    await waitFor(() => {
      expect(loginInput.value).toBe("");
    });

    // Click the "go" button, triggering the login via handleSubmit
    const submitBtn = getByTestId(TESTCAFE_ID_GO_BUTTON);
    submitBtn.click();

    await waitFor(() => {
      expect(validateProviderIri).toHaveBeenCalledWith("");
      expect(handleLogin).not.toHaveBeenCalled();
    });

    expect(asFragment).toMatchSnapshot();
  });

  it("can select an option from the autocomplete", async () => {
    const provider = defaultIdentityProviders[0];
    const handleLogin = jest.fn();
    validateProviderIri.mockReturnValue({
      issuer: provider.iri,
    });

    const { getByTestId } = renderWithTheme(
      <ProviderLogin handleLogin={handleLogin} />
    );

    const loginInput = getByTestId(TESTCAFE_ID_LOGIN_FIELD);
    userEvent.type(loginInput, "s");

    // The autocomplete popup does not have a specific data-testid, so we need
    // to do it this way instead:
    const autocompletes = screen
      .getAllByRole("listbox")
      .filter(
        (listbox) => listbox.getAttribute("id") === "provider-select-popup"
      );

    await waitFor(() => {
      // There should be one provider-select-popup on the page:
      expect(autocompletes).toHaveLength(1);
    });

    // Get the options that are within the autocomplete:
    const options = getAllByRole(autocompletes[0], "option");

    // solidweb.org, solidcommunity.net, use.id:
    expect(options).toHaveLength(3);

    // Click the first option from the autocomplete:
    userEvent.click(options[0]);

    await waitFor(() => {
      expect(loginInput.value).toBe(provider.label);
    });

    // Click the "go" button, triggering the login via handleSubmit
    const submitBtn = getByTestId(TESTCAFE_ID_GO_BUTTON);
    submitBtn.click();

    await waitFor(() => {
      expect(validateProviderIri).toHaveBeenCalledWith(provider.iri);
      expect(handleLogin).toHaveBeenCalledWith(provider.iri);
    });
  });

  it("calls the login function upon submitting the form", async () => {
    const handleLogin = jest.fn();
    validateProviderIri.mockReturnValue({
      issuer: "https://example.com/",
    });

    const { getByTestId } = renderWithTheme(
      <ProviderLogin handleLogin={handleLogin} />
    );

    const loginInput = getByTestId(TESTCAFE_ID_LOGIN_FIELD);
    // Tests the handleInputChange with an empty input value:
    userEvent.type(loginInput, "a{backspace}");

    await waitFor(() => {
      expect(loginInput.value).toBe("");
    });

    // Finally for our test:
    userEvent.type(loginInput, "example.com");

    await waitFor(() => {
      expect(loginInput.value).toBe("example.com");
    });

    // Trigger submit using enter:
    userEvent.type(loginInput, "{enter}");

    await waitFor(() => {
      // If the users' input does not have a protocol, we append: https://
      expect(validateProviderIri).toHaveBeenCalledWith("https://example.com");
      expect(handleLogin).toHaveBeenCalledWith("https://example.com/");
    });
  });

  it("should not call the login function upon clicking the submit button if no provider is selected", async () => {
    const handleLogin = jest.fn();

    validateProviderIri.mockReturnValue({ error: "invalid_url" });

    const { asFragment, getByTestId } = renderWithTheme(
      <ProviderLogin handleLogin={handleLogin} />
    );

    const submitBtn = getByTestId(TESTCAFE_ID_GO_BUTTON);
    submitBtn.click();

    await waitFor(() => {
      expect(validateProviderIri).toHaveBeenCalledWith("");
      expect(handleLogin).not.toHaveBeenCalled();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a validation error if login fails", async () => {
    const handleLogin = jest.fn();
    validateProviderIri.mockReturnValue({ error: "network_error" });

    const { asFragment, getByTestId } = renderWithTheme(
      <ProviderLogin handleLogin={handleLogin} />
    );

    const loginInput = getByTestId(TESTCAFE_ID_LOGIN_FIELD);
    userEvent.type(loginInput, "not-a-provider.com{enter}");

    await waitFor(() => {
      // The typing in text area appends `https://` to the value if a protocol
      // is not found, hence we have the protocol here, but we did not type one:
      expect(validateProviderIri).toHaveBeenCalledWith(
        "https://not-a-provider.com"
      );
      expect(handleLogin).not.toHaveBeenCalled();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  describe("translateErrors", () => {
    it("handles invalid_url", () => {
      const actual = translateError("invalid_url");
      expect(actual).toMatchSnapshot();
    });

    it("handles bad_request", () => {
      const actual = translateError("bad_request");
      expect(actual).toMatchSnapshot();
    });

    it("handles network_error", () => {
      const actual = translateError("network_error");
      expect(actual).toMatchSnapshot();
    });

    it("handles unavailable", () => {
      const actual = translateError("unavailable");
      expect(actual).toMatchSnapshot();
    });

    it("handles null/undefined", () => {
      const actual = translateError(undefined);
      expect(actual).toBeNull();
    });
  });
});
