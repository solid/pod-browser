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
import { waitFor } from "@testing-library/dom";
import { useSession, useThing } from "@inrupt/solid-ui-react";
import { addUrl, createThing } from "@inrupt/solid-client";
import AddAgentRow, {
  EXISTING_WEBID_ERROR_MESSAGE,
  OWN_WEBID_ERROR_MESSAGE,
  TESTCAFE_ID_ADD_WEBID_BUTTON,
  TESTCAFE_ID_WEBID_INPUT,
} from "./index";
import { renderWithTheme } from "../../../../__testUtils/withTheme";
import mockPermissionsContextProvider from "../../../../__testUtils/mockPermissionsContextProvider";
import useContactProfile from "../../../../src/hooks/useContactProfile";
import { vcardExtras } from "../../../../src/addressBook";

jest.mock("@inrupt/solid-ui-react");
const mockedThingHook = useThing;

jest.mock("../../../../src/hooks/useContactProfile");
const mockedUseContactProfile = useContactProfile;
const permissions = [{ webId: "https://example.org/profile/card#me" }];
const setNewAgentsWebIds = jest.fn();
const PermissionsContextProvider = mockPermissionsContextProvider({
  permissions,
  addingWebId: true,
  setNewAgentsWebIds,
});

describe("AddAgentRow", () => {
  describe("when adding a new webId", () => {
    const mockThing = createThing();
    beforeEach(() => {
      mockedThingHook.mockReturnValue({ thing: mockThing });
      useSession.mockReturnValue({
        fetch: jest.fn(),
        session: { info: { webId: "https://podownerwebid.com/" } },
      });
      mockedUseContactProfile.mockReturnValue({ data: null });
    });
    const index = 0;
    const setNoAgentsAlert = jest.fn();
    const updateTemporaryRowThing = jest.fn();
    const contactsArrayLength = 0;
    it("renders a row with an input for the first item in the array", () => {
      const EmptyPermissionsContextProvider = mockPermissionsContextProvider({
        permissions: [],
        addingWebId: true,
      });
      const { asFragment } = renderWithTheme(
        <EmptyPermissionsContextProvider>
          <AddAgentRow
            contactsArrayLength={contactsArrayLength}
            type="editors"
            index={index}
            setNoAgentsAlert={setNoAgentsAlert}
            updateTemporaryRowThing={updateTemporaryRowThing}
          />
        </EmptyPermissionsContextProvider>
      );
      expect(asFragment()).toMatchSnapshot();
    });
    it("renders a validation error if added webId is already in permissions", () => {
      const { getByTestId, getByText } = renderWithTheme(
        <PermissionsContextProvider>
          <AddAgentRow
            contactsArrayLength={contactsArrayLength}
            type="editors"
            index={index}
            setNoAgentsAlert={setNoAgentsAlert}
            updateTemporaryRowThing={updateTemporaryRowThing}
          />
        </PermissionsContextProvider>
      );
      const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
      const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
      userEvent.type(input, "https://example1.org/profile/card#me");
      userEvent.click(addButton);
      waitFor(() => {
        const errorText = getByText(EXISTING_WEBID_ERROR_MESSAGE);
        expect(errorText).not.toBeNull();
      });
    });
    it("renders a validation error if added webId is own webId", () => {
      const { getByTestId, getByText } = renderWithTheme(
        <PermissionsContextProvider>
          <AddAgentRow
            contactsArrayLength={contactsArrayLength}
            type="editors"
            index={index}
            setNoAgentsAlert={setNoAgentsAlert}
            updateTemporaryRowThing={updateTemporaryRowThing}
          />
        </PermissionsContextProvider>
      );
      const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
      const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
      userEvent.type(input, "https://podownerwebid.com/");
      userEvent.click(addButton);
      const errorText = getByText(OWN_WEBID_ERROR_MESSAGE);
      expect(errorText).not.toBeNull();
    });
    it("clears error when changing input again", () => {
      const { getByTestId, queryByText } = renderWithTheme(
        <PermissionsContextProvider>
          <AddAgentRow
            contactsArrayLength={contactsArrayLength}
            type="editors"
            index={index}
            setNoAgentsAlert={setNoAgentsAlert}
            updateTemporaryRowThing={updateTemporaryRowThing}
            permissions={permissions}
          />
        </PermissionsContextProvider>
      );
      const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
      userEvent.type(input, "");
      const errorText = queryByText("That WebID has already been added");
      expect(errorText).toBeNull();
    });
    it("adds webId to webIds array on submit", () => {
      const { getByTestId } = renderWithTheme(
        <PermissionsContextProvider>
          <AddAgentRow
            contactsArrayLength={contactsArrayLength}
            type="editors"
            index={index}
            setNoAgentsAlert={setNoAgentsAlert}
            updateTemporaryRowThing={updateTemporaryRowThing}
            permissions={permissions}
          />
        </PermissionsContextProvider>
      );
      const input = getByTestId(TESTCAFE_ID_WEBID_INPUT);
      userEvent.type(input, "https://somewebid.com/");
      const addButton = getByTestId(TESTCAFE_ID_ADD_WEBID_BUTTON);
      userEvent.click(addButton);
      expect(setNewAgentsWebIds).toHaveBeenCalledWith([
        "https://somewebid.com/",
      ]);
    });
  });
  describe("with existing contacts", () => {
    const index = 0;
    const setNoAgentsAlert = jest.fn();
    const updateTemporaryRowThing = jest.fn();
    const contactsArrayLength = 1;

    beforeEach(() => {
      useSession.mockReturnValue({ fetch: jest.fn() });
    });

    it("renders a row with the agent's name if profile is available", () => {
      const mockThing = createThing();
      mockedThingHook.mockReturnValue({ thing: mockThing });
      mockedUseContactProfile.mockReturnValue({
        data: { webId: "https://somewebid.org", name: "Example", avatar: null },
      });
      const EmptyPermissionsContextProvider = mockPermissionsContextProvider({
        permissions: [],
        addingWebId: false,
      });
      const { asFragment, getByTestId, queryByText } = renderWithTheme(
        <EmptyPermissionsContextProvider>
          <AddAgentRow
            contactsArrayLength={contactsArrayLength}
            type="editors"
            index={index}
            setNoAgentsAlert={setNoAgentsAlert}
            updateTemporaryRowThing={updateTemporaryRowThing}
          />
        </EmptyPermissionsContextProvider>
      );
      expect(asFragment()).toMatchSnapshot();
      expect(queryByText("Example")).toBeDefined();
      expect(getByTestId("agent-webid")).toBeDefined();
    });
    it("for newly added webids, if profile is unavailable it renders a row with the provided webId", () => {
      const mockThing = addUrl(
        createThing(),
        vcardExtras("WebId"),
        "https://somewebid.com"
      );
      mockedThingHook.mockReturnValue({ thing: mockThing });
      mockedUseContactProfile.mockReturnValue({
        data: null,
      });
      const EmptyPermissionsContextProvider = mockPermissionsContextProvider({
        permissions: [],
        addingWebId: false,
      });
      const { asFragment, getByTestId, queryByText } = renderWithTheme(
        <EmptyPermissionsContextProvider>
          <AddAgentRow
            contactsArrayLength={contactsArrayLength}
            type="editors"
            index={1}
            setNewAgentsWebIds={setNewAgentsWebIds}
            setNoAgentsAlert={setNoAgentsAlert}
            updateTemporaryRowThing={updateTemporaryRowThing}
          />
        </EmptyPermissionsContextProvider>
      );
      expect(asFragment()).toMatchSnapshot();
      expect(queryByText("https://somewebid.com")).toBeDefined();
      expect(getByTestId("agent-webid")).toBeDefined();
    });
  });
});
