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
import * as RouterFns from "next/router";
import * as SolidClientFns from "@inrupt/solid-client";
import * as SolidClientHookFns from "../../src/hooks/solidClient";
import SessionContext from "../../src/contexts/sessionContext";
import DetailsContextMenu, { Contents, handleCloseDrawer } from "./index";
import { mountToJson } from "../../__testUtils/mountWithTheme";
import mockDetailsContextMenuProvider from "../../__testUtils/mockDetailsContextMenuProvider";
import mockAlertContextProvider from "../../__testUtils/mockAlertContextProvider";

describe("Container view", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it renders a loading view when context has no iri", () => {
    const DetailsContext = mockDetailsContextMenuProvider({
      menuOpen: true,
      setMenuOpen: jest.fn,
    });

    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {},
    });

    const tree = mountToJson(
      <DetailsContext>
        <DetailsContextMenu />
      </DetailsContext>
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders a Contents view when the router query has an iri", () => {
    const iri = "/iri/";

    const data = {
      iri,
      types: ["Container"],
      permissions: [
        {
          webId: "webId",
          alias: "Full Control",
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
      ],
    };

    const DetailsMenuContext = mockDetailsContextMenuProvider({
      menuOpen: true,
      setMenuOpen: jest.fn,
    });

    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({ data });

    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {
        iri,
        action: "details",
      },
    });

    const tree = mountToJson(
      <DetailsMenuContext>
        <DetailsContextMenu />
      </DetailsMenuContext>
    );
    expect(tree).toMatchSnapshot();
  });
});

describe("Contents", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it renders a DetailsLoading component if there's no data and the action is details", () => {
    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({});

    jest.spyOn(RouterFns, "useRouter").mockReturnValueOnce({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {},
    });

    const tree = mountToJson(<Contents iri="/iri/" action="details" />);

    expect(tree).toMatchSnapshot();
  });

  test("it renders a ResourceSharingLoading component if there's no data and the action is sharing", () => {
    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({});

    jest.spyOn(RouterFns, "useRouter").mockReturnValueOnce({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {},
    });

    const tree = mountToJson(<Contents iri="/iri/" action="sharing" />);

    expect(tree).toMatchSnapshot();
  });

  test("it renders a ResourceDetails component when there's data and the action is details", () => {
    const iri = "/iri/";
    const data = {
      iri,
      types: ["Container"],
      permissions: [
        {
          webId: "webId",
          alias: "Full Control",
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
      ],
    };

    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({ data });

    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {},
    });

    const session = {
      info: {
        webId: "https://test.url/profile/card#me",
      },
    };

    const tree = mountToJson(
      <SessionContext.Provider value={{ session }}>
        <Contents iri={iri} action="details" />
      </SessionContext.Provider>
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders a ResourceSharing component when there's data and the action is sharing", () => {
    const iri = "/iri/";
    const webId = "webId";

    const data = {
      iri,
      types: ["Container"],
      defaultPermissions: [],
      permissions: [
        {
          profile: { webId, avatar: "/avatar" },
          webId,
          alias: "Full Control",
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
        {
          profile: { webId: "collaborator", avatar: "/avatar" },
          webId: "collaborator",
          alias: "Full Control",
          acl: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
      ],
      dataset: {},
    };

    const AlertContextProvider = mockAlertContextProvider({
      setAlertOpen: jest.fn(),
      setMessage: jest.fn(),
      setSeverity: jest.fn(),
    });

    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({ data });

    jest.spyOn(SolidClientFns, "hasResourceAcl").mockReturnValue(true);

    jest.spyOn(SolidClientFns, "hasAccessibleAcl").mockReturnValue(true);

    jest.spyOn(SolidClientFns, "getResourceAcl").mockReturnValue();

    jest.spyOn(SolidClientFns, "getAgentDefaultAccess").mockReturnValueOnce({
      read: true,
      write: true,
      append: true,
      control: true,
    });

    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({ data });

    jest
      .spyOn(RouterFns, "useRouter")
      .mockReturnValueOnce({ asPath: "/pathname/", replace: jest.fn() });

    const session = {
      info: {
        webId: "https://test.url/profile/card#me",
      },
    };

    const tree = mountToJson(
      <SessionContext.Provider value={{ session }}>
        <AlertContextProvider>
          <Contents iri={iri} action="sharing" />
        </AlertContextProvider>
      </SessionContext.Provider>
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders a DetailsError component when there's an error", () => {
    const iri = "/iri/";

    const AlertContextProvider = mockAlertContextProvider({
      setAlertOpen: jest.fn(),
      setMessage: jest.fn(),
      setSeverity: jest.fn(),
    });

    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({ data: null, error: "Some error" });

    jest
      .spyOn(RouterFns, "useRouter")
      .mockReturnValueOnce({ asPath: "/pathname/", replace: jest.fn() });

    const tree = mountToJson(
      <AlertContextProvider>
        <Contents iri={iri} action="details" />
      </AlertContextProvider>
    );

    expect(tree).toMatchSnapshot();
  });
});

describe("handleCloseDrawer", () => {
  test("it creates a function to close the drawer", async () => {
    const setMenuOpen = jest.fn();
    const router = {
      asPath: "/path?with=query",
      replace: jest.fn(),
    };
    const handler = handleCloseDrawer({ setMenuOpen, router });
    await handler();

    expect(setMenuOpen).toHaveBeenCalledWith(false);
    expect(router.replace).toHaveBeenCalledWith("/resource/[iri]", "/path");
  });
});
