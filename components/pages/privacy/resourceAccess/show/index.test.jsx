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
import { schema } from "rdf-namespaces";
import { useRouter } from "next/router";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import AgentResourceAccessShowPage, { TESTCAFE_ID_TAB_PROFILE } from "./index";

jest.mock("next/router");

const mockedUseRouter = useRouter;
const agentWebId = "https://example.com/profile/card#me";

describe("Resource access show page", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: {
        webId: agentWebId,
      },
    });
  });
  test("it renders a resource access page for a person", () => {
    const { asFragment } = renderWithTheme(
      <AgentResourceAccessShowPage type={schema.Person} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  test("it renders a resource access page for an app", () => {
    const { asFragment } = renderWithTheme(
      <AgentResourceAccessShowPage type={schema.SoftwareApplication} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  test("renders profile when clicking on profile tab", () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AgentResourceAccessShowPage type={schema.SoftwareApplication} />
    );
    const tab = getByTestId(TESTCAFE_ID_TAB_PROFILE);
    userEvent.click(tab);
    expect(getByText("Mock App")).toBeInTheDocument();
  });
});
