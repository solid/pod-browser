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

import {
  addMockFallbackAclTo,
  addMockResourceAclTo,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import * as solidClientFns from "@inrupt/solid-client";
import * as profileHelperFns from "../../solidClientHelpers/profile";
import { ACL, createAccessMap } from "../../solidClientHelpers/permissions";
import WacAccessControlStrategy, { noAclError } from "./index";
import { chain } from "../../solidClientHelpers/utils";

const url = "http://example.com";
const fetch = () => {};
const resourceInfo = mockSolidDatasetFrom(url);
const resourceInfoWithAcl = chain(
  mockSolidDatasetFrom(url),
  (d) => addMockResourceAclTo(d),
  (d) => addMockFallbackAclTo(d)
);

describe("WacAccessControlStrategy", () => {
  let wac;

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getResourceInfoWithAcl")
      .mockResolvedValue(resourceInfoWithAcl);
  });

  describe("init", () => {
    beforeEach(async () => {
      wac = await WacAccessControlStrategy.init(resourceInfo, fetch);
    });

    it("uses getResourceInfoWithAcl to get data", () =>
      expect(solidClientFns.getResourceInfoWithAcl).toHaveBeenCalledWith(url, {
        fetch,
      }));

    it("exposes the methods we expect for a access control strategy", () =>
      [
        "deleteFile",
        "getPermissions",
        "savePermissionsForAgent",
      ].forEach((method) => expect(wac[method]).toBeDefined()));

    it("throws an error if no ACL resource is available", async () => {
      solidClientFns.getResourceInfoWithAcl.mockResolvedValue(resourceInfo);

      await expect(
        WacAccessControlStrategy.init(resourceInfo, fetch)
      ).rejects.toEqual(new Error(noAclError));
    });
  });

  describe("deleteFile", () => {
    beforeEach(async () => {
      wac = await WacAccessControlStrategy.init(resourceInfo, fetch);
    });

    it("triggers solidClientFns.deleteFile", async () => {
      const response = "response";
      jest.spyOn(solidClientFns, "deleteFile").mockResolvedValue(response);
      await expect(wac.deleteFile()).resolves.toBe(response);
      expect(solidClientFns.deleteFile).toHaveBeenCalledWith(url, { fetch });
    });
  });

  describe("getPermissions", () => {
    const fallbackAcl = "fallbackAcl";

    beforeEach(async () => {
      wac = await WacAccessControlStrategy.init(resourceInfo, fetch);
    });

    it("normalizes permission if they are fetched from the resource's ACL resource", async () => {
      jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValue(true);
      jest.spyOn(solidClientFns, "getAgentAccessAll").mockReturnValue([]);
      await expect(wac.getPermissions()).resolves.toEqual([]);
      expect(solidClientFns.hasResourceAcl).toHaveBeenCalledWith(
        resourceInfoWithAcl
      );
      expect(solidClientFns.getAgentAccessAll).toHaveBeenCalledWith(
        resourceInfoWithAcl
      );
    });

    it("normalizes permission if they are fetched from the resource's fallback ACL resource", async () => {
      jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValue(false);
      jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(true);
      jest.spyOn(solidClientFns, "getFallbackAcl").mockReturnValue(fallbackAcl);
      jest
        .spyOn(solidClientFns, "getAgentDefaultAccessAll")
        .mockReturnValue([]);
      await expect(
        wac.getPermissions(resourceInfoWithAcl, () => {})
      ).resolves.toEqual([]);
      expect(solidClientFns.hasAccessibleAcl).toHaveBeenCalledWith(
        resourceInfoWithAcl
      );
      expect(solidClientFns.getFallbackAcl).toHaveBeenCalledWith(
        resourceInfoWithAcl
      );
      expect(solidClientFns.getAgentDefaultAccessAll).toHaveBeenCalledWith(
        fallbackAcl
      );
    });

    it("throws an error if ACL is not accessible", async () => {
      jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValue(false);
      jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(false);
      await expect(
        wac.getPermissions(resourceInfoWithAcl, () => {})
      ).rejects.toEqual(new Error(`No access to ACL for ${url}`));
    });
  });

  describe("normalizePermissions", () => {
    const webId1 = "https://pod.acl1.com/card#me";
    const webId2 = "https://pod.acl2.com/card#me";
    const webId3 = "https://pod.acl3.com/card#me";
    const webId4 = "https://pod.acl4.com/card#me";
    const expectedProfile = {
      avatar: "http://example.com/avatar.png",
      name: "string",
      nickname: "string",
    };

    beforeEach(async () => {
      jest
        .spyOn(profileHelperFns, "fetchProfile")
        .mockResolvedValue(expectedProfile);
      wac = await WacAccessControlStrategy.init(resourceInfo, fetch);
    });

    test("it returns the webId and the human-friendly permission name", async () => {
      const access = {
        [webId1]: createAccessMap(true),
        [webId2]: createAccessMap(true, true, true, true),
        [webId3]: createAccessMap(true, true, true),
        [webId4]: createAccessMap(),
      };

      const [perms1, perms2, perms3, perms4] = await wac.normalizePermissions(
        access
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
        acl1: createAccessMap(true),
        "mailto:example@example.com": createAccessMap(true, true, true, true),
      };

      const permissions = await wac.normalizePermissions(access);

      expect(permissions).toHaveLength(0);
    });
  });

  describe("saveAllPermissions", () => {
    const iri = "http://example.com/dataset";
    const webId = "webId";
    const access = createAccessMap(true, true, true, true);
    const dataset = mockSolidDatasetFrom(iri);
    const aclDataset = mockSolidDatasetFrom(iri);
    const updatedAcl = mockSolidDatasetFrom(iri);

    beforeEach(async () => {
      wac = await WacAccessControlStrategy.init(resourceInfo, fetch);
    });

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

      const { response } = await wac.savePermissionsForAgent(webId, access);

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
      expect(solidClientFns.getResourceInfoWithAcl).toHaveBeenCalledWith(url, {
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

      const { response } = await wac.savePermissionsForAgent(webId, access);

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
      expect(solidClientFns.getResourceInfoWithAcl).toHaveBeenCalledWith(url, {
        fetch,
      });

      expect(response).toEqual("datasetWithAcl");
    });

    test("it returns an error message if the ACL resource is not accessible", async () => {
      jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(false);

      const { error } = await wac.savePermissionsForAgent(webId, access);

      expect(error).toEqual("dataset does not have accessible ACL");
    });

    test("it returns an error message if the dataset has neither a resource ACL nor a fallback ACL", async () => {
      jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
      jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(false);
      jest.spyOn(solidClientFns, "hasFallbackAcl").mockReturnValueOnce(false);

      const { error } = await wac.savePermissionsForAgent(webId, access);

      expect(error).toEqual("unable to access ACL");
    });

    test("it returns an error message if can't get resource ACL", async () => {
      jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
      jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);
      jest.spyOn(solidClientFns, "getResourceAcl").mockReturnValueOnce(null);

      const { error } = await wac.savePermissionsForAgent(webId, access);

      expect(error).toEqual("aclDataset is empty");
    });

    test("it returns an error if the updated ACL is empty", async () => {
      jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValueOnce(true);
      jest.spyOn(solidClientFns, "hasResourceAcl").mockReturnValueOnce(true);
      jest
        .spyOn(solidClientFns, "getResourceAcl")
        .mockReturnValueOnce(aclDataset);
      jest
        .spyOn(solidClientFns, "setAgentResourceAccess")
        .mockReturnValue(null);

      const { error } = await wac.savePermissionsForAgent(webId, access);

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

      const { error } = await wac.savePermissionsForAgent(webId, access);

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

      const { error } = await wac.savePermissionsForAgent(webId, access);

      expect(error).toEqual("dataset is empty");
    });
  });
});
