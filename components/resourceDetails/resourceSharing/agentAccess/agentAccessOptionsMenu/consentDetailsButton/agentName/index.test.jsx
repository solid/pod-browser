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

import { render, act } from "@testing-library/react";
import { getByText, waitFor } from "@testing-library/dom";
// import { getStringNoLocale } from "@inrupt/solid-client";
import * as solidClientFns from "@inrupt/solid-client";
import AgentName, { TESTCAFE_ID_AGENT_NAME_LINK } from ".";
import mockPermissionsContextProvider from "../../../../../../../__testUtils/mockPermissionsContextProvider";

describe("Renders the correct agent name", () => {
  const mockWebId = "https://mockperson.com/profile/card#me";
  const mockFOAFName = "FOAF NAME";
  const mockVCARDName = "VCARD NAME";
  const PermissionsContextProvider = mockPermissionsContextProvider();

  it.skip("returns a name if the profile has a foaf name", async () => {
    const mockProfile = {};
    jest.spyOn(solidClientFns, "getProfileAll").mockResolvedValue(mockProfile);
    jest
      .spyOn(solidClientFns, "getStringNoLocale")
      .mockResolvedValue(mockFOAFName);

    const AgentNameComponent = render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} link />
      </PermissionsContextProvider>
    );

    waitFor(() => expect(getByText(mockFOAFName)).toBeInTheDocument());
  });

  it.skip("returns a name if the profile has a vcard name", async () => {
    const mockProfile = {};
    jest.spyOn(solidClientFns, "getProfileAll").mockResolvedValue(mockProfile);
    jest.spyOn(solidClientFns, "getStringNoLocale").mockResolvedValueOnce(null);
    jest
      .spyOn(solidClientFns, "getStringNoLocale")
      .mockResolvedValue(mockVCARDName);

    const AgentNameComponent = render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} link />
      </PermissionsContextProvider>
    );

    waitFor(() => expect(getByText(mockVCARDName)).toBeInTheDocument());
  });

  it("renders a webId if no name is on the profile", async () => {
    const { getByText } = render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} link />
      </PermissionsContextProvider>
    );
    waitFor(() =>
      expect(getByText(TESTCAFE_ID_AGENT_NAME_LINK)).toBeInTheDocument()
    );
  });

  it("renders an agent name without a link if no link prop is passed", async () => {
    const { getByText } = render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} />
      </PermissionsContextProvider>
    );
    waitFor(() =>
      expect(getByText(TESTCAFE_ID_AGENT_NAME_LINK)).toNotBeInTheDocument()
    );
  });
});
