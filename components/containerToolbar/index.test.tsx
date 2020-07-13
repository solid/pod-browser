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
import * as ReactFns from "react";
import ContainerToolbar, { openContextMenu } from "./index";
import { mountToJson } from "../../__testUtils/mountWithTheme";

describe("Container toolbar view", () => {
  test("Renders the toolbar", () => {
    const currentUri = "iri";

    jest.spyOn(RouterFns, "useRouter").mockReturnValueOnce({
      asPath: "asPath",
      pathname: "/pathname?action=details&iri=iri",
      replace: jest.fn(),
    });

    jest.spyOn(ReactFns, "useContext").mockReturnValueOnce({ currentUri });

    const tree = mountToJson(<ContainerToolbar />);
    expect(tree).toMatchSnapshot();
  });
});

describe("openContextMenu", () => {
  test("it returns a function that routes to the context menu", async () => {
    const iri = "iri";
    const replace = jest.fn();
    const pathname = `/pathname?action=details&iri=${iri}`;
    const router = { replace };

    jest.spyOn(RouterFns, "useRouter").mockReturnValueOnce(router);

    const handler = openContextMenu(iri, router, pathname);

    await handler();

    expect(replace).toHaveBeenCalledWith({
      pathname,
      query: { action: "details", iri },
    });
  });
});
