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

import * as ReactFns from "react";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { mock } from "jest-mock-extended";
import * as litSolidHelpers from "../../src/lit-solid-helpers";

import Container, {
  fetchResourceDetails,
  getResourceInfoFromContainerIri,
} from "./index";

jest.mock("solid-auth-client");
jest.mock("@solid/lit-pod");

const iri = "https://mypod.myhost.com/public";

describe("Container view", () => {
  test("Renders a container view", () => {
    const tree = shallow(<Container iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("Renders a table with data", () => {
    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    // Mock the resources useState call
    jest
      .spyOn(ReactFns, "useState")
      .mockImplementationOnce(() => [resources, () => {}]);

    // Mock the isLoading useState call
    jest
      .spyOn(ReactFns, "useState")
      .mockImplementationOnce(() => [false, () => {}]);

    const tree = shallow(<Container iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("Loading container resource iri list", () => {
  test("Loads resource iris from a container iri", async () => {
    jest
      .spyOn(litSolidHelpers, "fetchResourceWithAcl")
      .mockResolvedValue(mock<litSolidHelpers.NormalizedResource>());

    const resources = [
      "https://myaccount.mypodserver.com/inbox",
      "https://myaccount.mypodserver.com/private",
      "https://myaccount.mypodserver.com/note.txt",
    ];

    const { getIriAll }: { getIriAll: jest.Mock } = jest.requireMock(
      "@solid/lit-pod"
    );

    getIriAll.mockImplementationOnce(() => resources);

    await getResourceInfoFromContainerIri(iri);

    expect(litSolidHelpers.fetchResourceWithAcl).toHaveBeenCalledWith(
      resources[0]
    );

    expect(litSolidHelpers.fetchResourceWithAcl).toHaveBeenCalledWith(
      resources[1]
    );

    expect(litSolidHelpers.fetchResourceWithAcl).toHaveBeenCalledWith(
      resources[2]
    );
  });
});

describe("fetchResourceDetails", () => {
  test("it fetches the resource with acl, adding the name (shortened iri path)", async () => {
    jest.spyOn(litSolidHelpers, "fetchResourceWithAcl").mockResolvedValue(
      mock<litSolidHelpers.NormalizedResource>({
        iri,
        types: ["Resource"],
        permissions: [
          {
            webId: "user",
            alias: "Full Control",
            acl: { read: true, write: true, append: true, control: true },
          },
        ],
      })
    );

    const { name } = await fetchResourceDetails(iri);

    expect(litSolidHelpers.fetchResourceWithAcl).toHaveBeenCalledWith(iri);
    expect(name).toEqual("/public");
  });

  test("it fetches a file if the resource fetch fails", async () => {
    jest
      .spyOn(litSolidHelpers, "fetchResourceWithAcl")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    jest.spyOn(litSolidHelpers, "fetchFileWithAcl").mockResolvedValue(
      mock<NormalizedResource>({
        iri,
        types: ["txt/plain"],
        file: "file contents",
        permissions: [
          {
            webId: "user",
            alias: "Full Control",
            acl: { read: true, write: true, append: true, control: true },
          },
        ],
      })
    );

    const { name } = await fetchResourceDetails(iri);

    expect(litSolidHelpers.fetchFileWithAcl).toHaveBeenCalledWith(iri);
    expect(name).toEqual("/public");
  });
});
