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
import { mountToJson } from "../../../__testUtils/mountWithTheme";
import * as ProfileHelpers from "../../../src/solidClientHelpers/profile";
import * as PermissionHelpers from "../../../src/solidClientHelpers/permissions";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import ResourceSharing, {
  backToDetailsClick,
  handleAddAgentClick,
  handleAddDefaultPermissions,
  NoThirdPartyPermissions,
  onThirdPartyAccessSubmit,
  ThirdPartyPermissions,
  thirdPartySubmitHandler,
  handleChangeDefaultAgentPermissions,
} from "./index";

describe("ResourceSharing", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("it renders the sharing action component", () => {
    const name = "name";
    const iri = "iri";
    const webId = "webId";
    const alias = "Full Control";
    const acl = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const permissions = [
      {
        webId,
        alias,
        profile: { webId },
        acl,
      },
      {
        webId: "agentId",
        alias,
        profile: { webId: "agentId" },
        acl,
      },
    ];

    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);

    jest
      .spyOn(RouterFns, "useRouter")
      .mockReturnValueOnce({ pathname: "/pathname/", replace: jest.fn() });

    jest.spyOn(SolidClientFns, "hasResourceAcl").mockReturnValue(true);

    jest.spyOn(SolidClientFns, "hasAccessibleAcl").mockReturnValue(true);

    jest.spyOn(SolidClientFns, "getResourceAcl").mockReturnValueOnce();

    jest.spyOn(SolidClientFns, "getAgentDefaultAccess").mockReturnValueOnce({
      read: true,
      write: true,
      append: true,
      control: true,
    });

    const tree = mountToJson(
      <SessionProvider>
        <ResourceSharing
          dataset={{}}
          iri={iri}
          name={name}
          permissions={permissions}
          defaultPermissions={[]}
        />
      </SessionProvider>
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders the NoThirdPartyPermissions with no 3rd party permissions", () => {
    const name = "name";
    const iri = "iri";
    const webId = "webId";
    const alias = "Full Control";
    const acl = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const permissions = [
      {
        webId,
        alias,
        profile: { webId },
        acl,
      },
    ];

    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);

    jest
      .spyOn(RouterFns, "useRouter")
      .mockReturnValueOnce({ pathname: "/pathname/", replace: jest.fn() });

    jest.spyOn(SolidClientFns, "hasResourceAcl").mockReturnValue(true);

    jest.spyOn(SolidClientFns, "hasAccessibleAcl").mockReturnValue(true);

    jest.spyOn(SolidClientFns, "getResourceAcl").mockReturnValueOnce();

    jest.spyOn(SolidClientFns, "getAgentDefaultAccess").mockReturnValueOnce({
      read: true,
      write: true,
      append: true,
      control: true,
    });

    const tree = mountToJson(
      <SessionProvider>
        <ResourceSharing
          iri={iri}
          name={name}
          permissions={permissions}
          defaultPermissions={[]}
        />
      </SessionProvider>
    );

    expect(tree).toMatchSnapshot();
  });
});

describe("handleAddAgentClick", () => {
  test("it fetches the profile for the webId and adds it to the addedAgents", async () => {
    const webId = "webId";
    const avatar = "avatar";
    const name = "name";
    const setAddedAgents = jest.fn();
    const fetch = jest.fn();
    const profile = { webId, avatar, name };
    const { ACL } = PermissionHelpers;

    jest.spyOn(ProfileHelpers, "fetchProfile").mockResolvedValueOnce(profile);

    const handler = handleAddAgentClick([], setAddedAgents, fetch);
    await handler(webId);

    expect(setAddedAgents).toHaveBeenCalledWith([
      {
        webId,
        profile,
        alias: ACL.NONE.alias,
        acl: ACL.NONE.acl,
      },
    ]);
  });

  test("it does not add duplicate agents", async () => {
    const webId = "webId";
    const avatar = "avatar";
    const name = "name";
    const fetch = jest.fn();
    const setAddedAgents = jest.fn();
    const profile = { webId, avatar, name };

    jest.spyOn(ProfileHelpers, "fetchProfile").mockResolvedValueOnce(profile);

    const handler = handleAddAgentClick([profile], setAddedAgents, fetch);
    await handler(webId);

    expect(setAddedAgents).not.toHaveBeenCalled();
  });

  test("it logs an error when something goes wrong", async () => {
    const fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementationOnce(jest.fn());
    jest.spyOn(ProfileHelpers, "fetchProfile").mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const handler = handleAddAgentClick([], jest.fn(), fetch);
    await handler("agentId");
    /* eslint-disable no-console */
    expect(console.error).toHaveBeenCalledWith("boom");
  });
});

describe("NoThirdPartyPermissions", () => {
  test("it renders a no 3rd party permissions component", () => {
    const classes = {
      centeredSection: "centeredSection",
      listItem: "listItem",
      detailText: "detailText",
    };

    const tree = mountToJson(<NoThirdPartyPermissions classes={classes} />);

    expect(tree).toMatchSnapshot();
  });
});

describe("ThirdPartyPermissions", () => {
  test("it renders null when thirdPartyPermissions is null", () => {
    const iri = "iri";
    const setThirdPartyPermissions = jest.fn();
    const classes = {
      centeredSection: "centeredSection",
      listItem: "listItem",
    };

    expect(
      ThirdPartyPermissions({
        iri,
        setThirdPartyPermissions,
        thirdPartyPermissions: null,
        classes,
      })
    ).toBeNull();
  });

  test("it renders NoThirdPartyPermissions when the list is empty", () => {
    const iri = "iri";
    const setThirdPartyPermissions = jest.fn();
    const thirdPartyPermissions = [];
    const classes = {
      thirdPartyPermissions,
      centeredSection: "centeredSection",
      listItem: "listItem",
    };

    const tree = mountToJson(
      <ThirdPartyPermissions
        iri={iri}
        setThirdPartyPermissions={setThirdPartyPermissions}
        thirdPartyPermissions={null}
        classes={classes}
      />
    );

    expect(tree).toMatchSnapshot();
  });

  test("it renders a list of Permissions if there are permissions in the list", () => {
    const iri = "iri";
    const webId = "webId";
    const avatar = "avatar";
    const name = "name";
    const permission = {
      alias: "Full Control",
      profile: { webId, avatar, name },
      acl: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
    };
    const setThirdPartyPermissions = jest.fn();
    const thirdPartyPermissions = [permission];
    const classes = {
      thirdPartyPermissions,
      centeredSection: "centeredSection",
      listItem: "listItem",
    };

    const tree = mountToJson(
      <ThirdPartyPermissions
        iri={iri}
        setThirdPartyPermissions={setThirdPartyPermissions}
        thirdPartyPermissions={null}
        classes={classes}
      />
    );

    expect(tree).toMatchSnapshot();
  });
});

describe("backToDetailsClick", () => {
  test("it returns a handle to go back to the details action", async () => {
    const resourceIri = "iri";
    const iri = "/pathname/";
    const replace = jest.fn();

    const router = {
      replace,
      pathname: "/pathname/",
      query: {
        resourceIri,
        iri,
      },
    };

    const handler = backToDetailsClick(router);

    await handler();

    expect(replace).toHaveBeenCalledWith(
      {
        pathname: "/resource/[iri]",
        query: { action: "details", resourceIri },
      },
      {
        pathname: "/resource/%2Fpathname%2F",
        query: { action: "details", resourceIri },
      }
    );
  });
});

describe("onThirdPartyAccessSubmit", () => {
  test("it creates a handles that adds an agent to the permissions list", async () => {
    const addedAgents = [];
    const webId = "webId";
    const setAddedAgents = jest.fn();
    const setThirdPartyPermissions = jest.fn();
    const onSubmit = jest.fn();
    const thirdPartyPermissions = [];
    const profile = { webId };
    const { acl, alias } = PermissionHelpers.ACL.CONTROL;
    const permission = {
      alias,
      acl,
      webId,
      profile,
    };

    const handler = onThirdPartyAccessSubmit({
      addedAgents,
      setAddedAgents,
      setThirdPartyPermissions,
      thirdPartyPermissions,
      onSubmit,
    });

    await handler(profile, acl);

    expect(setThirdPartyPermissions).toHaveBeenCalledWith([permission]);
  });
});

describe("thirdPartySubmitHandler", () => {
  test("it create a handler to remove an agent that has access revoked", () => {
    const { CONTROL, NONE } = PermissionHelpers.ACL;
    const webId = "webId";
    const profile = { webId };
    const permissionWithAccess = {
      alias: CONTROL.alias,
      acl: CONTROL.acl,
      webId,
      profile,
    };
    const thirdPartyPermissions = [permissionWithAccess];
    const setThirdPartyPermissions = jest.fn();
    const handler = thirdPartySubmitHandler({
      thirdPartyPermissions,
      setThirdPartyPermissions,
    });

    handler(profile, NONE.acl);

    expect(setThirdPartyPermissions).toHaveBeenCalledWith([]);
  });

  test("it does nothing if there is any access", () => {
    const { CONTROL, READ } = PermissionHelpers.ACL;
    const webId = "webId";
    const profile = { webId };
    const permissionWithAccess = {
      alias: CONTROL.alias,
      acl: CONTROL.acl,
      webId,
      profile,
    };
    const thirdPartyPermissions = [permissionWithAccess];
    const setThirdPartyPermissions = jest.fn();
    const handler = thirdPartySubmitHandler({
      thirdPartyPermissions,
      setThirdPartyPermissions,
    });

    handler(profile, READ.acl);

    expect(setThirdPartyPermissions).not.toHaveBeenCalledWith();
  });
});

describe("handleAddDefaultPermissions", () => {
  test("it addes the added agent to the defaultAgents", () => {
    const { ACL } = PermissionHelpers;
    const defaultAgents = [];
    const setDefaultAgents = jest.fn();
    const webId = "webId";
    const { alias, acl } = ACL.CONTROL;
    const profile = { webId };
    const handler = handleAddDefaultPermissions({
      defaultAgents,
      setDefaultAgents,
    });
    const permission = {
      profile,
      acl,
      alias,
      webId,
    };

    handler(profile, acl);

    expect(setDefaultAgents).toHaveBeenCalledWith([permission]);
  });
});

describe("handleChangeDefaultAgentPermissions", () => {
  test("it returns a handler that removes agenst with revoked permissions", () => {
    const { acl } = PermissionHelpers.ACL.NONE;
    const webId = "webId";
    const agent = { webId };
    const defaultAgents = [agent];
    const setDefaultAgents = jest.fn();
    const handler = handleChangeDefaultAgentPermissions({
      defaultAgents,
      setDefaultAgents,
    });

    handler(agent, acl);

    expect(setDefaultAgents).toHaveBeenCalledWith([]);
  });
});
