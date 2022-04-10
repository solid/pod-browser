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

import { render } from "@testing-library/react";
import { waitFor } from "@testing-library/dom";
import AgentName, { TESTCAFE_ID_AGENT_NAME_LINK } from ".";
import mockPermissionsContextProvider from "../../../../../../../__testUtils/mockPermissionsContextProvider";

describe("Renders the correct agent name", () => {
  const mockWebId = "https://mockperson.com/profile/card#me";

  const PermissionsContextProvider = mockPermissionsContextProvider();

  it("renders a webId if no name is on the profile", () => {
    const { getByTestId, asFragment } = render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} link />
      </PermissionsContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId(TESTCAFE_ID_AGENT_NAME_LINK)).toBeInTheDocument();
  });

  it("renders an agent name without a link if no link prop is passed", () => {
    const { asFragment } = render(
      <PermissionsContextProvider>
        <AgentName agentWebId={mockWebId} />
      </PermissionsContextProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
