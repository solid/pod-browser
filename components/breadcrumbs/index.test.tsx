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

import * as ReactUtils from "react";
import { mountToJson } from "../../__testUtils/mountWithTheme";
import { PodLocationProvider } from "../../src/contexts/podLocationContext";
import Breadcrumbs from "./index";

describe("Breadcrumbs view", () => {
  test("Renders a breadcrumbs view", () => {
    jest.spyOn(ReactUtils, "useLayoutEffect").mockImplementation(() => {});

    const tree = mountToJson(
      <PodLocationProvider currentUri="https://www.mypodmanager.com">
        <Breadcrumbs />
      </PodLocationProvider>
    );
    expect(tree).toMatchSnapshot();
  });

  test("Renders a breadcrumbs view with breadcrumbs based on url slashes", () => {
    jest.spyOn(ReactUtils, "useLayoutEffect").mockImplementation(() => {});

    const tree = mountToJson(
      <PodLocationProvider currentUri="https://www.mypodmanager.com/some/location">
        <Breadcrumbs />
      </PodLocationProvider>
    );
    expect(tree).toMatchSnapshot();
  });
});
