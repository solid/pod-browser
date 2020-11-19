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
import { useRouter } from "next/router";
import { screen, render } from "@testing-library/react";
import { useSession } from "@inrupt/solid-ui-react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ContainerPageHeader from "./index";

jest.mock("@inrupt/solid-ui-react");
jest.mock("next/router");

describe("ContainerPageHeader", () => {
  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      query: {
        iri: "https://mypod.myhost.com",
      },
    }));
  });
  test("Renders view", () => {
    useSession.mockReturnValue({ session: { info: { isLoggedIn: true } } });
    const { asFragment } = renderWithTheme(<ContainerPageHeader />);
    expect(asFragment()).toMatchSnapshot();
  });
  test("renders title only when logged out", () => {
    useSession.mockReturnValue({ session: { info: { isLoggedIn: false } } });
    renderWithTheme(<ContainerPageHeader />);
    const title = screen.getByText("Files");
    const podIndicator = screen.queryByText("Pod:");
    expect(title).toBeTruthy();
    expect(podIndicator).toBeNull();
  });
  test("renders pod indicator when logged in", () => {
    useSession.mockReturnValue({ session: { info: { isLoggedIn: true } } });
    renderWithTheme(<ContainerPageHeader />);
    const title = screen.getByText("Files");
    const podIndicator = screen.getByTestId("pod-indicator");
    expect(title).toBeTruthy();
    expect(podIndicator).toBeTruthy();
  });
});
