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

import { mount } from "enzyme";
import { mountToJson, WithTheme } from "../../__testUtils/mountWithTheme";
import defaultTheme from "../../src/theme";
import { PodLocationProvider } from "../../src/contexts/podLocationContext";
import Breadcrumbs from "./index";

describe("Breadcrumbs view", () => {
  test("Renders a breadcrumbs view", () => {
    const tree = mountToJson(
      <PodLocationProvider currentUri="https://www.mypodbrowser.com">
        <Breadcrumbs />
      </PodLocationProvider>
    );
    expect(tree).toMatchSnapshot();
  });

  test("Renders a breadcrumbs view with breadcrumbs based on url slashes", () => {
    const tree = mountToJson(
      <PodLocationProvider currentUri="https://www.mypodbrowser.com/some/location">
        <Breadcrumbs />
      </PodLocationProvider>
    );
    expect(tree).toMatchSnapshot();
  });

  test("Renders last breadcrumb as plain text", () => {
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <PodLocationProvider currentUri="https://www.mypodbrowser.com/some/location">
          <Breadcrumbs />
        </PodLocationProvider>
      </WithTheme>
    );
    expect(tree.html()).toContain(
      'href="/resource/https%3A%2F%2Fwww.mypodbrowser.com%2Fsome'
    );
    expect(tree.html()).not.toContain(
      'href="/resource/https%3A%2F%2Fwww.mypodbrowser.com%2Fsome%2Flocation'
    );
  });

  test("Displays current folder as crumb in breadcrumbs", () => {
    const tree = mount(
      <WithTheme theme={defaultTheme}>
        <PodLocationProvider currentUri="https://www.mypodbrowser.com/some/location">
          <Breadcrumbs />
        </PodLocationProvider>
      </WithTheme>
    );
    expect(tree.html()).toContain("location");
  });
});
