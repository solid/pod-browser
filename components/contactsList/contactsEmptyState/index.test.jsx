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
import { screen } from "@testing-library/react";
import ContactsEmptyState from ".";
import { renderWithTheme } from "../../../__testUtils/withTheme";

describe("ContactsEmptyState", () => {
  it("renders an empty state component", () => {
    const { asFragment } = renderWithTheme(<ContactsEmptyState />);
    expect(asFragment()).toMatchSnapshot();
  });
  it("renders an empty state message", () => {
    renderWithTheme(<ContactsEmptyState />);
    const message = screen.getByText("You don’t have any contacts yet!");
    expect(message).toBeTruthy();
  });
  it("renders an 'add new contact' button", () => {
    renderWithTheme(<ContactsEmptyState />);
    const button = screen.getByTestId("add-new-contact-button");
    expect(button).toBeTruthy();
  });
});
