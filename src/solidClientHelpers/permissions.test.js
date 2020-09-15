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

import * as solidClientFns from "@inrupt/solid-client";
import {
  ACL,
  aclToString,
  defineAcl,
  displayPermissions,
  getThirdPartyPermissions,
  getUserPermissions,
  isEqualACL,
  isUserOrMatch,
  normalizePermissions,
  parseStringAcl,
  permissionsFromWacAllowHeaders,
  saveDefaultPermissions,
  savePermissions,
} from "./permissions";

describe("parseStringAcl", () => {
  test("it parses a list of string permissions into an Access", () => {
    const fullControl = parseStringAcl("read write append control");

    expect(fullControl.read).toBe(true);
    expect(fullControl.write).toBe(true);
    expect(fullControl.append).toBe(true);
    expect(fullControl.control).toBe(true);

    const readWrite = parseStringAcl("read write");

    expect(readWrite.read).toBe(true);
    expect(readWrite.write).toBe(true);
    expect(readWrite.append).toBe(false);
    expect(readWrite.control).toBe(false);

    const noAccess = parseStringAcl("");

    expect(noAccess.read).toBe(false);
    expect(noAccess.write).toBe(false);
    expect(noAccess.append).toBe(false);
    expect(noAccess.control).toBe(false);
  });
});

describe("permissionsFromWacAllowHeaders", () => {
  test("it parses wac-allow headers into NormalizedPermissions", () => {
    const wacAllow = 'user="read write append control",public="read"';
    const [user, publicPerms] = permissionsFromWacAllowHeaders(wacAllow);

    expect(user.webId).toEqual("user");
    expect(user.alias).toEqual(ACL.CONTROL.alias);
    expect(user.acl).toMatchObject({
      read: true,
      write: true,
      append: true,
      control: true,
    });
    expect(user.profile.name).toEqual("user");

    expect(publicPerms.webId).toEqual("public");
    expect(publicPerms.alias).toEqual(ACL.READ.alias);
    expect(publicPerms.acl).toMatchObject({
      read: true,
      write: false,
      append: false,
      control: false,
    });
    expect(publicPerms.profile.name).toEqual("public");
  });

  test("it returns an emtpy array when given no string", () => {
    expect(permissionsFromWacAllowHeaders()).toBeInstanceOf(Array);
    expect(permissionsFromWacAllowHeaders()).toHaveLength(0);
  });
});

describe("isUserOrMatch", () => {
  test("it returns true when given two matching ids", () => {
    expect(isUserOrMatch("webId", "webId")).toBe(true);
  });

  test("it returns false when given two unique ids", () => {
    expect(isUserOrMatch("webId", "otherId")).toBe(false);
  });

  test("it returns true when given the string 'user'", () => {
    expect(isUserOrMatch("user", "anything")).toBe(true);
  });
});

describe("getUserPermissions", () => {
  test("it returns the permissions for the given webId", async () => {
    const access = {
      "https://host.pod.com/acl1/card#me": {
        read: true,
        write: false,
        control: false,
        append: false,
      },
      "https://host.pod.com/acl2/card#me": {
        read: true,
        write: true,
        control: true,
        append: true,
      },
      "https://host.pod.com/acl3/card#me": {
        read: true,
        write: true,
        control: false,
        append: true,
      },
      "https://host.pod.com/acl4/card#me": {
        read: false,
        write: false,
        control: false,
        append: false,
      },
    };

    const normalizedPermissions = await normalizePermissions(
      access,
      jest.fn(),
      jest.fn().mockResolvedValue(null)
    );
    const permissions = getUserPermissions(
      "https://host.pod.com/acl1/card#me",
      normalizedPermissions
    );

    expect(permissions.webId).toEqual("https://host.pod.com/acl1/card#me");
    expect(permissions.alias).toEqual(ACL.READ.alias);
    expect(permissions.acl).toMatchObject(
      access["https://host.pod.com/acl1/card#me"]
    );
  });

  test("it returns null if given no permissions", () => {
    expect(getUserPermissions("webId")).toBeNull();
  });

  test("it returns null if it can't find a permission matching the web id", () => {
    const permissions = [
      {
        webId: "test",
        alias: ACL.READ.alias,
        acl: {
          read: true,
          write: false,
          control: false,
          append: false,
        },
        profile: { webId: "test" },
      },
    ];

    const userPermissions = getUserPermissions("acl1", permissions);

    expect(userPermissions).toBeNull();
  });
});

describe("getThirdPartyPermissions", () => {
  test("it returns the permissions that don't belong to the given webId", async () => {
    const access = {
      "https://pod.host.com/acl1/card#me": {
        read: true,
        write: false,
        control: false,
        append: false,
      },
      "https://pod.host.com/acl2/card#me": {
        read: true,
        write: true,
        control: true,
        append: true,
      },
      "https://pod.host.com/acl3/card#me": {
        read: true,
        write: true,
        control: false,
        append: true,
      },
      "https://pod.host.com/acl4/card#me": {
        read: false,
        write: false,
        control: false,
        append: false,
      },
    };

    const normalizedPermissions = await normalizePermissions(
      access,
      jest.fn(),
      jest.fn().mockResolvedValue(null)
    );
    const thirdPartyPermissions = getThirdPartyPermissions(
      "https://pod.host.com/acl1/card#me",
      normalizedPermissions
    );
    const [perms2, perms3, perms4] = thirdPartyPermissions;

    expect(thirdPartyPermissions.map(({ webId }) => webId)).not.toContain(
      "https://pod.host.com/acl1/card#me"
    );

    expect(perms2.webId).toEqual("https://pod.host.com/acl2/card#me");
    expect(perms2.alias).toEqual(ACL.CONTROL.alias);
    expect(perms2.acl).toMatchObject(
      access["https://pod.host.com/acl2/card#me"]
    );

    expect(perms3.webId).toEqual("https://pod.host.com/acl3/card#me");
    expect(perms3.alias).toEqual(ACL.WRITE.alias);
    expect(perms3.acl).toMatchObject(
      access["https://pod.host.com/acl3/card#me"]
    );

    expect(perms4.webId).toEqual("https://pod.host.com/acl4/card#me");
    expect(perms4.alias).toEqual(ACL.NONE.alias);
    expect(perms4.acl).toMatchObject(
      access["https://pod.host.com/acl4/card#me"]
    );
  });

  test("it returns an empty Array if given no permissions", () => {
    expect(getThirdPartyPermissions("webId")).toBeInstanceOf(Array);
    expect(getThirdPartyPermissions("webId")).toHaveLength(0);
  });
});

describe("aclToString", () => {
  test("it converts the acl to a standardized string", () => {
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };

    expect(aclToString(access)).toEqual(
      "read:true,write:true,append:true,control:true"
    );
  });
});

describe("defineAcl", () => {
  test("it sets a default and resource access of CONTROL for a given dataset and webId", () => {
    jest.spyOn(solidClientFns, "createAcl").mockImplementationOnce(() => "acl");

    jest
      .spyOn(solidClientFns, "setAgentResourceAccess")
      .mockImplementationOnce((x) => x);

    jest
      .spyOn(solidClientFns, "setAgentDefaultAccess")
      .mockImplementationOnce((x) => x);

    const access = defineAcl("dataset", "webId");

    expect(solidClientFns.createAcl).toHaveBeenCalledWith("dataset");
    expect(solidClientFns.setAgentResourceAccess).toHaveBeenCalledWith(
      "acl",
      "webId",
      ACL.CONTROL.acl
    );
    expect(solidClientFns.setAgentDefaultAccess).toHaveBeenCalledWith(
      "acl",
      "webId",
      ACL.CONTROL.acl
    );
    expect(access).toEqual("acl");
  });

  test("it sets a given access to default and resource for a given dataset and webId", () => {
    jest.spyOn(solidClientFns, "createAcl").mockImplementationOnce(() => "acl");

    jest
      .spyOn(solidClientFns, "setAgentResourceAccess")
      .mockImplementationOnce((x) => x);

    jest
      .spyOn(solidClientFns, "setAgentDefaultAccess")
      .mockImplementationOnce((x) => x);

    const access = defineAcl("dataset", "webId", ACL.READ.acl);

    expect(solidClientFns.createAcl).toHaveBeenCalledWith("dataset");
    expect(solidClientFns.setAgentResourceAccess).toHaveBeenCalledWith(
      "acl",
      "webId",
      ACL.READ.acl
    );
    expect(solidClientFns.setAgentDefaultAccess).toHaveBeenCalledWith(
      "acl",
      "webId",
      ACL.READ.acl
    );
    expect(access).toEqual("acl");
  });
});

describe("isEqualACL", () => {
  test("it returns true when acls are identical", () => {
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };

    expect(isEqualACL(access, access)).toEqual(true);
  });

  test("it returns false when acls are NOT identical", () => {
    const aclA = {
      read: true,
      write: true,
      append: true,
      control: true,
    };

    const aclB = {
      read: true,
      write: true,
      append: true,
      control: false,
    };

    expect(isEqualACL(aclA, aclB)).toEqual(false);
  });
});

describe("displayPermissions", () => {
  test("it returns the CONTROL alias when all options are true", () => {
    const perms = displayPermissions({
      read: true,
      write: true,
      append: true,
      control: true,
    });

    expect(perms).toEqual(ACL.CONTROL.alias);
  });

  test("it returns the NONE alias when all options are false", () => {
    const perms = displayPermissions({
      read: false,
      write: false,
      append: false,
      control: false,
    });

    expect(perms).toEqual(ACL.NONE.alias);
  });

  test("it returns the APPEND alias when append permissions are true and edit is false", () => {
    const perms = displayPermissions({
      read: true,
      write: false,
      append: true,
      control: false,
    });

    expect(perms).toEqual(ACL.APPEND.alias);
  });

  test("it returns the WRITE alias when write permissions are true", () => {
    const perms = displayPermissions({
      read: true,
      write: true,
      append: true,
      control: false,
    });

    expect(perms).toEqual(ACL.WRITE.alias);
  });

  test("it returns the READ alias when read permissions are true", () => {
    const perms = displayPermissions({
      read: true,
      write: false,
      append: false,
      control: false,
    });

    expect(perms).toEqual(ACL.READ.alias);
  });

  test("it returns 'Custom' when the permissions don't follow a template", () => {
    const perms = displayPermissions({
      read: false,
      write: true,
      append: false,
      control: false,
    });

    expect(perms).toEqual("Custom");
  });
});

describe("savePermissions", () => {
  test("it saves the new permissions", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";
    const aclDataset = "aclDataset";
    const updatedAcl = "updatedAcl";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "setAgentResourceAccess")
      .mockReturnValue(updatedAcl);

    jest
      .spyOn(solidClientFns, "saveAclFor")
      .mockImplementationOnce(jest.fn().mockResolvedValueOnce("response"));

    const fetch = jest.fn();
    const { response } = await savePermissions({ iri, webId, access, fetch });

    expect(solidClientFns.getSolidDatasetWithAcl).toHaveBeenCalledWith(iri, {
      fetch,
    });
    expect(solidClientFns.getResourceAcl).toHaveBeenCalledWith(dataset);
    expect(solidClientFns.setAgentResourceAccess).toHaveBeenCalledWith(
      aclDataset,
      webId,
      access
    );
    expect(solidClientFns.saveAclFor).toHaveBeenCalledWith(
      dataset,
      updatedAcl,
      { fetch }
    );

    expect(response).toEqual("response");
  });

  test("it returns an error response if there is no dataset", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(null);

    const { error } = await savePermissions({ iri, webId, access });

    expect(error).toEqual("dataset is empty");
  });

  test("it returns an error message if the dataset has no resource ACL", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(false);

    const { error } = await savePermissions({ iri, webId, access });

    expect(error).toEqual("dataset does not have resource ACL");
  });

  test("it returns an error message if resource has no accessible ACL", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(false);

    const { error } = await savePermissions({ iri, webId, access });

    expect(error).toEqual("dataset does not have accessible ACL");
  });

  test("it returns an error message if can't get resource ACL", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "getResourceAcl").mockReturnValueOnce(null);

    const { error } = await savePermissions({ iri, webId, access });

    expect(error).toEqual("aclDataset is empty");
  });

  test("it returns an error if the updated ACL is empty", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";
    const aclDataset = "aclDataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "setAgentResourceAccess").mockReturnValue(null);

    const { error } = await savePermissions({ iri, webId, access });

    expect(error).toEqual("updatedAcl is empty");
  });

  test("it returns an error if the save response is empty", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";
    const aclDataset = "aclDataset";
    const updatedAcl = "updatedAcl";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "setAgentResourceAccess")
      .mockReturnValue(updatedAcl);

    jest.spyOn(solidClientFns, "saveAclFor").mockResolvedValueOnce(null);

    const { error } = await savePermissions({ iri, webId, access });

    expect(error).toEqual("response is empty");
  });
});

describe("saveDefaultPermissions", () => {
  test("it saves the new default permissions", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";
    const aclDataset = "aclDataset";
    const updatedAcl = "updatedAcl";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "setAgentDefaultAccess")
      .mockReturnValue(updatedAcl);

    jest
      .spyOn(solidClientFns, "saveAclFor")
      .mockImplementationOnce(jest.fn().mockResolvedValueOnce("response"));

    const fetch = jest.fn();

    const { response } = await saveDefaultPermissions({
      iri,
      webId,
      access,
      fetch,
    });

    expect(solidClientFns.getSolidDatasetWithAcl).toHaveBeenCalledWith(iri, {
      fetch,
    });
    expect(solidClientFns.getResourceAcl).toHaveBeenCalledWith(dataset);
    expect(solidClientFns.setAgentDefaultAccess).toHaveBeenCalledWith(
      aclDataset,
      webId,
      access
    );
    expect(solidClientFns.saveAclFor).toHaveBeenCalledWith(
      dataset,
      updatedAcl,
      { fetch }
    );

    expect(response).toEqual("response");
  });

  test("it returns an error response if there is no dataset", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(null);

    const { error } = await saveDefaultPermissions({ iri, webId, access });

    expect(error).toEqual("dataset is empty");
  });

  test("it returns an error message if the dataset has no resource ACL", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(false);

    const { error } = await saveDefaultPermissions({ iri, webId, access });

    expect(error).toEqual("dataset does not have resource ACL");
  });

  test("it returns an error message if resource has no accessible ACL", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(false);

    const { error } = await saveDefaultPermissions({ iri, webId, access });

    expect(error).toEqual("dataset does not have accessible ACL");
  });

  test("it returns an error message if can't get resource ACL", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "getResourceAcl").mockReturnValueOnce(null);

    const { error } = await saveDefaultPermissions({ iri, webId, access });

    expect(error).toEqual("aclDataset is empty");
  });

  test("it returns an error if the updated ACL is empty", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";
    const aclDataset = "aclDataset";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);

    jest.spyOn(solidClientFns, "setAgentDefaultAccess").mockReturnValue(null);

    const { error } = await saveDefaultPermissions({ iri, webId, access });

    expect(error).toEqual("updatedAcl is empty");
  });

  test("it returns an error if the save response is empty", async () => {
    const iri = "iri";
    const webId = "webId";
    const access = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    const dataset = "dataset";
    const aclDataset = "aclDataset";
    const updatedAcl = "updatedAcl";

    jest
      .spyOn(solidClientFns, "getSolidDatasetWithAcl")
      .mockResolvedValueOnce(dataset);

    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);

    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "setAgentDefaultAccess")
      .mockReturnValue(updatedAcl);

    jest.spyOn(solidClientFns, "saveAclFor").mockResolvedValueOnce(null);

    const { error } = await saveDefaultPermissions({ iri, webId, access });

    expect(error).toEqual("response is empty");
  });
});

describe("normalizePermissions", () => {
  test("it returns the webId and the human-friendly permission name", async () => {
    const access = {
      "https://pod.acl1.com/card#me": {
        read: true,
        write: false,
        control: false,
        append: false,
      },
      "https://pod.acl2.com/card#me": {
        read: true,
        write: true,
        control: true,
        append: true,
      },
      "https://pod.acl3.com/card#me": {
        read: true,
        write: true,
        control: false,
        append: true,
      },
      "https://pod.acl4.com/card#me": {
        read: false,
        write: false,
        control: false,
        append: false,
      },
    };

    const expectedProfile = {
      avatar: "http://example.com/avatar.png",
      name: "string",
      nickname: "string",
    };

    const fetchProfileFn = jest.fn().mockResolvedValue(expectedProfile);

    const [perms1, perms2, perms3, perms4] = await normalizePermissions(
      access,
      jest.fn(),
      fetchProfileFn
    );

    expect(perms1.webId).toEqual("https://pod.acl1.com/card#me");
    expect(perms1.alias).toEqual(ACL.READ.alias);
    expect(perms1.acl).toMatchObject(access["https://pod.acl1.com/card#me"]);
    expect(perms1.profile).toMatchObject(expectedProfile);

    expect(perms2.webId).toEqual("https://pod.acl2.com/card#me");
    expect(perms2.alias).toEqual(ACL.CONTROL.alias);
    expect(perms2.acl).toMatchObject(access["https://pod.acl2.com/card#me"]);
    expect(perms2.profile).toMatchObject(expectedProfile);

    expect(perms3.webId).toEqual("https://pod.acl3.com/card#me");
    expect(perms3.alias).toEqual(ACL.WRITE.alias);
    expect(perms3.acl).toMatchObject(access["https://pod.acl3.com/card#me"]);
    expect(perms3.profile).toMatchObject(expectedProfile);

    expect(perms4.webId).toEqual("https://pod.acl4.com/card#me");
    expect(perms4.alias).toEqual(ACL.NONE.alias);
    expect(perms4.acl).toMatchObject(access["https://pod.acl4.com/card#me"]);
    expect(perms4.profile).toMatchObject(expectedProfile);
  });

  test("it filters out invalid webIds", async () => {
    const access = {
      acl1: {
        read: true,
        write: false,
        control: false,
        append: false,
      },
      "mailto:example@example.com": {
        read: true,
        write: true,
        control: true,
        append: true,
      },
    };

    const expectedProfile = {
      avatar: "http://example.com/avatar.png",
      name: "string",
      nickname: "string",
    };

    const fetchProfileFn = jest.fn().mockResolvedValue(expectedProfile);

    const permissions = await normalizePermissions(access, fetchProfileFn);

    expect(permissions).toHaveLength(0);
  });
});
