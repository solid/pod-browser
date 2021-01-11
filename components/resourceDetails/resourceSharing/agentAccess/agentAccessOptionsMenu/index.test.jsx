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
import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import AgentAccessOptionsMenu from "./index";

const toggleShare = jest.fn();
const removePermissions = jest.fn();
const resourceIri = "/iri/";
const webId = "https://example.com/profile/card#me";

describe("AgentAccessOptionsMenu", () => {
  test("it renders a button which triggers the opening of the menu", () => {
    const { asFragment, getByTestId, queryByText } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        removePermissions={removePermissions}
        toggleShare={toggleShare}
        webId={webId}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(queryByText("WebId:")).toBeNull();
    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);
    expect(queryByText("WebId:")).toBeDefined();
    expect(queryByText("Can Share")).toBeDefined();
    const canShareToggle = getByTestId("can-share-toggle");
    const removeButton = getByTestId("remove-button");
    expect(canShareToggle).toBeDefined();
    expect(removeButton).toBeDefined();
  });
  test("it renders a 'can share' toggle which updates an agent's control access", () => {
    const { getByTestId, getByRole } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        removePermissions={removePermissions}
        toggleShare={toggleShare}
        webId={webId}
      />
    );
    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);
    const canShareToggle = getByRole("checkbox");
    userEvent.click(canShareToggle);
    fireEvent.change(canShareToggle, { target: { checked: true } });
    expect(toggleShare).toHaveBeenCalled();
    expect(canShareToggle).toHaveProperty("checked", true);
  });
  test("it renders a remove button which sets an agent's control accesses to false", () => {
    const { getByTestId } = renderWithTheme(
      <AgentAccessOptionsMenu
        resourceIri={resourceIri}
        removePermissions={removePermissions}
        toggleShare={toggleShare}
        webId={webId}
      />
    );
    const menuButton = getByTestId("menu-button");
    userEvent.click(menuButton);
    const removeButton = getByTestId("remove-button");
    userEvent.click(removeButton);
    expect(removePermissions).toHaveBeenCalled();
  });
});
