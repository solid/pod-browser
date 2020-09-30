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
import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import {
  ACL,
  aclToString,
  createAccessMap,
  defineAcl,
  displayPermissions,
  getPermissions,
  isEmptyAccess,
  isEqualACL,
  normalizePermissions,
  saveAllPermissions,
} from "./permissions";

describe("aclToString", () => {
  test("it converts the acl to a standardized string", () => {
    const access = createAccessMap(true, true, true, true);

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
    const access = createAccessMap(true, true, true, true);

    expect(isEqualACL(access, access)).toEqual(true);
  });

  test("it returns false when acls are NOT identical", () => {
    const aclA = createAccessMap(true, true, true, true);
    const aclB = createAccessMap(true, true, true, false);

    expect(isEqualACL(aclA, aclB)).toEqual(false);
  });
});

describe("displayPermissions", () => {
  test("it returns the CONTROL alias when all options are true", () => {
    const perms = displayPermissions(createAccessMap(true, true, true, true));

    expect(perms).toEqual(ACL.CONTROL.alias);
  });

  test("it returns the NONE alias when all options are false", () => {
    const perms = displayPermissions(
      createAccessMap(false, false, false, false)
    );

    expect(perms).toEqual(ACL.NONE.alias);
  });

  test("it returns the APPEND alias when append permissions are true and edit is false", () => {
    const perms = displayPermissions(createAccessMap(true, false, true, false));

    expect(perms).toEqual(ACL.APPEND.alias);
  });

  test("it returns the WRITE alias when write permissions are true", () => {
    const perms = displayPermissions(createAccessMap(true, true, true, false));

    expect(perms).toEqual(ACL.WRITE.alias);
  });

  test("it returns the READ alias when read permissions are true", () => {
    const perms = displayPermissions(
      createAccessMap(true, false, false, false)
    );

    expect(perms).toEqual(ACL.READ.alias);
  });

  test("it returns 'Custom' when the permissions don't follow a template", () => {
    const perms = displayPermissions(
      createAccessMap(false, true, false, false)
    );

    expect(perms).toEqual("Custom");
  });
});

describe("normalizePermissions", () => {
  test("it returns the webId and the human-friendly permission name", async () => {
    const access = {
      "https://pod.acl1.com/card#me": createAccessMap(
        true,
        false,
        false,
        false
      ),
      "https://pod.acl2.com/card#me": createAccessMap(true, true, true, true),
      "https://pod.acl3.com/card#me": createAccessMap(true, true, true, false),
      "https://pod.acl4.com/card#me": createAccessMap(
        false,
        false,
        false,
        false
      ),
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
      acl1: createAccessMap(true, false, false, false),
      "mailto:example@example.com": createAccessMap(true, true, true, true),
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

describe("createAccessMap", () => {
  it("returns an object with all permissions set to false by default", () =>
    expect(createAccessMap()).toEqual({
      [ACL.READ.key]: false,
      [ACL.WRITE.key]: false,
      [ACL.APPEND.key]: false,
      [ACL.CONTROL.key]: false,
    }));

  it("sets read key first", () =>
    expect(createAccessMap(true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: false,
      [ACL.APPEND.key]: false,
      [ACL.CONTROL.key]: false,
    }));

  it("sets write key second", () =>
    expect(createAccessMap(true, true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: true,
      [ACL.APPEND.key]: false,
      [ACL.CONTROL.key]: false,
    }));

  it("sets append key second", () =>
    expect(createAccessMap(true, true, true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: true,
      [ACL.APPEND.key]: true,
      [ACL.CONTROL.key]: false,
    }));

  it("sets control key second", () =>
    expect(createAccessMap(true, true, true, true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: true,
      [ACL.APPEND.key]: true,
      [ACL.CONTROL.key]: true,
    }));
});

describe("isEmptyAccess", () => {
  it("returns true on empty access maps", () => {
    expect(isEmptyAccess(createAccessMap())).toBe(true);
    expect(isEmptyAccess(createAccessMap(true))).toBe(false);
    expect(isEmptyAccess(createAccessMap(false, true))).toBe(false);
    expect(isEmptyAccess(createAccessMap(false, false, true))).toBe(false);
    expect(isEmptyAccess(createAccessMap(false, false, false, true))).toBe(
      false
    );
  });
});

describe("saveAllPermissions", () => {
  const iri = "http://example.com/dataset";
  const webId = "webId";
  const access = createAccessMap(true, true, true, true);
  const dataset = mockSolidDatasetFrom(iri);
  const aclDataset = mockSolidDatasetFrom(iri);
  const updatedAcl = mockSolidDatasetFrom(iri);

  test("it saves the new permissions for specific resource", async () => {
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
      .mockImplementationOnce(jest.fn().mockResolvedValueOnce("aclDataset"));

    jest
      .spyOn(solidClientFns, "getResourceInfoWithAcl")
      .mockResolvedValueOnce("datasetWithAcl");

    const fetch = jest.fn();
    const { response } = await saveAllPermissions(
      dataset,
      webId,
      access,
      fetch
    );

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
    expect(solidClientFns.getResourceInfoWithAcl).toHaveBeenCalledWith(iri, {
      fetch,
    });

    expect(response).toEqual("datasetWithAcl");
  });

  test("it saves the new permissions based on fallback resource", async () => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(false);
    jest.spyOn(solidClientFns, "hasFallbackAcl").mockReturnValueOnce(true);

    jest
      .spyOn(solidClientFns, "createAclFromFallbackAcl")
      .mockReturnValueOnce(aclDataset);

    jest
      .spyOn(solidClientFns, "setAgentResourceAccess")
      .mockReturnValue(updatedAcl);

    jest
      .spyOn(solidClientFns, "saveAclFor")
      .mockImplementationOnce(jest.fn().mockResolvedValueOnce("aclDataset"));

    jest
      .spyOn(solidClientFns, "getResourceInfoWithAcl")
      .mockResolvedValueOnce("datasetWithAcl");

    const fetch = jest.fn();
    const { response } = await saveAllPermissions(
      dataset,
      webId,
      access,
      fetch
    );
    expect(solidClientFns.createAclFromFallbackAcl).toHaveBeenCalledWith(
      dataset
    );
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
    expect(solidClientFns.getResourceInfoWithAcl).toHaveBeenCalledWith(iri, {
      fetch,
    });

    expect(response).toEqual("datasetWithAcl");
  });

  test("it returns an error message if the ACL resource is not accessible", async () => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(false);

    const { error } = await saveAllPermissions(
      dataset,
      webId,
      access,
      () => {}
    );

    expect(error).toEqual("dataset does not have accessible ACL");
  });

  test("it returns an error message if the dataset has neither a resource ACL nor a fallback ACL", async () => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(false);
    jest.spyOn(solidClientFns, "hasFallbackAcl").mockReturnValueOnce(false);

    const { error } = await saveAllPermissions(
      dataset,
      webId,
      access,
      () => {}
    );

    expect(error).toEqual("unable to access ACL");
  });

  test("it returns an error message if can't get resource ACL", async () => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);
    jest.spyOn(solidClientFns, "getResourceAcl").mockReturnValueOnce(null);

    const { error } = await saveAllPermissions(
      dataset,
      webId,
      access,
      () => {}
    );

    expect(error).toEqual("aclDataset is empty");
  });

  test("it returns an error if the updated ACL is empty", async () => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);
    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);
    jest.spyOn(solidClientFns, "setAgentResourceAccess").mockReturnValue(null);

    const { error } = await saveAllPermissions(
      dataset,
      webId,
      access,
      () => {}
    );

    expect(error).toEqual("updatedAcl is empty");
  });

  test("it returns an error if the save response is empty", async () => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);
    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);
    jest
      .spyOn(solidClientFns, "setAgentResourceAccess")
      .mockReturnValue(updatedAcl);
    jest.spyOn(solidClientFns, "saveAclFor").mockResolvedValueOnce(null);

    const { error } = await saveAllPermissions(
      dataset,
      webId,
      access,
      () => {}
    );

    expect(error).toEqual("response is empty");
  });

  test("it returns an error response if there is no dataset", async () => {
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);
    jest
      .spyOn(solidClientFns, "getResourceAcl")
      .mockReturnValueOnce(aclDataset);
    jest
      .spyOn(solidClientFns, "setAgentResourceAccess")
      .mockReturnValue(updatedAcl);
    jest
      .spyOn(solidClientFns, "saveAclFor")
      .mockResolvedValueOnce("some response");
    jest
      .spyOn(solidClientFns, "getResourceInfoWithAcl")
      .mockResolvedValueOnce(null);

    const { error } = await saveAllPermissions(
      dataset,
      webId,
      access,
      () => {}
    );

    expect(error).toEqual("dataset is empty");
  });
});

describe("getPermissions", () => {
  const datasetUri = "http://example.com/dataset";
  const datasetWithAcl = mockSolidDatasetFrom(datasetUri);
  const fallbackAcl = "fallbackAcl";

  it("normalizes permission if they are fetched from the resource's ACL resource", async () => {
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValue(true);
    jest.spyOn(solidClientFns, "getAgentAccessAll").mockReturnValue([]);
    await expect(getPermissions(datasetWithAcl, () => {})).resolves.toEqual([]);
    expect(solidClientFns.hasResourceAcl).toHaveBeenCalledWith(datasetWithAcl);
    expect(solidClientFns.getAgentAccessAll).toHaveBeenCalledWith(
      datasetWithAcl
    );
  });

  it("normalizes permission if they are fetched from the resource's fallback ACL resource", async () => {
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValue(false);
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(true);
    jest.spyOn(solidClientFns, "getFallbackAcl").mockReturnValue(fallbackAcl);
    jest.spyOn(solidClientFns, "getAgentDefaultAccessAll").mockReturnValue([]);
    await expect(getPermissions(datasetWithAcl, () => {})).resolves.toEqual([]);
    expect(solidClientFns.hasAccessibleAcl).toHaveBeenCalledWith(
      datasetWithAcl
    );
    expect(solidClientFns.getFallbackAcl).toHaveBeenCalledWith(datasetWithAcl);
    expect(solidClientFns.getAgentDefaultAccessAll).toHaveBeenCalledWith(
      fallbackAcl
    );
  });

  it("throws an error if ACL is not accessible", async () => {
    jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValue(false);
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(false);
    await expect(getPermissions(datasetWithAcl, () => {})).rejects.toEqual(
      new Error(`No access to ACL for ${datasetUri}`)
    );
  });
});
