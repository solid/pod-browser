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
import { renderWithTheme } from "../../../../../__testUtils/withTheme";

import ResourceDrawer from "./index";

jest.mock("../../../../../src/effects/auth");

describe("ResourceDrawer", () => {
  test("Renders the ResourceDrawer with correct title and access list", () => {
    const onClose = jest.fn();
    const webId = "https://example.com/profile/card#me";
    const resourceIri = "https://example.com/resource/";
    const accessList = [
      {
        agent: webId,
        allow: [
          "http://www.w3.org/ns/solid/acp#Read",
          "http://www.w3.org/ns/solid/acp#Write",
          "http://www.w3.org/ns/solid/acp#Append",
          "http://www.w3.org/ns/solid/acp#Control",
        ],
        deny: [],
        resource: resourceIri,
      },
    ];

    const { asFragment } = renderWithTheme(
      <ResourceDrawer
        open
        onClose={onClose}
        accessList={accessList}
        resourceIri={resourceIri}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
