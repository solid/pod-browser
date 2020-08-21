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

import * as RouterFns from "next/router";
import { mountToJson } from "../../__testUtils/mountWithTheme";
import * as solidClientHooks from "../../src/hooks/solidClient";
import Container from "./index";

jest.mock("../../src/hooks/solidClient");

const iri = "https://mypod.myhost.com/public";

describe("Container view", () => {
  beforeEach(() =>
    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "asPath",
      replace: jest.fn(),
      query: {},
    })
  );

  test("Renders a spinner if data is loading", () => {
    solidClientHooks.useFetchContainerResourceIris.mockReturnValue({
      data: undefined,
    });

    const tree = mountToJson(<Container iri={iri} />);
    expect(tree).toMatchSnapshot();
  });

  test("Renders a table view without data", () => {
    solidClientHooks.useFetchContainerResourceIris.mockReturnValue({
      data: [],
    });

    const tree = mountToJson(<Container iri={iri} />);
    expect(tree).toMatchSnapshot();
  });

  test("Renders a table with data", () => {
    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    solidClientHooks.useFetchContainerResourceIris.mockReturnValue({
      data: resources,
    });

    solidClientHooks.useFetchResourceDetails.mockReturnValue({
      data: undefined,
    });

    const tree = mountToJson(<Container iri={iri} />);
    expect(tree).toMatchSnapshot();
  });
});
