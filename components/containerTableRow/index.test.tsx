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
import { mock } from "jest-mock-extended";

import { mountToJson } from "../../__testUtils/mountWithTheme";
import { ResourceDetails } from "../../src/lit-solid-helpers";
import { useFetchResourceDetails } from "../../src/hooks/litPod";

import ContainerTableRow, { handleTableRowClick, resourceHref } from "./index";

jest.mock("@solid/lit-pod");
jest.mock("../../src/hooks/litPod");

describe("ContainerTableRow", () => {
  test("it renders a table row", () => {
    const resource = {
      iri: "https://example.com/example.ttl",
      name: "/example.ttl",
      types: [],
    };

    (useFetchResourceDetails as jest.Mock).mockReturnValue({ data: undefined });

    const tree = mountToJson(
      <table>
        <tbody>
          <ContainerTableRow resource={resource} />
        </tbody>
      </table>
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders a table row with loaded data", () => {
    const resource = {
      iri: "https://example.com/example.ttl",
      name: "/example.ttl",
      types: ["some-type"],
    };

    (useFetchResourceDetails as jest.Mock).mockReturnValue({ data: resource });

    const tree = mountToJson(
      <table>
        <tbody>
          <ContainerTableRow resource={resource} />
        </tbody>
      </table>
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders a table row with loaded data without a type", () => {
    const resource = {
      iri: "https://example.com/example.ttl",
      name: "/example.ttl",
      types: [],
    };

    (useFetchResourceDetails as jest.Mock).mockReturnValue({ data: resource });

    const tree = mountToJson(
      <table>
        <tbody>
          <ContainerTableRow resource={resource} />
        </tbody>
      </table>
    );

    expect(tree).toMatchSnapshot();
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
    const resource = mock<ResourceDetails>();
    const handler = handleTableRowClick({
      resource,
      setMenuOpen,
      setMenuContents,
    });

    const evnt = { target: document.createElement("tr") } as Partial<
      React.MouseEvent<HTMLInputElement>
    >;

    await handler(evnt);

    expect(setMenuOpen).toHaveBeenCalledWith(resource.iri);
    expect(setMenuContents).toHaveBeenCalled();
  });

  test("it commits no operation when the click target is an anchor", async () => {
    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();
    const handler = handleTableRowClick({
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
