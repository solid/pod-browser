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
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import useContactProfile from "../../../../../src/hooks/useContactProfile";
import WebIdCheckbox, { TESTCAFE_ID_WEBID_CHECKBOX } from "./index";

jest.mock("../../../../../src/hooks/useContactProfile");
const mockedUseContactProfile = useContactProfile;

const webId = "https://somewebid.com";

describe("WebIdCheckbox", () => {
  const value = webId;
  const index = 1;
  const addingWebId = false;
  const toggleCheckbox = jest.fn();
  const newAgentsWebIds = [];
  const permissions = [];
  const webIdsToDelete = [];

  beforeEach(() => {
    mockedUseContactProfile.mockReturnValue({
      data: { webId },
    });
  });

  test("renders a checkbox with the correct value", () => {
    mockedUseContactProfile.mockReturnValue({
      data: { webId: "https://somewebid.com" },
    });

    const { asFragment, getByTestId } = renderWithTheme(
      <WebIdCheckbox
        value={value}
        index={index}
        addingWebId={addingWebId}
        toggleCheckbox={toggleCheckbox}
        newAgentsWebIds={newAgentsWebIds}
        permissions={permissions}
        webIdsToDelete={webIdsToDelete}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    const checkbox = getByTestId(TESTCAFE_ID_WEBID_CHECKBOX);
    expect(checkbox).toBeDefined();
    expect(checkbox).toHaveAttribute("value", webId);
  });
  test("checkbox has the correct value if profile is available", () => {
    mockedUseContactProfile.mockReturnValue({
      data: { webId: "https://example.org" },
    });
    const { getByTestId } = renderWithTheme(
      <WebIdCheckbox
        value={null}
        index={index}
        addingWebId={addingWebId}
        toggleCheckbox={toggleCheckbox}
        newAgentsWebIds={newAgentsWebIds}
        permissions={permissions}
        webIdsToDelete={webIdsToDelete}
      />
    );
    const checkbox = getByTestId(TESTCAFE_ID_WEBID_CHECKBOX);
    expect(checkbox).toBeDefined();
    expect(checkbox).toHaveAttribute("value", "https://example.org");
  });
  test("checkbox has a null value if value is unavailable and it's the first row", () => {
    mockedUseContactProfile.mockReturnValue({
      data: null,
    });
    const { getByTestId } = renderWithTheme(
      <WebIdCheckbox
        value={null}
        index={0}
        addingWebId={addingWebId}
        toggleCheckbox={toggleCheckbox}
        newAgentsWebIds={newAgentsWebIds}
        permissions={permissions}
        webIdsToDelete={webIdsToDelete}
      />
    );
    const checkbox = getByTestId(TESTCAFE_ID_WEBID_CHECKBOX);
    expect(checkbox).toBeDefined();
    expect(checkbox).toHaveAttribute("value", "");
  });
  test("checkbox is checked if agent is already in permissions", () => {
    const { getByTestId } = renderWithTheme(
      <WebIdCheckbox
        value={null}
        index={0}
        addingWebId={addingWebId}
        toggleCheckbox={toggleCheckbox}
        newAgentsWebIds={newAgentsWebIds}
        permissions={[{ webId }]}
        webIdsToDelete={webIdsToDelete}
      />
    );
    const checkbox = getByTestId(TESTCAFE_ID_WEBID_CHECKBOX);
    expect(checkbox).toBeDefined();
    expect(checkbox).toBeChecked();
  });
  test("calls toggleCheckbox on click with the correct values", () => {
    const { getByTestId } = renderWithTheme(
      <WebIdCheckbox
        value={null}
        index={index}
        addingWebId={addingWebId}
        toggleCheckbox={toggleCheckbox}
        newAgentsWebIds={newAgentsWebIds}
        permissions={[{ webId }]}
        webIdsToDelete={webIdsToDelete}
      />
    );
    const checkbox = getByTestId(TESTCAFE_ID_WEBID_CHECKBOX);
    userEvent.click(checkbox);
    expect(toggleCheckbox).toHaveBeenCalledWith(
      expect.any(Object),
      index,
      webId
    );
  });
  it("disables checkbox if permission came from inherited policy", () => {
    const { getByTestId } = renderWithTheme(
      <WebIdCheckbox
        value={null}
        index={index}
        addingWebId={addingWebId}
        toggleCheckbox={toggleCheckbox}
        newAgentsWebIds={newAgentsWebIds}
        permissions={[{ webId, inherited: true }]}
        webIdsToDelete={webIdsToDelete}
      />
    );
    const checkbox = getByTestId(TESTCAFE_ID_WEBID_CHECKBOX);
    userEvent.click(checkbox);
    expect(toggleCheckbox).not.toHaveBeenCalled();
  });
});
