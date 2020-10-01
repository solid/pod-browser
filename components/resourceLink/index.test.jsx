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
import { mountToJson } from "../../__testUtils/mountWithTheme";
import ResourceLink from "./index";

jest.mock("next/router");

describe("ResourceLink", () => {
  test("renders with a resource and container", () => {
    const resourceIri = "https://mypod.myhost.com/resource";
    const containerIri = "https://mypod.myhost.com";

    const tree = mountToJson(
      <ResourceLink resourceIri={resourceIri} containerIri={containerIri}>
        Text
      </ResourceLink>
    );
    expect(tree).toMatchSnapshot();
  });

  test("renders with a resource, container, and action", () => {
    const resourceIri = "https://mypod.myhost.com/resource";
    const containerIri = "https://mypod.myhost.com";
    const action = "myAction";

    const tree = mountToJson(
      <ResourceLink
        resourceIri={resourceIri}
        containerIri={containerIri}
        action={action}
      >
        Text
      </ResourceLink>
    );
    expect(tree).toMatchSnapshot();
  });
});
