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
import Router from "next/router";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import { SearchProvider } from "../../../src/contexts/searchContext";
import ContactsListSearch, {
  setupFilterOptions,
  setupGetOptionLabel,
  setupOnChange,
  TESTCAFE_ID_CONTACTS_SEARCH,
} from "./index";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
} from "../../../__testUtils/mockPersonResource";
import { buildProfileLink } from "../../profileLink";

jest.mock("next/router");

describe("ContactsListSearch", () => {
  it("renders form if people are still loading", () => {
    const { asFragment } = renderWithTheme(
      <SearchProvider>
        <ContactsListSearch />
      </SearchProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("render profiles when people are loaded", () => {
    const { asFragment } = renderWithTheme(
      <SearchProvider>
        <ContactsListSearch
          people={[mockPersonDatasetAlice(), mockPersonDatasetBob()]}
        />
      </SearchProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("triggers setSearch when changing content in input field", () => {
    const setSearch = jest.fn();
    const { getByTestId } = renderWithTheme(
      <SearchProvider setSearch={setSearch}>
        <ContactsListSearch />
      </SearchProvider>
    );
    userEvent.type(getByTestId(TESTCAFE_ID_CONTACTS_SEARCH), "test{enter}");
    expect(setSearch).toHaveBeenCalledWith("test");
  });
});

describe("setupOnChange", () => {
  const webId = "http://example.com/#webId";

  let setSearch;
  let onChange;

  beforeEach(() => {
    setSearch = jest.fn();
    onChange = setupOnChange(setSearch);
  });

  it("triggers setSearch if search is a string", () => {
    onChange({}, "foo");
    expect(setSearch).toHaveBeenCalledWith("foo");
  });

  it("triggers Router.push if search is an object with a webId", () => {
    onChange({}, { webId });
    expect(Router.push).toHaveBeenCalledWith(buildProfileLink(webId));
  });
});

describe("setupFilterOptions", () => {
  it("calls a filter", () => {
    const filterOptions = setupFilterOptions();
    const filter = jest.fn().mockReturnValue(42);
    expect(filterOptions({ filter }, { inputValue: "fo" })).toBe(42);
    expect(filter).toHaveBeenCalled();
    expect(filter.mock.calls[0][0]({ name: "foo" })).toBe(true);
    expect(filter.mock.calls[0][0]({ name: "bar" })).toBe(false);
  });
});

describe("setupGetOptionLabel", () => {
  it("calls a function", () => {
    const getOptionLabel = setupGetOptionLabel();
    expect(getOptionLabel()).toEqual("");
    expect(getOptionLabel("test")).toEqual("test");
    expect(getOptionLabel({ name: "Alice" })).toEqual("Alice");
  });
});
