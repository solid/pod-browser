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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { DatasetProvider } from "@inrupt/solid-ui-react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ResourceDetails from "./index";

describe("Resource details", () => {
  test("it renders container details", () => {
    const dataset = mockSolidDatasetFrom("http://example.com/container/");

    const { asFragment } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <ResourceDetails />
      </DatasetProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
  test("it renders a decoded container name", () => {
    const dataset = mockSolidDatasetFrom(
      "http://example.com/Some%20container/"
    );

    const { asFragment } = renderWithTheme(
      <DatasetProvider dataset={dataset}>
        <ResourceDetails />
      </DatasetProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
