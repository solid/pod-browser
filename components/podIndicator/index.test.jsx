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

import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import PodIndicator, {
  clickHandler,
  closeHandler,
  TESTCAFE_ID_POD_NAVIGATE_TRIGGER,
  TESTCAFE_ID_POD_INDICATOR_COPY,
  TESTCAFE_POD_INDICATOR_TOOLTIP,
} from "./index";
import usePodOwnerProfile from "../../src/hooks/usePodOwnerProfile";
import TestApp from "../../__testUtils/testApp";

jest.mock("next/router");
jest.mock("../../src/hooks/usePodOwnerProfile");

describe("PodIndicator", () => {
  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      query: {
        iri: encodeURIComponent("https://mypod.myhost.com"),
      },
    }));
  });

  it("renders the pod indicator with the pod iri", async () => {
    const { asFragment, queryByText } = renderWithTheme(<PodIndicator />);
    expect(queryByText("https://mypod.myhost.com")).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  it("returns null if there is no profile", () => {
    usePodOwnerProfile.mockReturnValue({
      profile: null,
      error: null,
    });
    const { asFragment } = renderWithTheme(<PodIndicator />);
    expect(asFragment).toMatchSnapshot();
  });

  it("copies text to the clipboard when the copy button is clicked", async () => {
    const writeText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const { getByTestId } = renderWithTheme(
      <TestApp>
        <PodIndicator />
      </TestApp>
    );
    const podMenu = getByTestId(TESTCAFE_ID_POD_NAVIGATE_TRIGGER);
    userEvent.click(podMenu);
    const copyLink = screen.getByTestId(TESTCAFE_ID_POD_INDICATOR_COPY);
    userEvent.click(copyLink);
    await waitFor(() => {
      expect(podMenu).toBeInTheDocument();
      expect(copyLink).toBeInTheDocument();
      expect(writeText).toHaveBeenCalled();
    });
  });
});

describe("clickHandler", () => {
  it("sets up a click handler", () => {
    const setAnchorEl = jest.fn();
    const currentTarget = "test";
    clickHandler(setAnchorEl)({ currentTarget });
    expect(setAnchorEl).toHaveBeenCalledWith(currentTarget);
  });
});

describe("closeHandler", () => {
  it("sets up a close handler", () => {
    const setAnchorEl = jest.fn();
    closeHandler(setAnchorEl)();
    expect(setAnchorEl).toHaveBeenCalledWith(null);
  });
});
