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

import React, { useContext } from "react";
import { render } from "@testing-library/react";
import PodLocationContext, { PodLocationProvider } from "./index";
import usePodRootUri from "../../hooks/usePodRootUri";
import useAuthenticatedProfile from "../../hooks/useAuthenticatedProfile";
import { mockProfileAlice } from "../../../__testUtils/mockPersonResource";

jest.mock("../../hooks/useAuthenticatedProfile");
jest.mock("../../hooks/usePodRootUri");

function ChildComponent() {
  const { baseUri, currentUri } = useContext(PodLocationContext);
  return (
    <>
      <div id="BaseUri">{baseUri}</div>
      <div id="CurrentUri">{currentUri}</div>
    </>
  );
}

describe("PodLocationContext", () => {
  test("it provides baseUri based on storages given in profile", () => {
    const baseUri = "https://foo.test/";

    useAuthenticatedProfile.mockReturnValue({
      data: mockProfileAlice(),
    });
    usePodRootUri.mockReturnValue(baseUri);

    const currentUri = "https://foo.test/bar/baz";
    const { container } = render(
      <PodLocationProvider currentUri={currentUri}>
        <ChildComponent />
      </PodLocationProvider>
    );

    expect(container.querySelector("#BaseUri").innerHTML).toEqual(baseUri);
    expect(container.querySelector("#CurrentUri").innerHTML).toEqual(
      currentUri
    );
  });
});
