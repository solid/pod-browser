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
import * as routerFns from "next/router";
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import { useRouter } from "next/router";
import { renderWithTheme } from "../../__testUtils/withTheme";
import ContainerTableRow, {
  handleAction,
  ResourceIcon,
  renderResourceType,
} from "./index";
import BookmarksContext from "../../src/contexts/bookmarksContext";

jest.mock("@inrupt/solid-client");
jest.mock("next/router");

const bookmarks = mockSolidDatasetFrom(
  "https://somepod.com/bookmarks/index.ttl"
);
const setBookmarks = jest.fn();

describe("ContainerTableRow", () => {
  beforeEach(() => {
    useRouter.mockImplementation(() => ({
      query: {},
    }));
  });

  it("renders a table row", () => {
    const resource = {
      iri: "https://example.com/container/example.ttl",
      name: "/example.ttl",
      types: [],
    };

    jest.spyOn(routerFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      query: {},
    });

    const { asFragment } = renderWithTheme(
      <table>
        <tbody>
          <BookmarksContext.Provider value={(bookmarks, setBookmarks)}>
            <ContainerTableRow
              resource={resource}
              container="https://example.com/container/"
            />
          </BookmarksContext.Provider>
        </tbody>
      </table>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a table row with loaded data", () => {
    const resource = {
      iri: "https://example.com/example.ttl",
      name: "/example.ttl",
      types: ["some-type"],
    };

    const { asFragment } = renderWithTheme(
      <table>
        <tbody>
          <BookmarksContext.Provider value={(bookmarks, setBookmarks)}>
            <ContainerTableRow
              resource={resource}
              container="https://example.com/container/"
            />
          </BookmarksContext.Provider>
        </tbody>
      </table>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a table row with loaded data without a type", () => {
    const resource = {
      iri: "https://example.com/example.ttl",
      name: "/example.ttl",
      types: [],
    };

    const { asFragment } = renderWithTheme(
      <table>
        <tbody>
          <BookmarksContext.Provider value={(bookmarks, setBookmarks)}>
            <ContainerTableRow
              resource={resource}
              container="https://example.com/container/"
            />
          </BookmarksContext.Provider>
        </tbody>
      </table>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe("handleAction", () => {
  it("creates a click handler that replaces the route", async () => {
    const resourceIri = "https://mypod.com/container/resource";
    const containerIri = "https://mypod.com/container";

    const replace = jest.fn();
    const router = {
      asPath: "asPath?some=query&variables=true",
      replace,
    };
    const event = {
      target: { tagName: "TR" },
    };
    const handler = handleAction(resourceIri, containerIri, router);

    await handler(event);

    expect(replace).toHaveBeenCalledWith(
      {
        pathname: "/resource/[iri]",
        query: { action: "details", resourceIri },
      },
      {
        pathname: `/resource/${encodeURIComponent(containerIri)}`,
        query: { action: "details", resourceIri },
      }
    );
  });

  it("defers if an anchor element triggered the click", async () => {
    const resourceIri = "https://mypod.com/container/resource";
    const containerIri = "https://mypod.com/container";

    const replace = jest.fn();
    const router = { asPath: "asPath", replace };
    const event = { target: { tagName: "A" } };
    const handler = handleAction(resourceIri, containerIri, router);

    await handler(event);

    expect(replace).not.toHaveBeenCalled();
  });
  it("defers if an any key other than enter key triggered the keydown", async () => {
    const resourceIri = "https://mypod.com/container/resource";
    const containerIri = "https://mypod.com/container";

    const replace = jest.fn();
    const router = { asPath: "asPath", replace };
    const event = { type: "keydown", keyCode: 0 };
    const handler = handleAction(resourceIri, containerIri, router);

    await handler(event);

    expect(replace).not.toHaveBeenCalled();
  });
});

describe("ResourceIcon", () => {
  it("renders a container icon for containers", () => {
    const bem = jest.fn();
    const { asFragment } = renderWithTheme(
      <ResourceIcon iri="/container/" bem={bem} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders a container icon for resources", () => {
    const bem = jest.fn();
    const { asFragment } = renderWithTheme(
      <ResourceIcon iri="/resource" bem={bem} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});

describe("renderResourceType", () => {
  it("renders Container with a container iri", () => {
    expect(renderResourceType("/container/")).toEqual("Container");
  });

  it("renders Resource with a resource iri", () => {
    expect(renderResourceType("/resource")).toEqual("Resource");
  });
});
