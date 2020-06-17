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

/* eslint-disable camelcase */
import React from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { mock } from "jest-mock-extended";
import ContainerTableRow, {
  handleTableRowClick,
  resourceHref,
  ResourceDetails,
} from "./index";

describe("ContainerTableRow", () => {
  test("it renders a table row", () => {
    const resource = mock<ResourceDetails>({
      iri: "https://example.com/example.ttl",
    });

    const tree = shallow(<ContainerTableRow resource={resource} />);

    tree.simulate("click");
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("resourceHref", () => {
  test("it generates a resource link", () => {
    const link = resourceHref("https://example.com/example.ttl");
    expect(link).toEqual("/resource/https%3A%2F%2Fexample.com%2Fexample.ttl");
  });
});

describe("handleTableRowClick", () => {
  test("it opens the drawer and sets the menu contents", async () => {
    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();
    const handler = handleTableRowClick({
      classes: {},
      resource: mock<ResourceDetails>(),
      setMenuOpen,
      setMenuContents,
    });

    const evnt = { target: document.createElement("tr") } as Partial<
      React.MouseEvent<HTMLInputElement>
    >;

    await handler(evnt);

    expect(setMenuOpen).toHaveBeenCalledWith(true);
    expect(setMenuContents).toHaveBeenCalled();
  });

  test("it commits no operation when the click target is an anchor", async () => {
    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();
    const handler = handleTableRowClick({
      classes: {},
      resource: mock<ResourceDetails>(),
      setMenuOpen,
      setMenuContents,
    });

    const evnt = { target: document.createElement("a") } as Partial<
      React.MouseEvent<HTMLInputElement>
    >;
    await handler(evnt);

    expect(setMenuOpen).not.toHaveBeenCalled();
    expect(setMenuContents).not.toHaveBeenCalled();
  });
});
