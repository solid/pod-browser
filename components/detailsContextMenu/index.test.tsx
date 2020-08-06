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
import * as RouterFns from "next/router";
import * as SolidClientFns from "@inrupt/solid-client";
import * as SolidClientHookFns from "../../src/hooks/solidClient";
import SessionContext from "../../src/contexts/sessionContext";
import DetailsContextMenu, { Contents, handleCloseDrawer } from "./index";
import { mountToJson } from "../../__testUtils/mountWithTheme";

describe("Container view", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it renders a loading view when context has no iri", () => {
    const mockContext = {
      menuOpen: true,
      setMenuOpen: jest.fn(),
    };

    jest.spyOn(ReactFns, "useContext").mockReturnValueOnce(mockContext);

    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {},
    });

    const tree = mountToJson(<DetailsContextMenu />);

    expect(tree).toMatchSnapshot();
  });

  test("it renders a Contents view when the router query has an iri", () => {
    const iri = "/iri/";
    const mockDetailsMenuContext = {
      menuOpen: true,
      setMenuOpen: jest.fn(),
    };

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

    jest
      .spyOn(ReactFns, "useContext")
      .mockReturnValueOnce(mockDetailsMenuContext);

    jest.spyOn(RouterFns, "useRouter").mockReturnValue({
      asPath: "/pathname/",
      replace: jest.fn(),
      query: {
        iri,
        action: "details",
      },
    });

    const tree = mountToJson(<DetailsContextMenu />);
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
    const mockAlertContext = {
      setAlertOpen: jest.fn(),
      setMessage: jest.fn(),
      setSeverity: jest.fn(),
    };
    const data = {
      iri,
      types: ["Container"],
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
      ],
      dataset: {},
    };

    jest.spyOn(ReactFns, "useContext").mockReturnValueOnce(mockAlertContext);

    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({ data });

    jest
      .spyOn(SolidClientFns, "unstable_hasResourceAcl")
      .mockReturnValueOnce(true);

    jest
      .spyOn(SolidClientFns, "unstable_hasAccessibleAcl")
      .mockReturnValueOnce(true);

    jest.spyOn(SolidClientFns, "unstable_getResourceAcl").mockReturnValueOnce();

    jest
      .spyOn(SolidClientFns, "unstable_getAgentDefaultAccessOne")
      .mockReturnValueOnce({
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
        <Contents iri={iri} action="sharing" />
      </SessionContext.Provider>
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders a DetailsError component when there's an error", () => {
    const iri = "/iri/";
    const mockAlertContext = {
      setAlertOpen: jest.fn(),
      setMessage: jest.fn(),
      setSeverity: jest.fn(),
    };

    jest.spyOn(ReactFns, "useContext").mockReturnValueOnce(mockAlertContext);

    jest
      .spyOn(SolidClientHookFns, "useFetchResourceDetails")
      .mockReturnValueOnce({ data: null, error: "Some error" });

    jest
      .spyOn(RouterFns, "useRouter")
      .mockReturnValueOnce({ asPath: "/pathname/", replace: jest.fn() });

    const tree = mountToJson(<Contents iri={iri} action="details" />);

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
