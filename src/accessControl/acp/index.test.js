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

import * as scFns from "@inrupt/solid-client";
import * as profileFns from "../../solidClientHelpers/profile";
import AcpAccessControlStrategy, {
  addAcpModes,
  convertAcpToAcl,
  createAcpMap,
  getAgentType,
  getNamedPolicyModesAndAgents,
  getOrCreatePermission,
  getPolicyNameFromAccess,
  getOrCreatePolicy,
  getPolicyModesAndAgents,
  getRulesOrCreate,
  getRuleWithAgent,
  noAcrAccessError,
  removePermissionsForAgent,
  setAgents,
} from "./index";
import {
  getPolicyUrl,
  getPoliciesContainerUrl,
  getPolicyResourceUrl,
} from "../../solidClientHelpers/policies";
import { createAccessMap } from "../../solidClientHelpers/permissions";
import { chain } from "../../solidClientHelpers/utils";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
  mockProfileAlice,
} from "../../../__testUtils/mockPersonResource";
import { PUBLIC_AGENT_PREDICATE } from "../../models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../models/contact/authenticated";

jest.mock("../../solidClientHelpers/profile", () => {
  return jest.requireActual("../../solidClientHelpers/profile");
});

const {
  mockSolidDatasetFrom,
  acp_v1: acpFns,
  acp_v2: acpFns2,
  setThing,
} = scFns;

const podUrl = "http://example.com/";
const resourceUrl = "http://example.com/resourceInfo";
const policiesContainerUrl = getPoliciesContainerUrl(podUrl);
const policyResourceUrl = getPolicyUrl(
  mockSolidDatasetFrom(resourceUrl),
  policiesContainerUrl
);
const editorsPolicyResourceUrl = getPolicyResourceUrl(
  mockSolidDatasetFrom(resourceUrl),
  policiesContainerUrl,
  "editors"
);
const viewAndAddPolicyResourceUrl = getPolicyResourceUrl(
  mockSolidDatasetFrom(resourceUrl),
  policiesContainerUrl,
  "viewAndAdd"
);
const readApplyPolicyUrl = `${policyResourceUrl}#readApplyPolicy`;
const readPolicyRuleUrl = `${readApplyPolicyUrl}Rule`;
const editorsPolicyUrl = `${editorsPolicyResourceUrl}#editorsPolicy`;
const editorsPolicyRuleUrl = `${editorsPolicyResourceUrl}Rule`;
const viewAndAddPolicyUrl = `${viewAndAddPolicyResourceUrl}#viewAndAddPolicy`;
const viewAndAddPolicyRuleUrl = `${viewAndAddPolicyResourceUrl}Rule`;
const writeApplyPolicyUrl = `${policyResourceUrl}#writeApplyPolicy`;
const writePolicyRuleUrl = `${writeApplyPolicyUrl}Rule`;
const appendApplyPolicyUrl = `${policyResourceUrl}#appendApplyPolicy`;
const controlAccessPolicyUrl = `${policyResourceUrl}#controlAccessPolicy`;
const controlPolicyRuleUrl = `${controlAccessPolicyUrl}Rule`;
const controlApplyPolicyUrl = `${policyResourceUrl}#controlApplyPolicy`;

describe("AcpAccessControlStrategy", () => {
  const resourceInfoUrl = "http://example.com/resourceInfo";
  const resourceInfo = mockSolidDatasetFrom(resourceInfoUrl);
  const fetch = jest.fn();
  const datasetWithAcrUrl = resourceUrl;
  const datasetWithAcr = chain(mockSolidDatasetFrom(datasetWithAcrUrl), (d) =>
    acpFns.addMockAcrTo(d)
  );

  let acp;

  describe("init", () => {
    beforeEach(async () => {
      jest
        .spyOn(acpFns, "getResourceInfoWithAcr")
        .mockResolvedValue(datasetWithAcr);
      acp = await AcpAccessControlStrategy.init(
        resourceInfo,
        policiesContainerUrl,
        fetch
      );
    });

    it("uses getResourceInfoWithAcr to fetch data", () =>
      expect(
        acpFns.getResourceInfoWithAcr
      ).toHaveBeenCalledWith(resourceInfoUrl, { fetch }));

    it("exposes the methods we expect for a access control strategy", () =>
      ["getPermissions", "savePermissionsForAgent"].forEach((method) =>
        expect(acp[method]).toBeDefined()
      ));

    it("throws an error if ACR is not accessible", async () => {
      const dataset = mockSolidDatasetFrom(datasetWithAcrUrl);
      acpFns.getResourceInfoWithAcr.mockResolvedValue(dataset);
      await expect(
        AcpAccessControlStrategy.init(resourceInfo, policiesContainerUrl, fetch)
      ).rejects.toEqual(new Error(noAcrAccessError));
    });
  });

  describe("getPermissionsForNamedPolicies", () => {
    const webId = "http://example.com/agent1";

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });

    it("returns an empty array if no policy resource is available", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      await expect(acp.getPermissionsForNamedPolicies()).resolves.toEqual([]);
    });

    it("throws an error if anything but 404 for the policy resource happens", async () => {
      const error = new Error("500");
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw error;
      });
      await expect(acp.getPermissionsForNamedPolicies()).rejects.toEqual(error);
    });

    it("normalizes the permissions retrieved from the policy resource", async () => {
      const editorsPolicyRule = chain(
        acpFns.createRule(editorsPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId)
      );
      const editorsPolicy = chain(
        acpFns.createPolicy(editorsPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
        (p) => acpFns.setRequiredRuleUrl(p, editorsPolicyRule)
      );

      const policyDataset = chain(
        mockSolidDatasetFrom(editorsPolicyResourceUrl),
        (d) => setThing(d, editorsPolicyRule),
        (d) => setThing(d, editorsPolicy)
      );
      jest.spyOn(scFns, "getSolidDataset").mockResolvedValue(policyDataset);
      const profile = mockProfileAlice();
      jest.spyOn(profileFns, "fetchProfile").mockResolvedValue(profile);

      await expect(
        acp.getPermissionsForNamedPolicies("editors")
      ).resolves.toEqual([
        {
          acl: createAccessMap(true, true, false, false),
          alias: "editors",
          webId,
          type: "agent",
        },
      ]);
    });
  });

  describe("getPermissionsForCustomPolicies", () => {
    const webId = "http://example.com/agent1";

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });

    it("returns an empty array if no policy resource is available", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      await expect(acp.getPermissionsForCustomPolicies()).resolves.toEqual([]);
    });

    it("throws an error if anything but 404 for the policy resource happens", async () => {
      const error = new Error("500");
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw error;
      });
      await expect(acp.getPermissionsForCustomPolicies()).rejects.toEqual(
        error
      );
    });

    it("normalizes the permissions retrieved from the policy resource", async () => {
      const viewAndAddPolicyRule = chain(
        acpFns.createRule(viewAndAddPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId)
      );
      const viewAndAddPolicy = chain(
        acpFns.createPolicy(viewAndAddPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, false, true)),
        (p) => acpFns.setRequiredRuleUrl(p, viewAndAddPolicyRule)
      );

      const policyDataset = chain(
        mockSolidDatasetFrom(viewAndAddPolicyResourceUrl),
        (d) => setThing(d, viewAndAddPolicyRule),
        (d) => setThing(d, viewAndAddPolicy)
      );
      jest.spyOn(scFns, "getSolidDataset").mockResolvedValue(policyDataset);
      const profile = mockProfileAlice();
      jest.spyOn(profileFns, "fetchProfile").mockResolvedValue(profile);

      await expect(
        acp.getPermissionsForCustomPolicies("viewAndAdd")
      ).resolves.toEqual([
        {
          acl: createAccessMap(true, false, true, false),
          alias: "viewAndAdd",
          webId,
          type: "agent",
        },
      ]);
    });
  });

  describe("getInheritedPermissionsForResource", () => {
    const webId = "http://example.com/agent1";

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });

    it("returns an empty array if no policy resource is available", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      await expect(acp.getInheritedPermissionsForResource()).resolves.toEqual(
        []
      );
    });

    it("throws an error if anything but 404 for the policy resource happens", async () => {
      jest
        .spyOn(acp, "getInheritedPoliciesUrlsForResource")
        .mockReturnValue(["https://example.com/policies/policyDataset"]);
      const error = new Error("500");
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw error;
      });
      await expect(acp.getInheritedPermissionsForResource()).rejects.toEqual(
        error
      );
    });

    it("normalizes the permissions retrieved from the policy resource", async () => {
      const editorsPolicyRule = chain(
        acpFns.createRule(editorsPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId)
      );
      const editorsPolicy = chain(
        acpFns.createPolicy(editorsPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
        (p) => acpFns.setRequiredRuleUrl(p, editorsPolicyRule)
      );

      const policyDataset = chain(
        mockSolidDatasetFrom(editorsPolicyResourceUrl),
        (d) => setThing(d, editorsPolicyRule),
        (d) => setThing(d, editorsPolicy)
      );
      jest
        .spyOn(acp, "getInheritedPoliciesUrlsForResource")
        .mockReturnValue([editorsPolicyUrl]);
      jest.spyOn(scFns, "getSolidDataset").mockResolvedValue(policyDataset);
      const profile = mockProfileAlice();
      jest.spyOn(profileFns, "fetchProfile").mockResolvedValue(profile);

      await expect(acp.getInheritedPermissionsForResource()).resolves.toEqual([
        {
          acl: createAccessMap(true, true, false, false),
          alias: "editors",
          webId,
          type: "agent",
          inherited: true,
        },
      ]);
    });
  });

  describe("getPermissions", () => {
    const webId = "http://example.com/agent1";

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });

    it("returns an empty array if no policy resource is available", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      await expect(acp.getPermissions()).resolves.toEqual([]);
    });

    it("throws an error if anything but 404 for the policy resource happens", async () => {
      const error = new Error("500");
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw error;
      });
      await expect(acp.getPermissions()).rejects.toEqual(error);
    });

    it("normalizes the permissions retrieved from the policy resource", async () => {
      const readPolicyRule = chain(acpFns.createRule(readPolicyRuleUrl), (r) =>
        acpFns.addAgent(r, webId)
      );
      const readPolicy = chain(
        acpFns.createPolicy(readApplyPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true)),
        (p) => acpFns.setRequiredRuleUrl(p, readPolicyRule)
      );
      const controlPolicyRule = chain(
        acpFns.createRule(controlPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId)
      );
      const controlPolicy = chain(
        acpFns.createPolicy(controlAccessPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
        (p) => acpFns.setRequiredRuleUrl(p, controlPolicyRule)
      );
      const policyDataset = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => setThing(d, readPolicyRule),
        (d) => setThing(d, readPolicy),
        (d) => setThing(d, controlPolicyRule),
        (d) => setThing(d, controlPolicy)
      );
      jest.spyOn(scFns, "getSolidDataset").mockResolvedValue(policyDataset);
      const profile = mockProfileAlice();
      jest.spyOn(profileFns, "fetchProfile").mockResolvedValue(profile);

      await expect(acp.getPermissions()).resolves.toEqual([
        {
          acl: createAccessMap(true, false, false, true),
          alias: "Custom",
          webId,
        },
      ]);
    });
  });

  describe("addAgentToNamedPolicy", () => {
    const webId = "http://example.com/agent1";

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });
    it("fails if the policy resource returns something other than 404", async () => {
      const error = "500";
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error(error);
      });
      await expect(
        acp.addAgentToNamedPolicy(webId, "editors")
      ).resolves.toEqual({ error });
    });

    it("fails if the policy resources returns an error upon trying to create it", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementationOnce(() => {
        throw new Error("404");
      });
      jest.spyOn(scFns, "saveSolidDatasetAt").mockImplementationOnce(() => {
        throw new Error("500");
      });
      await expect(
        acp.addAgentToNamedPolicy(webId, "editors")
      ).resolves.toEqual({ error: "500" });
    });
    it("returns the modified datasetWithAcr after adding agent to policy", async () => {
      const editorsAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      const policyResource = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrEditors = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, editorsAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrEditors,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );
      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrEditors)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);

      await expect(await acp.addAgentToNamedPolicy(webId, "editors")).toEqual({
        response: datasetWithAcrControlAccess,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrEditors, {
        fetch,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
      const datasetWithAcrControlApply = chain(
        policyResource,
        (d) => acpFns.addAcrPolicyUrl(d, controlApplyPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlApplyPolicyUrl)
      );
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlApply,
        {
          fetch,
        }
      );
    });
  });

  describe("removeAgentFromNamedPolicy", () => {
    const webId = "http://example.com/agent1";
    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });
    it("fails if the policy resource returns something other than 404", async () => {
      const error = "500";
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error(error);
      });
      await expect(
        acp.removeAgentFromNamedPolicy(webId, "editors")
      ).resolves.toEqual({ error });
    });

    it("fails if the policy resources returns an error upon trying to create it", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      jest.spyOn(scFns, "saveSolidDatasetAt").mockImplementationOnce(() => {
        throw new Error("500");
      });
      await expect(
        acp.removeAgentFromNamedPolicy(webId, "editors")
      ).resolves.toEqual({ error: "500" });
    });
    it("returns the modified datasetWithAcr after removing agent from policy", async () => {
      const webId1 = "http://example.com/agent1";
      const webId2 = "http://example.com/agent2";
      const editorsPolicyRule = chain(
        acpFns.createRule(editorsPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId1),
        (r) => acpFns.addAgent(r, webId2)
      );
      const policy = chain(
        acpFns.createPolicy(editorsPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
        (p) => acpFns.setRequiredRuleUrl(p, editorsPolicyRule)
      );
      const policyDataset = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => setThing(d, editorsPolicyRule),
        (d) => setThing(d, policy)
      );
      const editorsAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      jest.spyOn(acpFns2, "getPolicy").mockReturnValue(policy);
      const policyResource = chain(policyDataset, (d) =>
        acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrEditors = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, editorsAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrEditors,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );
      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrEditors)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);
      jest.spyOn(scFns, "deleteFile").mockResolvedValue("deleted");

      await expect(
        await acp.removeAgentFromNamedPolicy(webId, "editors")
      ).toEqual({
        response: datasetWithAcrControlAccess,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrEditors, {
        fetch,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
    });
    it("deletes rule and policy is agent is the last one on the list", async () => {
      const mockedRemoveRule = jest.spyOn(acpFns2, "removeRequiredRuleUrl");
      const mockedDeleteFile = jest.spyOn(scFns, "deleteFile");
      const webId1 = "http://example.com/agent1";
      const editorsPolicyRule = chain(
        acpFns.createRule(editorsPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId1)
      );
      const policy = chain(
        acpFns.createPolicy(editorsPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
        (p) => acpFns.setRequiredRuleUrl(p, editorsPolicyRule)
      );
      const policyDataset = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => setThing(d, editorsPolicyRule),
        (d) => setThing(d, policy)
      );
      const editorsAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      jest.spyOn(acpFns2, "getPolicy").mockReturnValue(policy);
      const policyResource = chain(policyDataset, (d) =>
        acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrEditors = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, editorsAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrEditors,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );

      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrEditors)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);

      await acp.removeAgentFromNamedPolicy(webId, "editors");

      expect(mockedRemoveRule).toHaveBeenCalledWith(
        policy,
        editorsPolicyRuleUrl
      );
      expect(mockedDeleteFile).toHaveBeenCalledWith(editorsPolicyUrl, {
        fetch,
      });
    });
  });

  describe("addAgentToCustomPolicy", () => {
    const webId = "http://example.com/agent1";

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });
    it("fails if the policy resource returns something other than 404", async () => {
      const error = "500";
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error(error);
      });
      await expect(
        acp.addAgentToCustomPolicy(webId, "editors")
      ).resolves.toEqual({ error });
    });

    it("fails if the policy resources returns an error upon trying to create it", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      jest.spyOn(scFns, "saveSolidDatasetAt").mockImplementationOnce(() => {
        throw new Error("500");
      });
      await expect(
        acp.addAgentToCustomPolicy(webId, "editors")
      ).resolves.toEqual({ error: "500" });
    });
    it("returns the modified datasetWithAcr after adding agent to policy", async () => {
      const editorsAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      const policyResource = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrEditors = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, editorsAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrEditors,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );
      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrEditors)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);

      await expect(
        await acp.addAgentToCustomPolicy(webId, "viewAndAdd")
      ).toEqual({
        response: datasetWithAcrControlAccess,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrEditors, {
        fetch,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
      const datasetWithAcrControlApply = chain(
        policyResource,
        (d) => acpFns.addAcrPolicyUrl(d, controlApplyPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlApplyPolicyUrl)
      );
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlApply,
        {
          fetch,
        }
      );
    });
  });

  describe("removeAgentFromCustomPolicy", () => {
    const webId = "http://example.com/agent1";
    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });
    it("fails if the policy resource returns something other than 404", async () => {
      const error = "500";
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error(error);
      });
      await expect(
        acp.removeAgentFromCustomPolicy(webId, "viewandadd")
      ).resolves.toEqual({ error });
    });

    it("fails if the policy resources returns an error upon trying to create it", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      jest.spyOn(scFns, "saveSolidDatasetAt").mockImplementationOnce(() => {
        throw new Error("500");
      });
      await expect(
        acp.removeAgentFromCustomPolicy(webId, "viewAndAdd")
      ).resolves.toEqual({ error: "500" });
    });
    it("returns the modified datasetWithAcr after removing agent from policy", async () => {
      const webId1 = "http://example.com/agent1";
      const webId2 = "http://example.com/agent2";
      const viewAndAddPolicyRule = chain(
        acpFns.createRule(viewAndAddPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId1),
        (r) => acpFns.addAgent(r, webId2)
      );
      const policy = chain(
        acpFns.createPolicy(viewAndAddPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
        (p) => acpFns.setRequiredRuleUrl(p, viewAndAddPolicyRule)
      );
      const policyDataset = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => setThing(d, viewAndAddPolicyRule),
        (d) => setThing(d, policy)
      );
      const viewAndAddAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, viewAndAddPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, viewAndAddPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      jest.spyOn(acpFns2, "getPolicy").mockReturnValue(policy);
      const policyResource = chain(policyDataset, (d) =>
        acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrViewAndAdd = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, viewAndAddAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrViewAndAdd,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );
      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrViewAndAdd)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);
      jest.spyOn(scFns, "deleteFile").mockResolvedValue("deleted");

      await expect(
        await acp.removeAgentFromCustomPolicy(webId, "viewAndAdd")
      ).toEqual({
        response: datasetWithAcrControlAccess,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrViewAndAdd, {
        fetch,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
    });
    it("deletes rule and policy is agent is the last one on the list", async () => {
      const mockedRemoveRule = jest.spyOn(acpFns2, "removeRequiredRuleUrl");
      const mockedDeleteFile = jest.spyOn(scFns, "deleteFile");
      const webId1 = "http://example.com/agent1";
      const viewAndAddPolicyRule = chain(
        acpFns.createRule(viewAndAddPolicyRuleUrl),
        (r) => acpFns.addAgent(r, webId1)
      );
      const policy = chain(
        acpFns.createPolicy(viewAndAddPolicyUrl),
        (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
        (p) => acpFns.setRequiredRuleUrl(p, viewAndAddPolicyRule)
      );
      const policyDataset = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => setThing(d, viewAndAddPolicyRule),
        (d) => setThing(d, policy)
      );
      const viewAndAddAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, viewAndAddPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, viewAndAddPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      jest.spyOn(acpFns2, "getPolicy").mockReturnValue(policy);
      const policyResource = chain(policyDataset, (d) =>
        acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrViewAndAdd = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, viewAndAddAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrViewAndAdd,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );

      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrViewAndAdd)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);

      await acp.removeAgentFromNamedPolicy(webId, "viewAndAdd");

      expect(mockedRemoveRule).toHaveBeenCalledWith(
        policy,
        viewAndAddPolicyRuleUrl
      );
      expect(mockedDeleteFile).toHaveBeenCalledWith(viewAndAddPolicyUrl, {
        fetch,
      });
    });
  });

  describe("setRulePublic", () => {
    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });
    it("fails if the policy resource returns something other than 404", async () => {
      const error = "500";
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error(error);
      });
      expect(await acp.setRulePublic("editors", true)).toEqual({
        error,
      });
    });

    it("fails if the policy resources returns an error upon trying to create it", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementationOnce(() => {
        throw new Error("404");
      });
      jest.spyOn(scFns, "saveSolidDatasetAt").mockImplementationOnce(() => {
        throw new Error("500");
      });
      expect(await acp.setRulePublic("editors", true)).toEqual({
        error: "500",
      });
    });
    it("returns the modified datasetWithAcr after adding public agent to rule", async () => {
      const editorsAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      const policyResource = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrEditors = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, editorsAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrEditors,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );
      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrEditors)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);

      expect(await acp.setRulePublic("editors", true)).toEqual({
        response: datasetWithAcrControlAccess,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrEditors, {
        fetch,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
      const datasetWithAcrControlApply = chain(
        policyResource,
        (d) => acpFns.addAcrPolicyUrl(d, controlApplyPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlApplyPolicyUrl)
      );
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlApply,
        {
          fetch,
        }
      );
    });
  });

  describe("setRuleAuthenticated", () => {
    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });
    it("fails if the policy resource returns something other than 404", async () => {
      const error = "500";
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error(error);
      });
      expect(await acp.setRuleAuthenticated("editors", true)).toEqual({
        error,
      });
    });

    it("fails if the policy resources returns an error upon trying to create it", async () => {
      jest.spyOn(scFns, "getSolidDataset").mockImplementationOnce(() => {
        throw new Error("404");
      });
      jest.spyOn(scFns, "saveSolidDatasetAt").mockImplementationOnce(() => {
        throw new Error("500");
      });
      expect(await acp.setRuleAuthenticated("editors", true)).toEqual({
        error: "500",
      });
    });
    it("returns the modified datasetWithAcr after adding public agent to rule", async () => {
      const editorsAC = chain(
        acpFns.createControl(),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl),
        (ac) => acpFns.addPolicyUrl(ac, editorsPolicyUrl)
      );
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      const policyResource = chain(
        mockSolidDatasetFrom(policyResourceUrl),
        (d) => acpFns.addMockAcrTo(d)
      );
      const datasetWithAcrEditors = chain(datasetWithAcr, (d) =>
        acpFns.setControl(d, editorsAC)
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrEditors,
        (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
      );
      jest
        .spyOn(acpFns, "saveAcrFor")
        .mockResolvedValueOnce(datasetWithAcrEditors)
        .mockResolvedValue(datasetWithAcrControlAccess);
      jest
        .spyOn(acpFns2, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);

      expect(await acp.setRuleAuthenticated("editors", true)).toEqual({
        response: datasetWithAcrControlAccess,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrEditors, {
        fetch,
      });
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
      const datasetWithAcrControlApply = chain(
        policyResource,
        (d) => acpFns.addAcrPolicyUrl(d, controlApplyPolicyUrl),
        (d) => acpFns.addMemberAcrPolicyUrl(d, controlApplyPolicyUrl)
      );
      expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlApply,
        {
          fetch,
        }
      );
    });
  });

  describe("savePermissionsForAgent", () => {
    const webId = "http://example.com/agent1";
    const readAC = chain(
      acpFns.createControl(),
      (ac) => acpFns.addPolicyUrl(ac, readApplyPolicyUrl),
      (ac) => acpFns.addPolicyUrl(ac, readApplyPolicyUrl)
    );
    const writeAc = chain(
      acpFns.createControl(),
      (ac) => acpFns.addPolicyUrl(ac, writeApplyPolicyUrl),
      (ac) => acpFns.addPolicyUrl(ac, writeApplyPolicyUrl)
    );
    const appendAC = chain(
      acpFns.createControl(),
      (ac) => acpFns.addPolicyUrl(ac, appendApplyPolicyUrl),
      (ac) => acpFns.addPolicyUrl(ac, appendApplyPolicyUrl)
    );

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        datasetWithAcr,
        policiesContainerUrl,
        fetch
      );
    });

    describe("adding an agent to a policy resource that doesn't exist", () => {
      it("fails if the policy resource returns something other than 404", async () => {
        const error = "500";
        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error(error);
        });
        await expect(
          acp.savePermissionsForAgent(webId, createAccessMap())
        ).resolves.toEqual({ error });
      });

      it("fails if the policy resources returns an error upon trying to create it", async () => {
        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error("404");
        });
        jest.spyOn(scFns, "saveSolidDatasetAt").mockImplementation(() => {
          throw new Error("500");
        });
        await expect(
          acp.savePermissionsForAgent(webId, createAccessMap())
        ).resolves.toEqual({ error: "500" });
      });

      it("returns the modified datasetWithAcr after adding modes to agent", async () => {
        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error("404");
        });
        const policyResource = chain(
          mockSolidDatasetFrom(policyResourceUrl),
          (d) => acpFns.addMockAcrTo(d)
        );
        const datasetWithAcrRead = chain(datasetWithAcr, (d) =>
          acpFns.setControl(d, readAC)
        );
        const datasetWithAcrWrite = chain(datasetWithAcrRead, (d) =>
          acpFns.setControl(d, writeAc)
        );
        const datasetWithAcrAppend = chain(datasetWithAcrWrite, (d) =>
          acpFns.setControl(d, appendAC)
        );
        const datasetWithAcrControlAccess = chain(
          datasetWithAcrAppend,
          (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
          (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
        );
        jest
          .spyOn(acpFns, "saveAcrFor")
          .mockResolvedValueOnce(datasetWithAcrRead) // after adding read
          .mockResolvedValueOnce(datasetWithAcrWrite) // after adding write
          .mockResolvedValueOnce(datasetWithAcrAppend) // after adding append
          .mockResolvedValue(datasetWithAcrControlAccess); // after adding control access - and rest
        jest
          .spyOn(acpFns, "getSolidDatasetWithAcr")
          .mockResolvedValue(policyResource);
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockResolvedValue(policyResource);

        await expect(
          acp.savePermissionsForAgent(
            webId,
            createAccessMap(true, true, true, true)
          )
        ).resolves.toEqual({ response: datasetWithAcrControlAccess });
        expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrRead, {
          fetch,
        });
        expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrAppend, {
          fetch,
        });
        expect(acpFns.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrWrite, {
          fetch,
        });
        expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
          datasetWithAcrControlAccess,
          {
            fetch,
          }
        );
        const datasetWithAcrControlApply = chain(
          policyResource,
          (d) => acpFns.addAcrPolicyUrl(d, controlApplyPolicyUrl),
          (d) => acpFns.addMemberAcrPolicyUrl(d, controlApplyPolicyUrl)
        );
        expect(acpFns.saveAcrFor).toHaveBeenCalledWith(
          datasetWithAcrControlApply,
          {
            fetch,
          }
        );
      });

      it("returns the modified datasetWithAcr after removing modes from agent", async () => {
        const policyResource = chain(
          mockSolidDatasetFrom(policyResourceUrl),
          (d) => acpFns.addMockAcrTo(d),
          (d) => acpFns.setControl(d, readAC),
          (d) => acpFns.setControl(d, writeAc),
          (d) => acpFns.setControl(d, appendAC),
          (d) => acpFns.addAcrPolicyUrl(d, controlAccessPolicyUrl),
          (d) => acpFns.addMemberAcrPolicyUrl(d, controlAccessPolicyUrl)
        );
        jest.spyOn(scFns, "getSolidDataset").mockResolvedValue(policyResource);
        jest
          .spyOn(acpFns, "getSolidDatasetWithAcr")
          .mockResolvedValue(policyResource);
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockResolvedValue(policyResource);

        await expect(
          acp.savePermissionsForAgent(webId, createAccessMap())
        ).resolves.toEqual({ response: policyResource });
      });
    });
  });
});

describe("getAgentType", () => {
  it("returns type agent for a normal webId", () => {
    expect(getAgentType("https://example.org/profile/card#me")).toEqual(
      "agent"
    );
  });
  it("returns type public for a public agent url", () => {
    expect(getAgentType(PUBLIC_AGENT_PREDICATE)).toEqual("public");
  });
  it("returns type authenticated for an authenticated agent url", () => {
    expect(getAgentType(AUTHENTICATED_AGENT_PREDICATE)).toEqual(
      "authenticated"
    );
  });
});

describe("getPolicyNameFromAccess", () => {
  const readAccess = createAcpMap(true);
  const readWriteAccess = createAcpMap(true, true);
  const readAppendAccess = createAcpMap(true, false, true);
  const writeAccess = createAcpMap(false, true, false);
  const appendAccess = createAcpMap(false, false, true);
  it("returns the correct policy name for a given access map", () => {
    expect(getPolicyNameFromAccess(readAccess)).toEqual("viewers");
    expect(getPolicyNameFromAccess(readWriteAccess)).toEqual("editors");
    expect(getPolicyNameFromAccess(readAppendAccess)).toEqual("viewAndAdd");
    expect(getPolicyNameFromAccess(writeAccess)).toEqual("editOnly");
    expect(getPolicyNameFromAccess(appendAccess)).toEqual("addOnly");
  });
  it("returns null if type of access is not covered", () => {
    const readWriteAppendAccess = createAcpMap(true, true, true);
    expect(getPolicyNameFromAccess(readWriteAppendAccess)).toBeNull();
  });
});

describe("addAcpModes", () => {
  it("combines modes", () => {
    expect(addAcpModes(undefined, createAcpMap(true, false, true))).toEqual(
      createAcpMap(true, false, true)
    );
    expect(
      addAcpModes(createAcpMap(), createAcpMap(true, false, true))
    ).toEqual(createAcpMap(true, false, true));
    expect(
      addAcpModes(createAcpMap(false, true), createAcpMap(true, false, true))
    ).toEqual(createAcpMap(true, true, true));
  });
});

describe("convertAcpToAcl", () => {
  it("converts ACP maps onto the equivalent ACL map", () => {
    expect(
      convertAcpToAcl({
        apply: createAcpMap(),
        access: createAcpMap(),
      })
    ).toEqual(createAccessMap());
    expect(
      convertAcpToAcl({
        apply: createAcpMap(true),
        access: createAcpMap(),
      })
    ).toEqual(createAccessMap(true));
    expect(
      convertAcpToAcl({
        apply: createAcpMap(false, true),
        access: createAcpMap(),
      })
    ).toEqual(createAccessMap(false, true));
    expect(
      convertAcpToAcl({
        apply: createAcpMap(false, false, true),
        access: createAcpMap(),
      })
    ).toEqual(createAccessMap(false, false, true));
    expect(
      convertAcpToAcl({
        apply: createAcpMap(false, false, false),
        access: createAcpMap(true, true),
      })
    ).toEqual(createAccessMap(false, false, false, true));
    expect(
      convertAcpToAcl({
        apply: createAcpMap(true, true, true),
        access: createAcpMap(true, true),
      })
    ).toEqual(createAccessMap(true, true, true, true));
    expect(
      convertAcpToAcl({
        apply: createAcpMap(true, false, true),
        access: createAcpMap(true, false),
      })
    ).toEqual(createAccessMap(true, false, true, false));
  });
});

describe("createAcpMap", () => {
  it("creates maps of access modes", () => {
    expect(createAcpMap()).toEqual({
      read: false,
      write: false,
      append: false,
    });
    expect(createAcpMap(true)).toEqual({
      read: true,
      write: false,
      append: false,
    });
    expect(createAcpMap(false, true)).toEqual({
      read: false,
      write: true,
      append: false,
    });
    expect(createAcpMap(false, false, true)).toEqual({
      read: false,
      write: false,
      append: true,
    });
  });
});

describe("getOrCreatePermission", () => {
  const webId = "http://example.com/profile#me";
  const blankPermission = {
    acp: {
      apply: createAcpMap(),
      access: createAcpMap(),
    },
    webId,
    inherited: false,
  };
  it("creates a new permission if none exist", () => {
    expect(getOrCreatePermission({}, webId)).toEqual(blankPermission);
  });
  it("gets existing permission if it exist", () => {
    expect(
      getOrCreatePermission({ [webId]: { test: 42, webId } }, webId)
    ).toEqual({
      ...blankPermission,
      test: 42,
    });
  });
});

describe("getOrCreatePolicy", () => {
  const policyDataset = mockSolidDatasetFrom(policyResourceUrl);
  const policyThing = acpFns.createPolicy(readApplyPolicyUrl);

  it("returns existing policy", () => {
    const modifiedDataset = chain(policyDataset, (d) =>
      setThing(d, policyThing)
    );
    const { policy, dataset } = getOrCreatePolicy(
      modifiedDataset,
      readApplyPolicyUrl
    );
    expect(policy).toEqual(policyThing);
    expect(dataset).toEqual(modifiedDataset);
  });

  it("creates new policy if none exist", () => {
    const { policy, dataset } = getOrCreatePolicy(
      policyDataset,
      readApplyPolicyUrl
    );
    expect(policy).toEqual(policyThing);
    expect(dataset).toEqual(setThing(policyDataset, policyThing));
  });
});

describe("getRulesOrCreate", () => {
  const readPolicy = chain(acpFns.createPolicy(readApplyPolicyUrl), (p) =>
    acpFns.setAllowModes(p, createAcpMap(true))
  );
  const readPolicyRule = acpFns.createRule(readPolicyRuleUrl);
  const policyDataset = chain(mockSolidDatasetFrom(policyResourceUrl), (d) =>
    acpFns.setPolicy(d, readPolicy)
  );

  it("creates a rule on the fly if no rules exist", () => {
    expect(getRulesOrCreate([], readPolicy, policyDataset)).toEqual({
      existing: false,
      rules: [acpFns.createRule(readPolicyRuleUrl)],
    });
  });

  it("returns existing rule if it exist", () => {
    const modifiedPolicyDataset = setThing(policyDataset, readPolicyRule);
    expect(
      getRulesOrCreate([readPolicyRuleUrl], readPolicy, modifiedPolicyDataset)
    ).toEqual({
      existing: true,
      rules: [readPolicyRule],
    });
  });
});

describe("getRuleWithAgent", () => {
  const ruleUrl = "http://example.com/#Rule";
  const rule = acpFns.createRule(ruleUrl);
  const webId = "http://example.com/profile/card#me";

  it("returns a rule if it's connected to the agent", () => {
    const ruleWithAgent = acpFns.addAgent(rule, webId);
    expect(getRuleWithAgent([rule, ruleWithAgent], webId)).toBe(ruleWithAgent);
  });

  it("returns first rule if no rule is connected to the agent", () => {
    expect(getRuleWithAgent([rule], webId)).toBe(rule);
  });
});

describe("setAgents", () => {
  const readPolicy = chain(acpFns.createPolicy(readApplyPolicyUrl), (p) =>
    acpFns.setAllowModes(p, createAcpMap(true))
  );
  const readPolicyRule = acpFns.createRule(readPolicyRuleUrl);
  const policyDataset = chain(mockSolidDatasetFrom(policyResourceUrl), (d) =>
    acpFns.setPolicy(d, readPolicy)
  );
  const webId = "http://example.com/profile/card#me";

  describe("adding agent", () => {
    it("will add new rule and add agent to it", () => {
      const expectedRule = acpFns.addAgent(readPolicyRule, webId);
      const expectedDataset = setThing(policyDataset, expectedRule);
      const expectedPolicy = acpFns.addRequiredRuleUrl(
        readPolicy,
        expectedRule
      );
      expect(setAgents(readPolicy, policyDataset, webId, true)).toEqual({
        policy: expectedPolicy,
        dataset: expectedDataset,
      });
    });

    it("will use existing rule and add agent to it", () => {
      const policyDatasetWithRule = setThing(policyDataset, readPolicyRule);
      const expectedRule = acpFns.addAgent(readPolicyRule, webId);
      const expectedDataset = setThing(policyDatasetWithRule, expectedRule);
      const expectedPolicy = acpFns.setRequiredRuleUrl(
        readPolicy,
        expectedRule
      );
      expect(setAgents(readPolicy, policyDatasetWithRule, webId, true)).toEqual(
        {
          policy: expectedPolicy,
          dataset: expectedDataset,
        }
      );
    });

    it("will use existing rule and not add agent to it if agent already is added", () => {
      const ruleWithAgent = acpFns.addAgent(readPolicyRule, webId);
      const policyDatasetWithRule = setThing(policyDataset, ruleWithAgent);
      const expectedDataset = setThing(policyDatasetWithRule, ruleWithAgent);
      const expectedPolicy = acpFns.setRequiredRuleUrl(
        readPolicy,
        ruleWithAgent
      );
      expect(setAgents(readPolicy, policyDatasetWithRule, webId, true)).toEqual(
        {
          policy: expectedPolicy,
          dataset: expectedDataset,
        }
      );
    });
  });

  describe("removing agent", () => {
    it("adds rule to policy and dataset if trying to remove agent when there are no rules yet", () => {
      const expectedPolicy = acpFns.addRequiredRuleUrl(
        readPolicy,
        readPolicyRule
      );
      const expectedDataset = setThing(policyDataset, readPolicyRule);
      expect(setAgents(readPolicy, policyDataset, webId, false)).toEqual({
        policy: expectedPolicy,
        dataset: expectedDataset,
      });
    });

    it("removes agent from rule", () => {
      const ruleWithAgent = acpFns.addAgent(readPolicyRule, webId);
      const policyWithRule = acpFns.setRequiredRuleUrl(
        readPolicy,
        readPolicyRule
      );
      const policyDatasetWithPolicyAndRule = chain(
        policyDataset,
        (d) => setThing(d, ruleWithAgent),
        (d) => setThing(d, policyWithRule)
      );
      const { policy, dataset } = setAgents(
        policyWithRule,
        policyDatasetWithPolicyAndRule,
        webId,
        false
      );
      expect(policy).toEqual(policyWithRule);
      const rules = acpFns.getRuleAll(dataset);
      expect(rules).toHaveLength(1);
      const agents = acpFns.getAgentAll(rules[0]);
      expect(agents).toHaveLength(0);
    });
  });
});

describe("getNamedPolicyModesAndAgents", () => {
  const webId1 = "http://example.com/agent1";
  const webId2 = "http://example.com/agent2";
  const editorsPolicyRule = chain(
    acpFns.createRule(editorsPolicyRuleUrl),
    (r) => acpFns.addAgent(r, webId1),
    (r) => acpFns.addAgent(r, webId2)
  );
  const policy = chain(
    acpFns.createPolicy(editorsPolicyUrl),
    (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
    (p) => acpFns.setRequiredRuleUrl(p, editorsPolicyRule)
  );
  const policyDataset = chain(
    mockSolidDatasetFrom(policyResourceUrl),
    (d) => setThing(d, editorsPolicyRule),
    (d) => setThing(d, policy)
  );
  it("returns empty modes and agents if there is no policy", () => {
    jest.spyOn(scFns.acp_v2, "getPolicy").mockReturnValueOnce(null);
    expect(
      getNamedPolicyModesAndAgents(editorsPolicyUrl, policyDataset)
    ).toEqual({ agents: [], modes: {} });
  });
  it("maps agents from policies together with the access modes they're granted", () => {
    jest.spyOn(scFns.acp_v2, "getPolicy").mockReturnValueOnce(policy);
    expect(
      getNamedPolicyModesAndAgents(editorsPolicyUrl, policyDataset)
    ).toEqual({ agents: [webId1, webId2], modes: createAcpMap(true, true) });
  });
  it("includes public and authenticated agents", () => {
    const editorsPolicyRuleWithPublicAndAuthenticated = chain(
      acpFns.createRule(editorsPolicyRuleUrl),
      (r) => acpFns2.setAuthenticated(r, true),
      (r) => acpFns.setPublic(r, true)
    );
    const policyWithPublicAndAuthenticated = chain(
      acpFns.createPolicy(editorsPolicyUrl),
      (p) => acpFns.setAllowModes(p, createAcpMap(true, true)),
      (p) =>
        acpFns.setRequiredRuleUrl(
          p,
          editorsPolicyRuleWithPublicAndAuthenticated
        )
    );
    const policyDatasetWithPublicAndAuthenticated = chain(
      mockSolidDatasetFrom(policyResourceUrl),
      (d) => setThing(d, editorsPolicyRuleWithPublicAndAuthenticated),
      (d) => setThing(d, policyWithPublicAndAuthenticated)
    );
    jest
      .spyOn(scFns.acp_v2, "getPolicy")
      .mockReturnValueOnce(policyWithPublicAndAuthenticated);
    expect(
      getNamedPolicyModesAndAgents(
        editorsPolicyUrl,
        policyDatasetWithPublicAndAuthenticated
      )
    ).toEqual({
      agents: [PUBLIC_AGENT_PREDICATE, AUTHENTICATED_AGENT_PREDICATE],
      modes: createAcpMap(true, true),
    });
  });
});

describe("getPolicyModesAndAgents", () => {
  it("maps agents from policies together with the access modes they're granted", () => {
    const webId1 = "http://example.com/agent1";
    const webId2 = "http://example.com/agent2";
    const readPolicyRule = chain(
      acpFns.createRule(readPolicyRuleUrl),
      (r) => acpFns.addAgent(r, webId1),
      (r) => acpFns.addAgent(r, webId2)
    );
    const readPolicy = chain(
      acpFns.createPolicy(readApplyPolicyUrl),
      (p) => acpFns.setAllowModes(p, createAcpMap(true)),
      (p) => acpFns.setRequiredRuleUrl(p, readPolicyRule)
    );
    const writePolicyRule = chain(acpFns.createRule(writePolicyRuleUrl), (r) =>
      acpFns.addAgent(r, webId2)
    );
    const writePolicy = chain(
      acpFns.createPolicy(writeApplyPolicyUrl),
      (p) => acpFns.setAllowModes(p, createAcpMap(false, true)),
      (p) => acpFns.setRequiredRuleUrl(p, writePolicyRule)
    );
    const policyDataset = chain(
      mockSolidDatasetFrom(policyResourceUrl),
      (d) => setThing(d, readPolicyRule),
      (d) => setThing(d, readPolicy),
      (d) => setThing(d, writePolicyRule),
      (d) => setThing(d, writePolicy)
    );
    jest
      .spyOn(scFns.acp_v2, "getPolicy")
      .mockReturnValueOnce(readPolicy)
      .mockReturnValueOnce(writePolicy);
    expect(
      getPolicyModesAndAgents(
        [readApplyPolicyUrl, writeApplyPolicyUrl],
        policyDataset
      )
    ).toEqual([
      { agents: [webId1, webId2], modes: createAcpMap(true) },
      { agents: [webId2], modes: createAcpMap(false, true) },
    ]);
  });
});

describe("removePermissionsForAgent", () => {
  it("removes all permissions for a given agent", () => {
    const agent1 = aliceWebIdUrl;
    const agent2 = bobWebIdUrl;
    const rule1WithAgents = chain(
      acpFns.createRule(readPolicyRuleUrl),
      (r) => acpFns.setAgent(r, agent1),
      (r) => acpFns.setAgent(r, agent2)
    );
    const rule2WithAgents = chain(acpFns.createRule(writePolicyRuleUrl), (r) =>
      acpFns.setAgent(r, agent1)
    );
    const datasetWithRules = chain(
      mockSolidDatasetFrom(resourceUrl),
      (d) => setThing(d, rule1WithAgents),
      (d) => setThing(d, rule2WithAgents)
    );
    const updatedDataset = removePermissionsForAgent(agent1, datasetWithRules);
    expect(
      acpFns
        .getRuleAll(updatedDataset)
        .reduce((memo, rule) => memo.concat(acpFns.getAgentAll(rule)), [])
    ).toEqual([agent2]);
  });
});
