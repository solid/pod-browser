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
import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { mock } from "jest-mock-extended";
import ContainerTableRow, {
  handleTableRowClick,
  resourceHref,
  fetchResourceDetails,
} from "./index";
import * as litSolidHelpers from "../../src/lit-solid-helpers";

jest.mock("@solid/lit-pod");

describe("ContainerTableRow", () => {
  test("it renders a table row", () => {
    const resource = mock<litSolidHelpers.ResourceDetails>({
      iri: "https://example.com/example.ttl",
    });

    const tree = shallow(<ContainerTableRow resource={resource} />);

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
      resource: mock<litSolidHelpers.ResourceDetails>(),
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
      resource: mock<litSolidHelpers.ResourceDetails>(),
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

  test("it does not attempt to fetch permissions if there are already permissions", async () => {
    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();
    const handler = handleTableRowClick({
      resource: {
        iri: "iri",
        name: "name",
        types: ["type"],
        permissions: [
          {
            webId: "webId",
            alias: "Full Control",
            acl: { read: true, write: true, append: true, control: true },
            profile: { webId: "webId" },
          },
        ],
      },
      setMenuOpen,
      setMenuContents,
    });

    jest.spyOn(litSolidHelpers, "fetchResourceWithAcl");

    const evnt = { target: document.createElement("tr") } as Partial<
      React.MouseEvent<HTMLInputElement>
    >;

    await handler(evnt);

    expect(setMenuOpen).toHaveBeenCalledWith(true);
    expect(setMenuContents).toHaveBeenCalled();
    expect(litSolidHelpers.fetchResourceWithAcl).not.toHaveBeenCalled();
  });

  test("it renders a detail error when the permission call fails", async () => {
    const setMenuOpen = jest.fn();
    const setMenuContents = jest.fn();

    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "webId" },
    }));

    const handler = handleTableRowClick({
      resource: { iri: "iri", name: "name", types: ["type"] },
      setMenuOpen,
      setMenuContents,
    });

    jest
      .spyOn(litSolidHelpers, "fetchResourceWithAcl")
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const evnt = { target: document.createElement("tr") } as Partial<
      React.MouseEvent<HTMLInputElement>
    >;

    await handler(evnt);

    expect(setMenuContents).toHaveBeenCalled();
  });
});

describe("fetchResourceDetails", () => {
  test("it fetches the resource, adding a human-readable name", async () => {
    const iri = "https://dayton.dev.inrupt.net/public/";

    jest
      .spyOn(litSolidHelpers, "fetchResource")
      .mockResolvedValue({ iri, types: ["type"] });

    const resourceDetails = await fetchResourceDetails(iri);

    expect(resourceDetails.name).toEqual("/public");
    expect(resourceDetails.iri).toEqual(iri);
  });

  test("it fetches a file with ACL if the fetchResource call fails", async () => {
    const iri = "https://dayton.dev.inrupt.net/file.txt";

    jest.spyOn(litSolidHelpers, "fetchResource").mockImplementationOnce(() => {
      throw new Error("boom");
    });

    jest
      .spyOn(litSolidHelpers, "fetchFileWithAcl")
      .mockResolvedValue({ iri, types: ["type"], file: new Blob(["file"]) });

    const resourceDetails = await fetchResourceDetails(iri);

    expect(resourceDetails.name).toEqual("/file.txt");
    expect(resourceDetails.iri).toEqual(iri);
  });
});
