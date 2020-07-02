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
import { mock } from "jest-mock-extended";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { mountToJson } from "../../__testUtils/mountWithTheme";

import { useFetchResourceWithAcl } from "../../src/hooks/litPod";
import { NormalizedPermission } from "../../src/lit-solid-helpers";
import * as stringHelpers from "../../src/stringHelpers";
import ResourceDetails, * as resourceDetailFns from "./index";

const {
  displayName,
  displayType,
  DownloadLink,
  downloadResource,
  forceDownload,
  Permission,
  ThirdPartyPermissions,
} = resourceDetailFns;

jest.mock("../../src/hooks/litPod");

describe("Resource details", () => {
  test("renders loading without name without breaking", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    (useFetchResourceWithAcl as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
    });

    const tree = mountToJson(
      <ResourceDetails types={["Resource"]} iri="iri" />
    );

    expect(tree).toMatchSnapshot();
  });

  test("renders loading if there is no data or error", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    (useFetchResourceWithAcl as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
    });

    const tree = mountToJson(
      <ResourceDetails name="Resource Name" types={["Resource"]} iri="iri" />
    );

    expect(tree).toMatchSnapshot();
  });

  test("renders 'no access' if there is an error", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    (useFetchResourceWithAcl as jest.Mock).mockReturnValue({
      data: undefined,
      error: { message: "nope" },
    });

    const tree = mountToJson(
      <ResourceDetails name="Resource Name" types={["Resource"]} iri="iri" />
    );

    expect(tree).toMatchSnapshot();
  });

  test("renders resource details", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
        profile: {
          avatar: "http://example.com/avatar.png",
          nickname: "owner",
          name: "Test Person",
        },
      },
      {
        webId: "collaborator",
        alias: "Can View",
        acl: {
          append: false,
          control: false,
          read: true,
          write: false,
        },
        profile: {
          avatar: null,
          nickname: "collaborator",
          name: "Test Collaborator",
        },
      },
    ];

    (useFetchResourceWithAcl as jest.Mock).mockReturnValue({
      data: { permissions },
    });

    const tree = mountToJson(
      <ResourceDetails name="Resource Name" types={["Resource"]} iri="iri" />
    );

    expect(tree).toMatchSnapshot();
  });

  test("renders no 3rd party access message", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
        profile: {
          avatar: "http://example.com/avatar.png",
          nickname: "owner",
          name: "Test Person",
        },
      },
    ];

    (useFetchResourceWithAcl as jest.Mock).mockReturnValue({
      data: { permissions },
    });

    const tree = mountToJson(
      <ResourceDetails name="Resource Name" types={["Resource"]} iri="iri" />
    );

    expect(tree).toMatchSnapshot();
  });

  test("renders with no types", () => {
    jest.spyOn(ReactFns, "useContext").mockImplementation(() => ({
      session: { webId: "owner" },
    }));

    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
        profile: {
          avatar: "http://example.com/avatar.png",
          nickname: "owner",
          name: "Test Person",
        },
      },
      {
        webId: "collaborator",
        alias: "Can View",
        acl: {
          append: false,
          control: false,
          read: true,
          write: false,
        },
        profile: {
          avatar: null,
          nickname: "collaborator",
          name: "Test Collaborator",
        },
      },
    ];

    (useFetchResourceWithAcl as jest.Mock).mockReturnValue({
      data: { permissions },
    });

    const tree = mountToJson(
      <ResourceDetails name="Resource Name" iri="iri" />
    );

    expect(tree).toMatchSnapshot();
  });
});

describe("displayName", () => {
  const name = "Test Example";
  const nickname = "test_example";
  const webId = "webId";

  test("it returns the webId, if no name or nickname is defined", () => {
    expect(displayName({ webId })).toEqual("webId");
  });

  test("it returns the nickname, if no name is defined", () => {
    expect(displayName({ nickname, webId })).toEqual("test_example");
  });

  test("it returns the name, if defined", () => {
    expect(displayName({ name, nickname, webId })).toEqual("Test Example");
  });
});

describe("Permission", () => {
  test("it returns null if given no permissions", () => {
    const classes = {};

    const tree = shallow(<Permission classes={classes} permission={null} />);

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("it renders permissions if given", () => {
    const classes = {};
    const permission = mock<NormalizedPermission>({
      webId: "https://somepod.somehost.com/profile#me",
      alias: "some-alias",
      profile: {
        avatar: "https://somepod.somehost.com/public/photo.jpg",
      },
    });

    const tree = shallow(
      <Permission classes={classes} permission={permission} />
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("ThirdPartyPermissions", () => {
  test("it returns null if given no permissions", () => {
    const tree = shallow(
      <ThirdPartyPermissions classes={{}} thirdPartyPermissions={null} />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("it returns a useful message if there are no third party permissions", () => {
    const tree = shallow(
      <ThirdPartyPermissions classes={{}} thirdPartyPermissions={[]} />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("it renders permissions if given", () => {
    const classes = {};
    const permissions = [
      {
        webId: "owner",
        alias: "Full Control",
        acl: {
          append: true,
          control: true,
          read: true,
          write: true,
        },
        profile: {
          avatar: "http://example.com/avatar.png",
          nickname: "owner",
          name: "Test Person",
        },
      },
      {
        webId: "collaborator",
        alias: "Can View",
        acl: {
          append: false,
          control: false,
          read: true,
          write: false,
        },
        profile: {
          avatar: null,
          nickname: "collaborator",
          name: "Test Collaborator",
        },
      },
    ];

    const tree = shallow(
      <ThirdPartyPermissions
        classes={classes}
        thirdPartyPermissions={permissions}
      />
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe("displayType", () => {
  test("it returns 'Resource' if no types", () => {
    expect(displayType([])).toEqual("Resource");
  });

  test("it returns the first type if types", () => {
    const types = ["A Type"];
    expect(displayType(types)).toEqual(types[0]);
  });
});

describe("forceDownload", () => {
  test("it creates an anchor with an object url and clicks it", () => {
    const setAttributeMock = jest.fn();
    const clickMock = jest.fn();
    const revokeObjectURLMock = jest.fn();
    const appendChildMock = jest.fn();
    const removeChildMock = jest.fn();
    const mockAnchor = {
      style: { display: "block" },
      setAttribute: setAttributeMock,
      click: clickMock,
    };
    const file = new Blob(["file"]);

    window.URL = {
      createObjectURL: () => "object-url",
      revokeObjectURL: revokeObjectURLMock,
    };

    jest.spyOn(document, "createElement").mockReturnValue(mockAnchor);
    jest
      .spyOn(document.body, "appendChild")
      .mockImplementationOnce(appendChildMock);
    jest
      .spyOn(document.body, "removeChild")
      .mockImplementationOnce(removeChildMock);

    forceDownload("filename", file);

    expect(mockAnchor.style.display).toEqual("none");
    expect(mockAnchor.href).toEqual("object-url");
    expect(setAttributeMock).toHaveBeenCalledWith("download", "filename");
    expect(appendChildMock).toHaveBeenCalledWith(mockAnchor);
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith("object-url");
    expect(removeChildMock).toHaveBeenCalledWith(mockAnchor);
  });
});

describe("downloadResource", () => {
  test("it returns a handler to download the resource", () => {
    const iri = "http://example.com/resource";
    const handler = downloadResource(iri);
    const blobMock = jest.fn();
    const responseMock = { blob: blobMock };
    const fetchMock = jest.fn();

    blobMock.mockResolvedValue("file");

    window.fetch = fetchMock.mockResolvedValue(responseMock);

    jest
      .spyOn(stringHelpers, "parseUrl")
      .mockReturnValue({ pathname: "/resource" });

    handler();

    expect(fetchMock).toHaveBeenCalledWith(iri);
  });
});

describe("DownloadLink", () => {
  test("returns null if resource is a container", () => {
    const type = "container";
    const iri = "http://example.com/resource";
    const tree = shallow(<DownloadLink type={type} iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test("returns a download button if resource is not a container", () => {
    const type = "foo";
    const iri = "http://example.com/resource";
    const tree = shallow(<DownloadLink type={type} iri={iri} />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});
