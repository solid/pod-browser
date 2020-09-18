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
import useAddressBook from "../../src/hooks/useAddressBook";
import usePeople from "../../src/hooks/usePeople";
import { mountToJson } from "../../__testUtils/mountWithTheme";
import ContactsList from "./index";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
} from "../../__testUtils/mockPersonResource";

jest.mock("../../src/hooks/useAddressBook");
jest.mock("../../src/hooks/usePeople");

describe("ContactsList", () => {
  it("renders spinner while useAddressBook is loading", () => {
    useAddressBook.mockReturnValue([null, null]);
    usePeople.mockReturnValue([null, null]);

    expect(mountToJson(<ContactsList />)).toMatchSnapshot();
    expect(useAddressBook).toHaveBeenCalledWith();
    expect(usePeople).toHaveBeenCalledWith(null);
  });

  it("renders spinner while usePeople is loading", () => {
    useAddressBook.mockReturnValue([42, null]);
    usePeople.mockReturnValue([null, null]);

    expect(mountToJson(<ContactsList />)).toMatchSnapshot();
    expect(usePeople).toHaveBeenCalledWith(42);
  });

  it("renders error if useAddressBook returns error", () => {
    useAddressBook.mockReturnValue([null, "error"]);
    usePeople.mockReturnValue([null, null]);

    expect(mountToJson(<ContactsList />)).toMatchSnapshot();
  });

  it("renders page when people is loaded", () => {
    useAddressBook.mockReturnValue([42, null]);
    usePeople.mockReturnValue([
      [mockPersonDatasetAlice(), mockPersonDatasetBob()],
      null,
    ]);

    expect(mountToJson(<ContactsList />)).toMatchSnapshot();
  });

  it("renders error if usePeople returns error", () => {
    useAddressBook.mockReturnValue([42, null]);
    usePeople.mockReturnValue([null, "error"]);

    expect(mountToJson(<ContactsList />)).toMatchSnapshot();
  });
});
