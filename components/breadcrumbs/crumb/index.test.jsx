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
import { WithTheme } from "../../../__testUtils/mountWithTheme";
import defaultTheme from "../../../src/theme";
import Crumb from "./index";

describe("Breadcrumbs crumb component", () => {
  test("Renders last breadcrumb as plain text", () => {
    const crumbProps = {
      crumb: {
        uri: "https://www.mypodbrowser.com/some/location",
        label: "location",
      },
      isLink: false,
    };
    const crumb = mount(
      <WithTheme theme={defaultTheme}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Crumb {...crumbProps} />
      </WithTheme>
    );
    expect(crumb.html()).not.toContain("href");
  });

  test("Renders all crumbs except last one as links", () => {
    const crumbProps = {
      crumb: {
        uri: "https://www.mypodbrowser.com/some",
        label: "some",
      },
      isLink: true,
    };
    const crumb = mount(
      <WithTheme theme={defaultTheme}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Crumb {...crumbProps} />
      </WithTheme>
    );
    expect(crumb.html()).toContain("href");
  });
});
