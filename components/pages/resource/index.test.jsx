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
import { render, waitFor } from "@testing-library/react";
import { foaf } from "rdf-namespaces";
import IndexPage from "./index";
import TestApp from "../../../__testUtils/testApp";
import useAccessControl from "../../../src/hooks/useAccessControl";
import useAuthenticatedProfile from "../../../src/hooks/useAuthenticatedProfile";
import useResourceInfo from "../../../src/hooks/useResourceInfo";
import { aliceWebIdUrl } from "../../../__testUtils/mockPersonResource";
import { TESTCAFE_ID_NO_POD_MESSAGE } from "../../noPodFoundError";

jest.mock("../../../src/hooks/useAccessControl");
jest.mock("../../../src/hooks/useResourceInfo");
jest.mock("../../../src/hooks/useAuthenticatedProfile");
jest.mock("next/router");

const mockProfileAlice = {
  names: ["Alice", "Alternative Alice"],
  webId: aliceWebIdUrl,
  types: [foaf.Person],
  pods: ["https://mypod.myhost.com/"],
};

const mockProfileAliceWithoutPod = {
  names: ["Alice", "Alternative Alice"],
  webId: aliceWebIdUrl,
  types: [foaf.Person],
  pods: [],
};

describe("Resource page", () => {
  const podRootIri = "https://mypod.myhost.com/";
  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      query: {
        iri: podRootIri,
      },
    }));
    useAccessControl.mockReturnValue({
      data: null,
      error: null,
      isValidating: false,
    });
    useResourceInfo.mockReturnValue("resourceInfo");
  });

  it("Renders the resource page", async () => {
    useAuthenticatedProfile.mockReturnValueOnce(mockProfileAlice);
    const { asFragment, getByText } = render(
      <TestApp>
        <IndexPage />
      </TestApp>
    );
    await waitFor(() => {
      expect(getByText("Resource Not Supported")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("Renders spinner while validating access control", async () => {
    useAuthenticatedProfile.mockReturnValueOnce(mockProfileAlice);
    useAccessControl.mockReturnValueOnce({
      data: null,
      error: null,
      isValidating: true,
    });

    const { asFragment, getByTestId } = render(
      <TestApp>
        <IndexPage />
      </TestApp>
    );
    await waitFor(() => {
      expect(getByTestId("spinner")).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("Renders an error if it cannot find a URL for a Pod", async () => {
    useAuthenticatedProfile.mockReturnValue(mockProfileAliceWithoutPod);
    useAccessControl.mockReturnValueOnce({
      data: null,
      error: null,
      isValidating: false,
    });

    const { asFragment, getByTestId } = render(
      <TestApp>
        <IndexPage />
      </TestApp>
    );
    await waitFor(() => {
      expect(getByTestId(TESTCAFE_ID_NO_POD_MESSAGE)).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });
});
