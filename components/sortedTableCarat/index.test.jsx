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

import SortedTableCarat from "./index";

describe("Sorted", () => {
  test("Displays an upwards facing carat when ascending", () => {
    const tree = mountToJson(<SortedTableCarat sorted sortedDesc={false} />);

    expect(tree).toMatchSnapshot();
  });

  test("Displays a downwards facing carat when descending", () => {
    const tree = mountToJson(<SortedTableCarat sorted sortedDesc={false} />);
    expect(tree).toMatchSnapshot();
  });
});

describe("Unsorted", () => {
  test("Displays nothing when unsorted", () => {
    const tree = mountToJson(<SortedTableCarat sorted sortedDesc={false} />);
    expect(tree).toMatchSnapshot();
  });
});

describe("Hiding the caret", () => {
  test("Is hidden", () => {
    const tree = mountToJson(<SortedTableCarat sorted={false} />);
    expect(tree).toMatchSnapshot();
  });
});
