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

import { ThingProvider } from "@inrupt/solid-ui-react";
import { render } from "@testing-library/react";
import { getByText, waitFor } from "@testing-library/dom";
import AgentName from ".";
import mockPermissionsContextProvider from "../../../../../../../__testUtils/mockPermissionsContextProvider";
import mockPersonContactThing from "../../../../../../../__testUtils/mockPersonContactThing";

const webId = "https://example.com/profile/card#me";
const testResourceIri = "testIri";

describe("Renders the correct agent name", () => {
  const mockWebId = "https://mockperson.com/profile/card#me";
  const mockFOAFName = "FOAF NAME";
  const PermissionsContextProvider = mockPermissionsContextProvider();

  it("if foaf, returns name", async () => {
    const mockAgent = mockPersonContactThing("", mockWebId, mockFOAFName);
    // spy on profile function and have it return a mockProfile
    // and have it setAgentProfile
    // put it in an act because it's changing state
    // spy on getStringNoLocale for each foaf test and vcard test

    const { asFragment } = render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} link />
      </PermissionsContextProvider>
    );

    await expect(asFragment()).toHaveTextContent(mockFOAFName);
  });

  it.skip("if vcard, returns name", async () => {
    const mockVcardName = "VCARD NAME";
    const mockAgent = mockPersonContactThing("", mockWebId, mockVcardName);
    const { asFragment } = render(<AgentName agentWebId={mockWebId} />);
    await expect(asFragment).toHaveTextContent(mockVcardName);
  });

  it("if no name available, returns webId", async () => {
    render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} link />
      </PermissionsContextProvider>
    );
    waitFor(() => expect(getByText(mockWebId)).toBeInTheDocument());
  });
});
