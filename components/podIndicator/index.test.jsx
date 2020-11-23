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
import { renderWithTheme } from "../../__testUtils/withTheme";
import PodIndicator, { clickHandler, closeHandler } from "./index";
import {
  mockPersonDatasetAlice,
  mockPersonDatasetBob,
  aliceWebIdUrl,
  bobWebIdUrl,
} from "../../__testUtils/mockPersonResource";
import usePodOwnerProfile from "../../src/hooks/usePodOwnerProfile";
import { packageProfile } from "../../src/solidClientHelpers/profile";

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

  test("it renders the pod indicator with the correct name with a formatted name", async () => {
    const userProfile = mockPersonDatasetAlice();
    usePodOwnerProfile.mockReturnValue({
      profile: packageProfile(aliceWebIdUrl, userProfile),
      error: null,
    });
    const { asFragment, queryByText } = renderWithTheme(<PodIndicator />);
    expect(queryByText("Alice")).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  test("it renders the pod indicator with the correct name with a name", async () => {
    const userProfile = mockPersonDatasetBob();
    usePodOwnerProfile.mockReturnValue({
      profile: packageProfile(bobWebIdUrl, userProfile),
      error: null,
    });
    const { asFragment, queryByText } = renderWithTheme(<PodIndicator />);
    expect(queryByText("Bob")).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });

  test("it returns null if there is no profile", async () => {
    usePodOwnerProfile.mockReturnValue({
      profile: null,
      error: null,
    });
    const { asFragment } = renderWithTheme(<PodIndicator />);
    expect(asFragment).toMatchSnapshot();
  });
});

describe("clickHandler", () => {
  test("it sets up a click handler", () => {
    const setAnchorEl = jest.fn();
    const currentTarget = "test";
    clickHandler(setAnchorEl)({ currentTarget });
    expect(setAnchorEl).toHaveBeenCalledWith(currentTarget);
  });
});

describe("closeHandler", () => {
  test("it sets up a close handler", () => {
    const setAnchorEl = jest.fn();
    closeHandler(setAnchorEl)();
    expect(setAnchorEl).toHaveBeenCalledWith(null);
  });
});
