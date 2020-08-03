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
import { mountToJson } from "../../__testUtils/mountWithTheme";
import * as SolidClientHelperFns from "../../src/solidClientHelpers";
import ResourceSharing, {
  AddedAgents,
  backToDetailsClick,
  displayName,
  handleAddAgentClick,
  handlePermissionUpdate,
  NoThirdPartyPermissions,
  saveThirdPartyPermissionHandler,
  ThirdPartyPermissions,
  ThirdPartyPermissionsList,
} from "./index";

describe("ResourceSharing", () => {
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
    const setTitle = jest.fn();
    const setOpen = jest.fn();
    const setContent = jest.fn();
    const confirmed = false;
    const setConfirmed = jest.fn();

    jest
      .spyOn(RouterFns, "useRouter")
      .mockReturnValueOnce({ pathname: "/pathname/", replace: jest.fn() });

    jest
      .spyOn(ReactFns, "useContext")
      .mockReturnValueOnce({ session: { webId } })
      .mockReturnValueOnce({
        setTitle,
        setOpen,
        setContent,
        confirmed,
        setConfirmed,
      });

    const tree = mountToJson(
      <ResourceSharing iri={iri} name={name} permissions={permissions} />
    );

    expect(tree).toMatchSnapshot();
  });
});

describe("displayName", () => {
  test("it returns the name property if given", () => {
    const name = "name";
    const nickname = "nickname";
    const webId = "webId";

    expect(displayName({ name, nickname, webId })).toEqual(name);
  });

  test("it returns the nickname property if no name", () => {
    const nickname = "nickname";
    const webId = "webId";

    expect(displayName({ webId, nickname })).toEqual(nickname);
  });

  test("it returns the webId property if no nickname", () => {
    const webId = "webId";

    expect(displayName({ webId })).toEqual(webId);
  });
});

describe("handleAddAgentClick", () => {
  test("it fetches the profile for the webId and adds it to the addedAgents", async () => {
    const webId = "webId";
    const avatar = "avatar";
    const name = "name";
    const setAddedAgents = jest.fn();
    const profile = { webId, avatar, name };

    jest
      .spyOn(SolidClientHelperFns, "fetchProfile")
      .mockResolvedValueOnce(profile);

    await handleAddAgentClick(webId, [], setAddedAgents);

    expect(setAddedAgents).toHaveBeenCalledWith([profile]);
  });

  test("it does not add duplicate agents", async () => {
    const webId = "webId";
    const avatar = "avatar";
    const name = "name";
    const setAddedAgents = jest.fn();
    const profile = { webId, avatar, name };

    jest
      .spyOn(SolidClientHelperFns, "fetchProfile")
      .mockResolvedValueOnce(profile);

    await handleAddAgentClick(webId, [profile], setAddedAgents);

    expect(setAddedAgents).not.toHaveBeenCalled();
  });

  test("it logs an error when something goes wrong", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(jest.fn());
    jest
      .spyOn(SolidClientHelperFns, "fetchProfile")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    await handleAddAgentClick("agentId", [], jest.fn());
    /* eslint-disable no-console */
    expect(console.error).toHaveBeenCalledWith("boom");
  });
});

describe("saveThirdPartyPermissionHandler", () => {
  test("it removes the agent from addedAgents and adds them to the permissions", async () => {
    const iri = "iri";
    const setAddedAgents = jest.fn();
    const setThirdPartyPermissions = jest.fn();
    const webId = "webId";
    const profile = { webId, avatar: "avatar", name: "name" };
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    jest
      .spyOn(SolidClientHelperFns, "savePermissions")
      .mockResolvedValueOnce({});

    const handler = saveThirdPartyPermissionHandler({
      iri,
      setAddedAgents,
      addedAgents: [profile],
      thirdPartyPermissions: [],
      setThirdPartyPermissions,
      webId,
      profile,
    });

    await handler(access);

    expect(setAddedAgents).toHaveBeenCalledWith([]);
    expect(setThirdPartyPermissions).toHaveBeenCalledWith([
      {
        alias: "Control",
        acl: access,
        webId,
        profile,
      },
    ]);
    expect(SolidClientHelperFns.savePermissions).toHaveBeenCalledWith({
      iri,
      webId,
      access,
    });
  });
});

describe("AddedAgents", () => {
  test("it renders a list of agents added to the pending allow access list", () => {
    const webId = "webId";
    const avatar = "avatar";
    const name = "name";
    const agent = {
      webId,
      avatar,
      name,
    };
    const addedAgents = [agent];
    const setAddedAgents = jest.fn();
    const setThirdPartyPermissions = jest.fn();
    const thirdPartyPermissions = [];
    const classes = {
      listItem: "listItem",
      avatar: "avatar",
      detailText: "detailText",
    };

    const tree = mountToJson(
      <AddedAgents
        addedAgents={addedAgents}
        classes={classes}
        setAddedAgents={setAddedAgents}
        setThirdPartyPermissions={setThirdPartyPermissions}
        thirdPartyPermissions={thirdPartyPermissions}
      />
    );

    expect(tree).toMatchSnapshot();
  });

  test("it returns null when addedAgents are null", () => {
    const setAddedAgents = jest.fn();
    const setThirdPartyPermissions = jest.fn();
    const thirdPartyPermissions = [];
    const classes = {
      listItem: "listItem",
      avatar: "avatar",
      detailText: "detailText",
    };

    const tree = AddedAgents({
      addedAgents: null,
      classes,
      setAddedAgents,
      setThirdPartyPermissions,
      thirdPartyPermissions,
    });

    expect(tree).toBeNull();
  });

  test("it returns null when addedAgents are empty", () => {
    const setAddedAgents = jest.fn();
    const setThirdPartyPermissions = jest.fn();
    const thirdPartyPermissions = [];
    const classes = {
      listItem: "listItem",
      avatar: "avatar",
      detailText: "detailText",
    };

    const tree = AddedAgents({
      addedAgents: [],
      classes,
      setAddedAgents,
      setThirdPartyPermissions,
      thirdPartyPermissions,
    });

    expect(tree).toBeNull();
  });
});

describe("handlePermissionUpdate", () => {
  test("it creates a handler that removes agents if all permissions are removed", async () => {
    jest
      .spyOn(SolidClientHelperFns, "savePermissions")
      .mockResolvedValueOnce({});

    const iri = "iri";
    const webId = "webId";
    const setThirdPartyPermissions = jest.fn();
    const thirdPartyPermissions = [{ webId }];
    const access = {
      read: false,
      write: false,
      append: false,
      control: false,
    };
    const handler = handlePermissionUpdate({
      setThirdPartyPermissions,
      thirdPartyPermissions,
      webId,
      iri,
    });

    await handler(access);

    expect(setThirdPartyPermissions).toHaveBeenCalledWith([]);
    expect(SolidClientHelperFns.savePermissions).toHaveBeenCalledWith({
      iri,
      webId,
      access,
    });
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

describe("ThirdPartyPermissionsList", () => {
  test("it renders the third party permissions", () => {
    const iri = "iri";
    const webId = "webId";
    const alias = "Full Control";
    const profile = { webId };
    const setThirdPartyPermissions = jest.fn();
    const acl = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const thirdPartyPermissions = [
      {
        webId,
        alias,
        acl,
        profile,
      },
    ];
    const classes = {
      centeredSection: "centeredSection",
      listItem: "listItem",
    };

    const tree = mountToJson(
      <ThirdPartyPermissionsList
        iri={iri}
        classes={classes}
        thirdPartyPermissions={thirdPartyPermissions}
        setThirdPartyPermissions={setThirdPartyPermissions}
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
