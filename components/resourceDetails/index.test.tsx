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
import { mount } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "../../src/theme";

import ResourceDetails, {
  displayName,
  displayPermission,
  displayThirdPartyPermissions,
  displayType,
} from "./index";

describe("Resource details", () => {
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

    const classes = {
      typeValue: "typeValue",
      listItem: "listItem",
      detailText: "detailText",
      centeredSection: "centeredSection",
    };

    const tree = mount(
      <ThemeProvider theme={theme}>
        <ResourceDetails
          name="Resource Name"
          types={["Resource"]}
          iri="iri"
          classes={classes}
          permissions={permissions}
        />
      </ThemeProvider>
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
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

    const classes = {
      typeValue: "typeValue",
      listItem: "listItem",
      detailText: "detailText",
      centeredSection: "centeredSection",
    };

    const tree = mount(
      <ThemeProvider theme={theme}>
        <ResourceDetails
          name="Resource Name"
          types={["Resource"]}
          iri="iri"
          classes={classes}
          permissions={permissions}
        />
      </ThemeProvider>
    );

    expect(shallowToJson(tree)).toMatchSnapshot();
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

describe("displayPermission", () => {
  test("it returns null if given no permission", () => {
    let permission;
    const classes = {};
    expect(displayPermission(permission, classes)).toBeNull();
  });
});

describe("displayThirdPartyPermissions", () => {
  test("it returns null if given no permissions", () => {
    let permissions;
    const classes = {};
    expect(displayThirdPartyPermissions(permissions, classes)).toBeNull();
  });
});

describe("displayType", () => {
  test("it returns 'Resource' if no types", () => {
    expect(displayType([])).toEqual("Resource");
  });
});
