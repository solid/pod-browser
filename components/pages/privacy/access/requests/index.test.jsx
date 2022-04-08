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
import * as RouterFns from "next/router";
import { waitFor } from "@testing-library/dom";
import { mockContainerFrom } from "@inrupt/solid-client";
import * as resourceHelpers from "../../../../../src/solidClientHelpers/resource";
import { renderWithTheme } from "../../../../../__testUtils/withTheme";
import mockSessionContextProvider from "../../../../../__testUtils/mockSessionContextProvider";
import ConsentPage from "./index";
import getConsentRequestDetails from "../../../../../__testUtils/mockConsentRequestDetails";
import { mockAppDataset } from "../../../../../__testUtils/mockApp";
import useContainer from "../../../../../src/hooks/useContainer";
import * as containerFns from "../../../../../src/models/container";

jest.mock("../../../../../src/hooks/useContainer");
const mockedUseContainer = useContainer;

describe("Consent Page", () => {
  beforeEach(() => {
    mockedUseContainer.mockReturnValue({
      data: mockContainerFrom("https://pod.inrupt.com/alice/private/data/"),
    });
    jest
      .spyOn(containerFns, "getContainerResourceUrlAll")
      .mockResolvedValue([
        "https://pod.inrupt.com/alice/private/data-2",
        "https://pod.inrupt.com/alice/private/data-3",
      ]);
  });
  it("Renders the Consent page", async () => {
    const consentRequestId = "https://example.org/test-request";
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {
        id: consentRequestId,
        requestVc: btoa(JSON.stringify(getConsentRequestDetails())),
      },
    });

    const fetch = jest.fn();
    const session = {
      fetch,
      info: { webId: "https://id.inrupt.com/someWebId" },
    };
    const SessionProvider = mockSessionContextProvider(session);

    jest.spyOn(resourceHelpers, "getProfileResource").mockResolvedValue({
      dataset: mockAppDataset(),
    });

    const { asFragment, getByText } = renderWithTheme(
      <SessionProvider>
        <ConsentPage />
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getByText("Mock App")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
