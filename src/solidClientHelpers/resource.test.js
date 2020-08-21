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
import * as SolidClientFns from "@inrupt/solid-client";
import createContainer, { TIMESTAMP } from "../../__testUtils/createContainer";
import * as permissionFns from "./permissions";
import {
  createResourceAcl,
  fetchFileWithAcl,
  fetchResourceWithAcl,
  getResource,
  getResourceName,
  getResourceWithPermissions,
  labelOrUrl,
  normalizePermissions,
  saveResource,
  saveResourcePermissions,
  saveResourceWithPermissions,
} from "./resource";

const { displayPermissions, ACL } = permissionFns;

describe("fetchFileWithAcl", () => {
  test("it fetches a file and parses the wac-allow header", async () => {
    jest.spyOn(SolidClientFns, "unstable_fetchFile").mockResolvedValue({
      text: "file contents",
      internal_resourceInfo: {
        contentType: "type",
        permissions: {
          user: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
          public: {
            read: true,
            write: true,
            append: true,
            control: true,
          },
        },
      },
    });

    const fetch = jest.fn();
    const { iri, permissions, types } = await fetchFileWithAcl(
      "some iri",
      fetch
    );

    // TODO fix this broken shit
    expect(iri).toEqual("some iri");
    expect(types).toContain("type");
    expect(permissions).toHaveLength(2);
  });

  test("it defaults to empty permissions if none are returned", async () => {
    jest.spyOn(SolidClientFns, "unstable_fetchFile").mockResolvedValue({
      text: "file contents",
      internal_resourceInfo: {
        contentType: "type",
      },
    });

    const { permissions } = await fetchFileWithAcl("some iri");

    expect(permissions).toHaveLength(0);
  });

  test("it defaults to an empty array if there is no type", async () => {
    jest.spyOn(SolidClientFns, "unstable_fetchFile").mockResolvedValue({
      text: "file contents",
      internal_resourceInfo: {},
    });

    const { types } = await fetchFileWithAcl("some iri");

    expect(types).toHaveLength(0);
  });
});

describe("fetchResourceWithAcl", () => {
  test("it returns a normalized dataset", async () => {
    const perms = {
      owner: {
        read: true,
        write: true,
        append: true,
        control: true,
      },
      collaborator: {
        read: true,
        write: false,
        append: true,
        control: false,
      },
    };

    const expectedIri = "https://user.dev.inrupt.net/public/";

    jest
      .spyOn(SolidClientFns, "unstable_fetchLitDatasetWithAcl")
      .mockResolvedValueOnce(createContainer());
    jest
      .spyOn(SolidClientFns, "unstable_getAgentAccessAll")
      .mockResolvedValueOnce(perms);

    const normalizePermissionsFn = jest.fn().mockResolvedValue([
      {
        webId: Object.keys(perms)[0],
        alias: displayPermissions(Object.values(perms)[0]),
        acl: Object.values(perms)[0],
      },
      {
        webId: Object.keys(perms)[1],
        alias: displayPermissions(Object.values(perms)[1]),
        acl: Object.values(perms)[1],
      },
    ]);

    const normalizedResource = await fetchResourceWithAcl(
      expectedIri,
      jest.fn(),
      normalizePermissionsFn
    );
    const {
      iri,
      contains,
      modified,
      mtime,
      size,
      types,
      permissions,
    } = normalizedResource;
    const ownerPerms = permissions[0];
    const collaboratorPerms = permissions[1];

    expect(iri).toEqual(expectedIri);
    expect(contains).toBeInstanceOf(Array);
    expect(modified).toEqual(TIMESTAMP);
    expect(mtime).toEqual(1591131561.195);
    expect(size).toEqual(4096);
    expect(types).toContain("Container");
    expect(types).toContain("BasicContainer");

    expect(ownerPerms.webId).toEqual("owner");
    expect(ownerPerms.alias).toEqual(ACL.CONTROL.alias);
    expect(ownerPerms.acl).toMatchObject(perms.owner);

    expect(collaboratorPerms.webId).toEqual("collaborator");
    expect(collaboratorPerms.alias).toEqual("Append");
    expect(collaboratorPerms.acl).toMatchObject(perms.collaborator);
  });

  test("it returns no permissions when acl is not returned", async () => {
    jest
      .spyOn(SolidClientFns, "unstable_fetchLitDatasetWithAcl")
      .mockResolvedValueOnce(createContainer());

    jest
      .spyOn(SolidClientFns, "unstable_getAgentAccessAll")
      .mockResolvedValueOnce(undefined);

    const { permissions, acl: access } = await fetchResourceWithAcl(
      "https://user.dev.inrupt.net/public/"
    );

    expect(permissions).toMatchObject([]);
    expect(access).toBeUndefined();
  });
});

describe("getResource", () => {
  test("it returns a dataset and an iri", async () => {
    const dataset = createContainer();
    jest
      .spyOn(SolidClientFns, "fetchLitDataset")
      .mockResolvedValueOnce(dataset);
    const iri = "https://user.example.com";
    const { response } = await getResource(iri, jest.fn());

    expect(response.iri).toEqual(iri);
    expect(response.dataset).toEqual(dataset);
  });

  test("it returns an error message when it throws an error", async () => {
    jest.spyOn(SolidClientFns, "fetchLitDataset").mockImplementationOnce(() => {
      throw new Error("boom");
    });
    const iri = "https://user.example.com";
    const { error } = await getResource(iri, jest.fn());

    expect(error).toEqual("boom");
  });
});

describe("getResourceName", () => {
  test("it returns the resource name string when given a resource pathname", () => {
    const resourceName = getResourceName("/public/games/tictactoe/data.ttl");

    expect(resourceName).toEqual("data.ttl");
  });
  test("it returns the resource name string when given a container pathname", () => {
    const resourceName = getResourceName("/public/games/tictactoe/");

    expect(resourceName).toEqual("tictactoe");
  });

  test("it returns the decoded resource name when spaces have been URI encoded", () => {
    const resourceName = getResourceName("public/notes/Hello%20World.txt");

    expect(resourceName).toEqual("Hello World.txt");
  });
});

describe("getResourceWithPermissions", () => {
  test("it returns a dataset, an iri, and permissions", async () => {
    const iri = "https://user.example.com";
    const dataset = createContainer(iri);
    const fetch = jest.fn();
    const access = { [iri]: ACL.CONTROL.acl };
    jest
      .spyOn(SolidClientFns, "unstable_fetchLitDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest
      .spyOn(SolidClientFns, "unstable_getAgentAccessAll")
      .mockResolvedValueOnce(access);

    const { response } = await getResourceWithPermissions(iri, fetch);

    expect(response.iri).toEqual(iri);
    expect(response.dataset).toEqual(dataset);
    expect(response.permissions).toMatchObject([
      {
        acl: ACL.CONTROL.acl,
        alias: ACL.CONTROL.alias,
        webId: iri,
      },
    ]);
  });

  test("it returns an error message when it throws an error", async () => {
    jest
      .spyOn(SolidClientFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });
    const iri = "https://user.example.com";
    const { error } = await getResourceWithPermissions(iri, jest.fn());

    expect(error).toEqual("boom");
  });
});

describe("normalizePermissions", () => {
  test("returns a normalized version of the permissions", () => {
    const webId = "https://user.example.com/card#me";
    const permissions = { [webId]: ACL.CONTROL.acl };
    const [normalized] = normalizePermissions(permissions);

    expect(normalized.webId).toEqual(webId);
    expect(normalized.acl).toMatchObject(ACL.CONTROL.acl);
    expect(normalized.alias).toEqual(ACL.CONTROL.alias);
  });

  test("it returns an empty array when given nothing", () => {
    const normalized = normalizePermissions();

    expect(normalized).toHaveLength(0);
  });
});

describe("labelOrUrl", () => {
  test("it returns the hash if it exists", () => {
    const label = labelOrUrl("https://namespace.com/test#attribute");
    expect(label).toEqual("attribute");
  });

  test("it returns the complete url if no hash exists", () => {
    const url = labelOrUrl("https://namespace.com/test");
    expect(url).toEqual("https://namespace.com/test");
  });

  test("when the hash is 'this', it is translated to 'root'", () => {
    const label = labelOrUrl("https://namespace.com/test#this");
    expect(label).toEqual("root");
  });
});

describe("saveResource", () => {
  test("it saves the given resource", async () => {
    const fetch = jest.fn();
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockResolvedValueOnce("resource");

    const { response } = await saveResource(
      { dataset: "dataset", iri: "iri" },
      fetch
    );

    expect(SolidClientFns.saveSolidDatasetAt).toHaveBeenCalledWith(
      "iri",
      "dataset",
      { fetch }
    );
    expect(response).toEqual("resource");
  });

  test("it returns an error response if the save fails", async () => {
    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveResource(
      { dataset: "dataset", iri: "iri" },
      jest.fn()
    );

    expect(error).toEqual("boom");
  });
});

describe("saveResourceWithPermissions", () => {
  test("it responds with an error if the save fails", async () => {
    const iri = "https://user.example.com/resource";
    const fetch = jest.fn();

    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveResourceWithPermissions(
      {
        dataset: "dataset",
        iri,
      },
      fetch
    );

    expect(error).toEqual("boom");
  });

  test("it responds with an error if fetching the resource with permissions fails", async () => {
    const iri = "https://user.example.com/resource";
    const fetch = jest.fn();

    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockResolvedValueOnce("dataset");

    jest
      .spyOn(SolidClientFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveResourceWithPermissions(
      {
        dataset: "dataset",
        iri,
      },
      fetch
    );

    expect(error).toEqual("boom");
  });

  test("it responds with an error if saving the permissions fails", async () => {
    const iri = "https://user.example.com/resource";
    const fetch = jest.fn();
    const access = {
      [iri]: ACL.CONTROL.acl,
    };

    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockResolvedValueOnce("dataset");

    jest
      .spyOn(SolidClientFns, "unstable_fetchLitDatasetWithAcl")
      .mockResolvedValue("dataset");

    jest
      .spyOn(SolidClientFns, "unstable_getAgentAccessAll")
      .mockReturnValue(access);

    jest
      .spyOn(SolidClientFns, "unstable_saveAclFor")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveResourceWithPermissions(
      {
        dataset: "dataset",
        iri,
      },
      fetch
    );

    expect(error).toEqual("boom");
  });

  test("it responds with a resource with permissions", async () => {
    const iri = "https://user.example.com/resource";
    const access = {
      [iri]: ACL.CONTROL.acl,
    };

    jest
      .spyOn(SolidClientFns, "saveSolidDatasetAt")
      .mockResolvedValueOnce("dataset");

    jest
      .spyOn(SolidClientFns, "unstable_fetchLitDatasetWithAcl")
      .mockResolvedValue("dataset");

    jest
      .spyOn(SolidClientFns, "unstable_getAgentAccessAll")
      .mockReturnValueOnce(access)
      .mockReturnValueOnce(access);

    jest
      .spyOn(SolidClientFns, "unstable_saveAclFor")
      .mockResolvedValueOnce("saved acl");

    const { response } = await saveResourceWithPermissions({
      dataset: "dataset",
      iri,
    });

    expect(response.iri).toEqual(iri);
  });
});

describe("saveResourcePermissions", () => {
  test("it returns an error if the permission save fails", async () => {
    jest
      .spyOn(SolidClientFns, "unstable_saveAclFor")
      .mockImplementationOnce(() => {
        throw new Error("boom");
      });

    const { error } = await saveResourcePermissions({
      dataset: "dataset",
      iri: "iri",
    });

    expect(error).toEqual("boom");
  });

  test("it saves a resource with a default control access", async () => {
    const webId = "https://user.example.com/card";
    const access = { [webId]: ACL.CONTROL.acl };
    const resource = {
      dataset: "dataset",
      iri: "iri",
    };

    jest
      .spyOn(SolidClientFns, "unstable_saveAclFor")
      .mockResolvedValueOnce("response");

    jest
      .spyOn(SolidClientFns, "unstable_getAgentAccessAll")
      .mockReturnValue(access);

    const { response } = await saveResourcePermissions(resource);
    const [permission] = response.permissions;

    expect(SolidClientFns.unstable_saveAclFor).toHaveBeenCalledWith(
      "dataset",
      ACL.CONTROL.acl
    );

    expect(response.dataset).toEqual("dataset");
    expect(response.iri).toEqual("iri");
    expect(permission.acl).toMatchObject(ACL.CONTROL.acl);
    expect(permission.webId).toEqual(webId);
  });
});

describe("createResourceAcl", () => {
  test("it default to control access for the given resource", () => {
    const resource = { dataset: "dataset" };
    const webId = "https://user.example.com";

    jest.spyOn(permissionFns, "defineAcl").mockImplementationOnce(jest.fn());

    createResourceAcl({ dataset: "dataset" }, webId);

    expect(permissionFns.defineAcl).toHaveBeenCalledWith(
      resource.dataset,
      webId,
      ACL.CONTROL.acl
    );
  });
});
