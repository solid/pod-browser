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
  getOrCreatePermission,
  getPolicyDetailFromAccess,
  getOrCreatePolicy,
  getPolicyModesAndAgents,
  getMatchersOrCreate,
  getMatcherWithAgent,
  noAcrAccessError,
  removePermissionsForAgent,
  setAgents,
  getNamedPolicyModesAndAgents,
  getWebIdsFromPermissions,
  getWebIdsFromInheritedPermissions,
  hasAcpConfiguration,
} from "./index";
import { createAccessMap } from "../../solidClientHelpers/permissions";
import { chain } from "../../solidClientHelpers/utils";
import {
  aliceWebIdUrl,
  bobWebIdUrl,
  mockProfileAlice,
} from "../../../__testUtils/mockPersonResource";
import { PUBLIC_AGENT_PREDICATE } from "../../models/contact/public";
import { AUTHENTICATED_AGENT_PREDICATE } from "../../models/contact/authenticated";
import {
  getPolicyUrl,
  getPoliciesContainerUrl,
  getPolicyResourceUrl,
} from "../../models/policy";

jest.mock("../../solidClientHelpers/profile", () => {
  return jest.requireActual("../../solidClientHelpers/profile");
});

const {
  mockSolidDatasetFrom,
  acp_v3: acpFns3,
  setThing,
  acp_v4: acpFns4,
} = scFns;

const podUrl = "http://example.com/";
const resourceUrl = "http://example.com/resourceInfo";
const policiesContainerUrl = getPoliciesContainerUrl(podUrl);

const mockPolicyResourceUrl = (legacy) =>
  getPolicyUrl(mockSolidDatasetFrom(resourceUrl), policiesContainerUrl, legacy);

const mockEditorsPolicyResourceUrl = (legacy) =>
  getPolicyResourceUrl(
    mockSolidDatasetFrom(resourceUrl),
    policiesContainerUrl,
    "editors",
    legacy
  );

const mockReadApplyPolicyUrl = (legacy) =>
  `${mockPolicyResourceUrl(legacy)}#readApplyPolicy`;
const mockReadPolicyRuleUrl = (legacy) =>
  `${mockReadApplyPolicyUrl(legacy)}${legacy ? "Rule" : "Matcher"}`;
const mockEditorsPolicyUrl = (legacy) =>
  `${mockEditorsPolicyResourceUrl(legacy)}#editorsPolicy`;
const mockEditorsPolicyRuleUrl = (legacy) =>
  `${mockEditorsPolicyResourceUrl(legacy)}${legacy ? "Rule" : "Matcher"}`;
const mockWriteApplyPolicyUrl = (legacy) =>
  `${mockPolicyResourceUrl(legacy)}#writeApplyPolicy`;
const mockWritePolicyRuleUrl = (legacy) =>
  `${mockWriteApplyPolicyUrl(legacy)}${legacy ? "Rule" : "Matcher"}`;
const mockAppendApplyPolicyUrl = (legacy) =>
  `${mockPolicyResourceUrl(legacy)}#appendApplyPolicy`;
const mockControlAccessPolicyUrl = (legacy) =>
  `${mockPolicyResourceUrl(legacy)}#controlAccessPolicy`;
const mockControlPolicyRuleUrl = (legacy) =>
  `${mockControlAccessPolicyUrl(legacy)}${legacy ? "Rule" : "Matcher"}`;
const mockControlApplyPolicyUrl = (legacy) =>
  `${mockPolicyResourceUrl(legacy)}#controlApplyPolicy`;

describe("AcpAccessControlStrategy", () => {
  const resourceInfoUrl = "http://example.com/resourceInfo";
  const resourceInfo = mockSolidDatasetFrom(resourceInfoUrl);
  const fetch = jest.fn();
  const datasetWithAcrUrl = resourceUrl;
  const acr = acpFns4.mockAcrFor(datasetWithAcrUrl);

  const datasetWithLegacyAcr = chain(
    mockSolidDatasetFrom(datasetWithAcrUrl),
    (d) => acpFns4.addMockAcrTo(d, acr),
    (d) => acpFns4.addPolicyUrl(d, mockEditorsPolicyUrl(true))
  );
  const datasetWithLatestAcr = chain(
    mockSolidDatasetFrom(datasetWithAcrUrl),
    (d) => acpFns4.addMockAcrTo(d, acr),
    (d) => acpFns4.addPolicyUrl(d, mockEditorsPolicyUrl(false))
  );

  const mockDatasetWithAcr = (legacy) =>
    // This prevents re-generating a default Access Control each time, which
    // breaks deep equality.
    legacy ? datasetWithLegacyAcr : datasetWithLatestAcr;

  describe("init", () => {
    let acp;
    beforeEach(async () => {
      jest
        .spyOn(acpFns4, "getResourceInfoWithAcr")
        .mockResolvedValue(mockDatasetWithAcr(false));
      acp = await AcpAccessControlStrategy.init(
        resourceInfo,
        policiesContainerUrl,
        fetch,
        false
      );
    });

    it("uses getResourceInfoWithAcr to fetch data", () =>
      expect(
        acpFns4.getResourceInfoWithAcr
      ).toHaveBeenCalledWith(resourceInfoUrl, { fetch }));

    it("exposes the methods we expect for a access control strategy", () =>
      ["getPermissions", "savePermissionsForAgent"].forEach((method) =>
        expect(acp[method]).toBeDefined()
      ));

    it("throws an error if ACR is not accessible", async () => {
      const dataset = mockSolidDatasetFrom(datasetWithAcrUrl);
      acpFns4.getResourceInfoWithAcr.mockResolvedValue(dataset);
      await expect(
        AcpAccessControlStrategy.init(resourceInfo, policiesContainerUrl, fetch)
      ).rejects.toEqual(new Error(noAcrAccessError));
    });
  });

  describe("getOrCreatePolicy", () => {
    describe("legacy ACP systems", () => {
      const policyDataset = mockSolidDatasetFrom(mockPolicyResourceUrl(true));
      const policyThing = acpFns4.createPolicy(mockReadApplyPolicyUrl(true));

      it("returns existing policy", () => {
        const modifiedDataset = chain(policyDataset, (d) =>
          setThing(d, policyThing)
        );
        const { policy, dataset } = getOrCreatePolicy(
          modifiedDataset,
          mockReadApplyPolicyUrl(true)
        );
        expect(policy).toEqual(policyThing);
        expect(dataset).toEqual(modifiedDataset);
      });

      it("creates new policy if none exist", () => {
        const { policy, dataset } = getOrCreatePolicy(
          policyDataset,
          mockReadApplyPolicyUrl(true)
        );
        expect(policy).toEqual(policyThing);
        expect(dataset).toEqual(setThing(policyDataset, policyThing));
      });
    });

    describe("latest ACP systems", () => {
      const policyDataset = mockSolidDatasetFrom(mockPolicyResourceUrl(false));
      const policyThing = acpFns4.createPolicy(mockReadApplyPolicyUrl(false));

      it("returns existing policy", () => {
        const modifiedDataset = chain(policyDataset, (d) =>
          setThing(d, policyThing)
        );
        const { policy, dataset } = getOrCreatePolicy(
          modifiedDataset,
          mockReadApplyPolicyUrl(false)
        );
        expect(policy).toEqual(policyThing);
        expect(dataset).toEqual(modifiedDataset);
      });

      it("creates new policy if none exist", () => {
        const { policy, dataset } = getOrCreatePolicy(
          policyDataset,
          mockReadApplyPolicyUrl(false)
        );
        expect(policy).toEqual(policyThing);
        expect(dataset).toEqual(setThing(policyDataset, policyThing));
      });
    });
  });

  describe("getPermissionsForPolicy", () => {
    const webId = "http://example.com/agent1";
    const policyName = "editors";

    describe("legacy ACP strategy", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(true),
          policiesContainerUrl,
          fetch,
          true
        );
      });

      it("normalizes the permissions retrieved from the policy resource", async () => {
        const editorsPolicyRule = chain(
          acpFns3.createRule(mockEditorsPolicyRuleUrl(true)),
          (r) => acpFns4.addAgent(r, webId)
        );
        const editorsPolicy = chain(
          acpFns4.createPolicy(mockEditorsPolicyUrl(true)),
          (p) => acpFns3.setAllowModes(p, createAcpMap(true, true)),
          (p) => acpFns3.setAllOfRuleUrl(p, editorsPolicyRule)
        );

        const policyDataset = chain(
          mockSolidDatasetFrom(mockEditorsPolicyResourceUrl(true)),
          (d) => setThing(d, editorsPolicyRule),
          (d) => setThing(d, editorsPolicy)
        );
        jest.spyOn(scFns, "getSolidDataset").mockResolvedValue(policyDataset);
        const profile = mockProfileAlice();
        jest.spyOn(profileFns, "fetchProfile").mockResolvedValue(profile);

        await expect(acp.getPermissionsForPolicy(policyName)).resolves.toEqual([
          {
            acl: createAccessMap(true, true, false, false),
            alias: policyName,
            inherited: false,
            webId,
            type: "agent",
          },
        ]);
      });
    });

    describe("latest ACP strategy", () => {
      let acp;
      beforeEach(() => {
        jest
          .spyOn(acpFns4, "getPolicyUrlAll")
          .mockReturnValue([mockEditorsPolicyUrl(false)]);
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(false),
          policiesContainerUrl,
          fetch,
          false
        );
      });

      it("normalizes the permissions retrieved from the policy resource", async () => {
        const editorsPolicyRule = chain(
          acpFns4.createMatcher(mockEditorsPolicyRuleUrl(false)),
          (r) => acpFns4.addAgent(r, webId)
        );
        const editorsPolicy = chain(
          acpFns4.createPolicy(mockEditorsPolicyUrl(false)),
          (p) => acpFns4.setAllowModes(p, createAcpMap(true, true)),
          (p) => acpFns4.setAllOfMatcherUrl(p, editorsPolicyRule)
        );

        const policyDataset = chain(
          mockSolidDatasetFrom(mockEditorsPolicyResourceUrl(false)),
          (d) => setThing(d, editorsPolicyRule),
          (d) => setThing(d, editorsPolicy)
        );
        jest.spyOn(scFns, "getSolidDataset").mockResolvedValue(policyDataset);
        const profile = mockProfileAlice();
        jest.spyOn(profileFns, "fetchProfile").mockResolvedValue(profile);

        await expect(acp.getPermissionsForPolicy(policyName)).resolves.toEqual([
          {
            acl: createAccessMap(true, true, false, false),
            alias: policyName,
            inherited: false,
            webId,
            type: "agent",
          },
        ]);
      });

      it("returns an empty array if no policy resource is available", async () => {
        jest
          .spyOn(scFns, "getSolidDataset")
          .mockRejectedValue(new Error("404"));
        await expect(acp.getPermissionsForPolicy(policyName)).resolves.toEqual(
          []
        );
      });

      it("throws an error if anything but 404 for the policy resource happens", async () => {
        const error = new Error("500");
        jest.spyOn(scFns, "getSolidDataset").mockRejectedValue(error);
        await expect(acp.getPermissionsForPolicy(policyName)).rejects.toEqual(
          error
        );
      });
    });
  });

  describe("getPermissions", () => {
    const webId = "http://example.com/agent1";

    describe("legacy ACP strategy", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(true),
          policiesContainerUrl,
          fetch,
          true
        );
      });

      it("normalizes the permissions retrieved from the policy resource", async () => {
        const readPolicyRule = chain(
          acpFns3.createRule(mockReadPolicyRuleUrl(true)),
          (r) => acpFns4.addAgent(r, webId)
        );
        const readPolicy = chain(
          acpFns4.createPolicy(mockReadApplyPolicyUrl(true)),
          (p) => acpFns3.setAllowModes(p, createAcpMap(true)),
          (p) => acpFns3.setAllOfRuleUrl(p, readPolicyRule)
        );
        const controlPolicyRule = chain(
          acpFns3.createRule(mockControlPolicyRuleUrl(true)),
          (r) => acpFns4.addAgent(r, webId)
        );
        const controlPolicy = chain(
          acpFns4.createPolicy(mockControlAccessPolicyUrl(true)),
          (p) => acpFns3.setAllowModes(p, createAcpMap(true, true)),
          (p) => acpFns3.setAllOfRuleUrl(p, controlPolicyRule)
        );
        const policyDataset = chain(
          mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
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

    describe("latest ACP strategy", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(false),
          policiesContainerUrl,
          fetch
        );
      });

      it("normalizes the permissions retrieved from the policy resource (latest)", async () => {
        const readPolicyRule = chain(
          acpFns4.createMatcher(mockReadPolicyRuleUrl(false)),
          (r) => acpFns4.addAgent(r, webId)
        );
        const readPolicy = chain(
          acpFns4.createPolicy(mockReadApplyPolicyUrl(false)),
          (p) => acpFns4.setAllowModes(p, createAcpMap(true)),
          (p) => acpFns4.setAllOfMatcherUrl(p, readPolicyRule)
        );
        const controlPolicyRule = chain(
          acpFns4.createMatcher(mockControlPolicyRuleUrl(false)),
          (r) => acpFns4.addAgent(r, webId)
        );
        const controlPolicy = chain(
          acpFns4.createPolicy(mockControlAccessPolicyUrl(false)),
          (p) => acpFns4.setAllowModes(p, createAcpMap(true, true)),
          (p) => acpFns4.setAllOfMatcherUrl(p, controlPolicyRule)
        );
        const policyDataset = chain(
          mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
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
    });
  });

  describe("addAgentToPolicy", () => {
    const webId = "http://example.com/agent1";
    let acp;

    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        mockDatasetWithAcr(false),
        policiesContainerUrl,
        fetch
      );
    });
    it("fails if the policy resource returns something other than 404", async () => {
      const error = "500";
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error(error);
      });
      await expect(acp.addAgentToPolicy(webId, "editors")).resolves.toEqual({
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
      await expect(acp.addAgentToPolicy(webId, "editors")).resolves.toEqual({
        error: "500",
      });
    });
    it.skip("returns the modified datasetWithAcr after adding agent to policy", async () => {
      const editorsAC = acpFns4.mockAcrFor(datasetWithAcrUrl);
      jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
        throw new Error("404");
      });
      const policyResource = chain(
        mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
        (d) => acpFns4.addMockAcrTo(d)
      );
      const datasetWithAcrEditors = acpFns4.addMockAcrTo(
        mockDatasetWithAcr(true),
        editorsAC
      );
      const datasetWithAcrControlAccess = chain(
        datasetWithAcrEditors,
        (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(true)),
        (d) =>
          acpFns3.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(true))
      );
      jest
        .spyOn(acpFns4, "saveAcrFor")
        .mockResolvedValue(datasetWithAcrEditors);
      jest
        .spyOn(acpFns4, "getSolidDatasetWithAcr")
        .mockImplementation(() => policyResource);
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => policyResource);
      await expect(acp.addAgentToPolicy(webId, "editors")).resolves.toEqual({
        response: policyResource,
      });
      expect(acpFns4.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrEditors, {
        fetch,
      });
      expect(acpFns4.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlAccess,
        {
          fetch,
        }
      );
      const datasetWithAcrControlApply = chain(
        policyResource,
        (d) => acpFns4.addAcrPolicyUrl(d, mockControlApplyPolicyUrl(true)),
        (d) => acpFns3.addMemberAcrPolicyUrl(d, mockControlApplyPolicyUrl(true))
      );
      expect(acpFns4.saveAcrFor).toHaveBeenCalledWith(
        datasetWithAcrControlApply,
        {
          fetch,
        }
      );
    });
  });

  describe("removeAgentFromPolicy", () => {
    const webId = "http://example.com/agent1";

    describe("latest ACP systems", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(false),
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
          acp.removeAgentFromPolicy(webId, "editors")
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
          acp.removeAgentFromPolicy(webId, "editors")
        ).resolves.toEqual({ error: "500" });
      });

      it("deletes rule and policy if agent is the last one on the list", async () => {
        const mockedRemoveRule = jest.spyOn(acpFns4, "removeAllOfMatcherUrl");
        const mockedDeleteFile = jest
          .spyOn(scFns, "deleteFile")
          .mockResolvedValue();
        const webId1 = "http://example.com/agent1";
        const editorsPolicyRule = chain(
          acpFns4.createMatcher(mockEditorsPolicyRuleUrl(false)),
          (r) => acpFns4.addAgent(r, webId1)
        );
        const policy = chain(
          acpFns4.createPolicy(mockEditorsPolicyUrl(false)),
          (p) => acpFns4.setAllowModes(p, createAcpMap(true, true)),
          (p) => acpFns4.setAllOfMatcherUrl(p, editorsPolicyRule)
        );
        const policyDataset = chain(
          mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
          (d) => setThing(d, editorsPolicyRule),
          (d) => setThing(d, policy)
        );
        const editorsAC = acpFns4.mockAcrFor(datasetWithAcrUrl);

        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error("404");
        });
        jest.spyOn(acpFns4, "getPolicy").mockReturnValue(policy);
        const policyResource = acpFns4.addMockAcrTo(policyDataset);
        const datasetWithAcrEditors = chain(
          acpFns4.addMockAcrTo(mockDatasetWithAcr(false), editorsAC),
          (ac) => acpFns4.addAcrPolicyUrl(ac, mockEditorsPolicyUrl(false)),
          (ac) => acpFns4.addAcrPolicyUrl(ac, mockEditorsPolicyUrl(false))
        );
        const datasetWithAcrControlAccess = chain(
          datasetWithAcrEditors,
          (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(false)),
          (d) =>
            acpFns4.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(false))
        );

        jest
          .spyOn(acpFns4, "saveAcrFor")
          .mockResolvedValueOnce(datasetWithAcrEditors)
          .mockResolvedValue(datasetWithAcrControlAccess);
        jest
          .spyOn(acpFns4, "getSolidDatasetWithAcr")
          .mockImplementation(() => policyResource);
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockImplementation(() => policyResource);

        await acp.removeAgentFromPolicy(webId, "editors");

        expect(mockedRemoveRule).toHaveBeenCalledWith(
          policy,
          mockEditorsPolicyRuleUrl(false)
        );
        expect(mockedDeleteFile).not.toHaveBeenCalled();
      });
    });

    describe("legacy ACP systems", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(false),
          policiesContainerUrl,
          fetch,
          true
        );
      });
      it("deletes rule and policy if agent is the last one on the list", async () => {
        const mockedRemoveRule = jest.spyOn(acpFns3, "removeAllOfRuleUrl");
        const mockedDeleteFile = jest
          .spyOn(scFns, "deleteFile")
          .mockResolvedValue();
        const webId1 = "http://example.com/agent1";
        const editorsPolicyRule = chain(
          acpFns3.createRule(mockEditorsPolicyRuleUrl(true)),
          (r) => acpFns4.addAgent(r, webId1)
        );
        const policy = chain(
          acpFns4.createPolicy(mockEditorsPolicyUrl(true)),
          (p) => acpFns4.setAllowModes(p, createAcpMap(true, true)),
          (p) => acpFns3.setAllOfRuleUrl(p, editorsPolicyRule)
        );
        const policyDataset = chain(
          mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
          (d) => setThing(d, editorsPolicyRule),
          (d) => setThing(d, policy)
        );
        const editorsAC = acpFns4.mockAcrFor(datasetWithAcrUrl);

        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error("404");
        });
        jest.spyOn(acpFns4, "getPolicy").mockReturnValue(policy);
        const policyResource = acpFns4.addMockAcrTo(policyDataset);
        const datasetWithAcrEditors = chain(
          acpFns4.addMockAcrTo(mockDatasetWithAcr(true), editorsAC),
          (ac) => acpFns4.addAcrPolicyUrl(ac, mockEditorsPolicyUrl(true)),
          (ac) => acpFns4.addAcrPolicyUrl(ac, mockEditorsPolicyUrl(true))
        );
        const datasetWithAcrControlAccess = chain(
          datasetWithAcrEditors,
          (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(true)),
          (d) =>
            acpFns3.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(true))
        );

        jest
          .spyOn(acpFns4, "saveAcrFor")
          .mockResolvedValueOnce(datasetWithAcrEditors)
          .mockResolvedValue(datasetWithAcrControlAccess);
        jest
          .spyOn(acpFns4, "getSolidDatasetWithAcr")
          .mockImplementation(() => policyResource);
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockImplementation(() => policyResource);

        await acp.removeAgentFromPolicy(webId, "editors");

        expect(mockedRemoveRule).toHaveBeenCalledWith(
          policy,
          mockEditorsPolicyRuleUrl(true)
        );
        expect(mockedDeleteFile).toHaveBeenCalledWith(
          mockEditorsPolicyUrl(true),
          {
            fetch,
          }
        );
      });

      it.skip("returns the modified datasetWithAcr after removing agent from policy", async () => {
        const webId1 = "http://example.com/agent1";
        const webId2 = "http://example.com/agent2";
        const editorsPolicyRule = chain(
          acpFns3.createRule(mockEditorsPolicyRuleUrl(true)),
          (r) => acpFns4.addAgent(r, webId1),
          (r) => acpFns4.addAgent(r, webId2)
        );
        const policy = chain(
          acpFns4.createPolicy(mockEditorsPolicyUrl(true)),
          (p) => acpFns4.setAllowModes(p, createAcpMap(true, true)),
          (p) => acpFns3.setAllOfRuleUrl(p, editorsPolicyRule)
        );
        const policyDataset = chain(
          mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
          (d) => setThing(d, editorsPolicyRule),
          (d) => setThing(d, policy)
        );
        const editorsAC = acpFns4.mockAcrFor(datasetWithAcrUrl);
        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error("404");
        });
        jest.spyOn(acpFns4, "getPolicy").mockReturnValue(policy);
        const policyResource = chain(policyDataset, (d) =>
          acpFns4.addMockAcrTo(d)
        );
        const datasetWithAcrEditors = acpFns4.addMockAcrTo(
          mockDatasetWithAcr(true),
          editorsAC
        );
        const datasetWithAcrControlAccess = chain(
          datasetWithAcrEditors,
          (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(true)),
          (d) =>
            acpFns3.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(true))
        );
        jest
          .spyOn(acpFns4, "saveAcrFor")
          .mockResolvedValueOnce(datasetWithAcrEditors)
          .mockResolvedValue(datasetWithAcrControlAccess);
        jest
          .spyOn(acpFns4, "getSolidDatasetWithAcr")
          .mockImplementation(() => policyResource);
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockImplementation(() => policyResource);
        jest.spyOn(scFns, "deleteFile").mockResolvedValue("deleted");

        expect(await acp.removeAgentFromPolicy(webId, "editors")).toEqual({
          response: datasetWithAcrControlAccess,
        });
        expect(acpFns4.saveAcrFor).toHaveBeenCalledWith(datasetWithAcrEditors, {
          fetch,
        });
        expect(acpFns4.saveAcrFor).toHaveBeenCalledWith(
          datasetWithAcrControlAccess,
          {
            fetch,
          }
        );
        expect(acpFns4.saveAcrFor).toHaveBeenCalledWith(
          datasetWithAcrControlAccess,
          {
            fetch,
          }
        );
      });
    });
  });

  describe("setRulePublic", () => {
    let acp;
    beforeEach(() => {
      acp = new AcpAccessControlStrategy(
        mockDatasetWithAcr(false),
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
      jest.spyOn(scFns, "getSolidDataset").mockRejectedValue(new Error("404"));
      jest
        .spyOn(acpFns4, "saveAcrFor")
        .mockResolvedValueOnce(mockDatasetWithAcr(false))
        .mockResolvedValue(mockDatasetWithAcr(false));
      jest
        .spyOn(acpFns4, "getSolidDatasetWithAcr")
        .mockImplementation(() => mockDatasetWithAcr(false));
      jest
        .spyOn(scFns, "saveSolidDatasetAt")
        .mockImplementation(() => mockDatasetWithAcr(false));

      expect(await acp.setRulePublic("editors", true)).toEqual({
        response: mockDatasetWithAcr(false),
      });
    });
  });

  describe("setRuleAuthenticated", () => {
    describe("legacy ACP systems", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(true),
          policiesContainerUrl,
          fetch,
          true
        );
      });

      it("returns the modified datasetWithAcr after adding authenticated agent to rule", async () => {
        const editorsAC = acpFns4.mockAcrFor(datasetWithAcrUrl);
        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error("404");
        });
        const datasetWithAcrEditorsPolicyUrl = acpFns4.addPolicyUrl(
          mockDatasetWithAcr(true),
          mockEditorsPolicyUrl(true)
        );
        const datasetWithAcrEditors = acpFns4.addMockAcrTo(
          datasetWithAcrEditorsPolicyUrl,
          editorsAC
        );
        const datasetWithAcrControlAccess = chain(
          datasetWithAcrEditors,
          (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(true)),
          (d) =>
            acpFns3.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(true))
        );
        jest
          .spyOn(acpFns4, "saveAcrFor")
          .mockResolvedValueOnce(mockDatasetWithAcr(true))
          .mockResolvedValue(mockDatasetWithAcr(true));
        jest
          .spyOn(acpFns4, "getSolidDatasetWithAcr")
          .mockImplementation(() => mockDatasetWithAcr(true));
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockImplementation(() => mockDatasetWithAcr(true));

        expect(await acp.setRuleAuthenticated("editors", true)).toEqual({
          response: mockDatasetWithAcr(true),
        });
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
    });

    describe("latset ACP systems", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(false),
          policiesContainerUrl,
          fetch
        );
      });

      it("returns the modified datasetWithAcr after adding authenticated agent to rule", async () => {
        const editorsAC = acpFns4.mockAcrFor(datasetWithAcrUrl);
        jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
          throw new Error("404");
        });
        const datasetWithAcrEditorsPolicyUrl = acpFns4.addPolicyUrl(
          mockDatasetWithAcr(false),
          mockEditorsPolicyUrl(false)
        );
        const datasetWithAcrEditors = acpFns4.addMockAcrTo(
          datasetWithAcrEditorsPolicyUrl,
          editorsAC
        );
        const datasetWithAcrControlAccess = chain(
          datasetWithAcrEditors,
          (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(false)),
          (d) =>
            acpFns4.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(false))
        );
        jest
          .spyOn(acpFns4, "saveAcrFor")
          .mockResolvedValueOnce(mockDatasetWithAcr(false))
          .mockResolvedValue(mockDatasetWithAcr(false));
        jest
          .spyOn(acpFns4, "getSolidDatasetWithAcr")
          .mockImplementation(() => mockDatasetWithAcr(false));
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockImplementation(() => mockDatasetWithAcr(false));

        expect(await acp.setMatcherAuthenticated("editors", true)).toEqual({
          response: mockDatasetWithAcr(false),
        });
      });
    });
  });

  describe("savePermissionsForAgent", () => {
    const webId = "http://example.com/agent1";
    const readAC = acpFns4.mockAcrFor(datasetWithAcrUrl);
    const writeAC = acpFns4.mockAcrFor(datasetWithAcrUrl);
    const appendAC = acpFns4.mockAcrFor(datasetWithAcrUrl);

    describe("latest ACP systems", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(false),
          policiesContainerUrl,
          fetch
        );
      });

      describe("adding an agent to a policy resource that doesn't exist", () => {
        it("returns the modified datasetWithAcr after adding modes to agent", async () => {
          jest
            .spyOn(scFns, "getSolidDataset")
            .mockRejectedValueOnce(new Error("404"));
          const policyResource = mockSolidDatasetFrom(
            mockPolicyResourceUrl(false)
          );
          const datasetWithAcrRead = acpFns4.addPolicyUrl(
            mockDatasetWithAcr(false),
            mockReadApplyPolicyUrl(false)
          );
          const datasetWithAcrWrite = acpFns4.addPolicyUrl(
            datasetWithAcrRead,
            mockWriteApplyPolicyUrl(false)
          );
          const datasetWithAcrAppend = acpFns4.addPolicyUrl(
            datasetWithAcrWrite,
            mockAppendApplyPolicyUrl(false)
          );
          const datasetWithAcrControlAccess = chain(
            datasetWithAcrAppend,
            (d) =>
              acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(false)),
            (d) =>
              acpFns4.addMemberAcrPolicyUrl(
                d,
                mockControlAccessPolicyUrl(false)
              )
          );
          jest
            .spyOn(acpFns4, "saveAcrFor")
            .mockResolvedValueOnce(datasetWithAcrRead) // after adding read
            .mockResolvedValueOnce(datasetWithAcrWrite) // after adding write
            .mockResolvedValueOnce(datasetWithAcrAppend) // after adding append
            .mockResolvedValue(datasetWithAcrControlAccess); // after adding control access - and rest
          jest
            .spyOn(acpFns4, "getSolidDatasetWithAcr")
            .mockResolvedValue(mockDatasetWithAcr(false));
          jest
            .spyOn(scFns, "saveSolidDatasetAt")
            .mockResolvedValue(policyResource);

          await expect(
            acp.savePermissionsForAgent(
              webId,
              createAccessMap(true, true, true, true)
            )
          ).resolves.toEqual({ response: datasetWithAcrRead });
        });
      });

      it("fails if the policy resource returns something other than 404", async () => {
        const error = "500";
        jest
          .spyOn(scFns, "getSolidDataset")
          .mockRejectedValueOnce(new Error(error));
        await expect(
          acp.savePermissionsForAgent(webId, createAccessMap())
        ).resolves.toEqual({ error });
      });

      it("fails if the policy resources returns an error upon trying to create it", async () => {
        jest
          .spyOn(scFns, "getSolidDataset")
          .mockRejectedValueOnce(new Error("404"));
        jest
          .spyOn(scFns, "saveSolidDatasetAt")
          .mockRejectedValueOnce(new Error("500"));
        await expect(
          acp.savePermissionsForAgent(webId, createAccessMap())
        ).resolves.toEqual({ error: "500" });
      });
    });

    describe("legacy ACP systems", () => {
      let acp;
      beforeEach(() => {
        acp = new AcpAccessControlStrategy(
          mockDatasetWithAcr(true),
          policiesContainerUrl,
          fetch,
          true
        );
      });

      describe("adding an agent to a policy resource that doesn't exist", () => {
        it("returns the modified datasetWithAcr after adding modes to agent", async () => {
          jest.spyOn(scFns, "getSolidDataset").mockImplementation(() => {
            throw new Error("404");
          });
          const policyResource = mockSolidDatasetFrom(
            mockPolicyResourceUrl(true)
          );
          const datasetWithAcrRead = acpFns4.addPolicyUrl(
            mockDatasetWithAcr(true),
            mockReadApplyPolicyUrl(true)
          );
          const datasetWithAcrWrite = acpFns4.addPolicyUrl(
            datasetWithAcrRead,
            mockWriteApplyPolicyUrl(true)
          );
          const datasetWithAcrAppend = acpFns4.addPolicyUrl(
            datasetWithAcrWrite,
            mockAppendApplyPolicyUrl(true)
          );
          const datasetWithAcrControlAccess = chain(
            datasetWithAcrAppend,
            (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(true)),
            (d) =>
              acpFns3.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(true))
          );
          jest
            .spyOn(acpFns4, "saveAcrFor")
            .mockResolvedValueOnce(datasetWithAcrRead) // after adding read
            .mockResolvedValueOnce(datasetWithAcrWrite) // after adding write
            .mockResolvedValueOnce(datasetWithAcrAppend) // after adding append
            .mockResolvedValue(datasetWithAcrControlAccess); // after adding control access - and rest
          jest
            .spyOn(acpFns4, "getSolidDatasetWithAcr")
            .mockResolvedValue(mockDatasetWithAcr(true));
          jest
            .spyOn(scFns, "saveSolidDatasetAt")
            .mockResolvedValue(policyResource);

          await expect(
            acp.savePermissionsForAgent(
              webId,
              createAccessMap(true, true, true, true)
            )
          ).resolves.toEqual({ response: datasetWithAcrRead });
        });

        it.skip("returns the modified datasetWithAcr after removing modes from agent", async () => {
          const policyResource = chain(
            mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
            (d) => acpFns4.addMockAcrTo(d, readAC),
            (d) => acpFns4.addMockAcrTo(d, writeAC),
            (d) => acpFns4.addMockAcrTo(d, appendAC),
            (d) => acpFns4.addAcrPolicyUrl(d, mockControlAccessPolicyUrl(true)),
            (d) =>
              acpFns3.addMemberAcrPolicyUrl(d, mockControlAccessPolicyUrl(true))
          );
          jest
            .spyOn(scFns, "getSolidDataset")
            .mockResolvedValue(policyResource);
          jest
            .spyOn(acpFns4, "getSolidDatasetWithAcr")
            .mockResolvedValue(policyResource);
          jest
            .spyOn(scFns, "saveSolidDatasetAt")
            .mockResolvedValue(policyResource);
          jest.spyOn(acpFns4, "saveAcrFor").mockResolvedValue(policyResource);

          await expect(
            acp.savePermissionsForAgent(webId, createAccessMap())
          ).resolves.toEqual({ response: policyResource });
        });
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

describe("getPolicyDetailFromAccess", () => {
  const readAccess = createAcpMap(true);
  const readWriteAccess = createAcpMap(true, true);
  const readAppendAccess = createAcpMap(true, false, true);
  const writeAccess = createAcpMap(false, true, false);
  const appendAccess = createAcpMap(false, false, true);
  it("returns the correct policy name for a given access map", () => {
    expect(getPolicyDetailFromAccess(readAccess, "name")).toEqual("viewers");
    expect(getPolicyDetailFromAccess(readWriteAccess, "name")).toEqual(
      "editors"
    );
    expect(getPolicyDetailFromAccess(readAppendAccess, "name")).toEqual(
      "viewAndAdd"
    );
    expect(getPolicyDetailFromAccess(writeAccess, "name")).toEqual("editOnly");
    expect(getPolicyDetailFromAccess(appendAccess, "name")).toEqual("addOnly");
  });
  it("returns null if type of access is not covered", () => {
    const readWriteAppendAccess = createAcpMap(true, true, true);
    expect(getPolicyDetailFromAccess(readWriteAppendAccess, "name")).toBeNull();
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
  it("adds type if available", () => {
    const type = "editors";
    expect(
      getOrCreatePermission({ [webId]: { test: 42, webId } }, webId, type)
    ).toEqual({
      ...blankPermission,
      test: 42,
      type,
    });
  });
});

describe("getMatchersOrCreate", () => {
  describe("legacy ACP systems", () => {
    const readPolicy = chain(
      acpFns4.createPolicy(mockReadApplyPolicyUrl(true)),
      (p) => acpFns4.setAllowModes(p, createAcpMap(true))
    );
    const readPolicyRule = acpFns3.createRule(mockReadPolicyRuleUrl(true));
    const policyDataset = chain(
      mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
      (d) => acpFns4.setPolicy(d, readPolicy)
    );

    it("creates a rule on the fly if no rules exist", () => {
      expect(getMatchersOrCreate([], readPolicy, policyDataset, true)).toEqual({
        existing: false,
        matchers: [acpFns3.createRule(mockReadPolicyRuleUrl(true))],
      });
    });

    it("returns existing rule if it exist", () => {
      const modifiedPolicyDataset = setThing(policyDataset, readPolicyRule);
      expect(
        getMatchersOrCreate(
          [mockReadPolicyRuleUrl(true)],
          readPolicy,
          modifiedPolicyDataset,
          true
        )
      ).toEqual({
        existing: true,
        matchers: [readPolicyRule],
      });
    });
  });

  describe("latest ACP systems", () => {
    const readPolicy = chain(
      acpFns4.createPolicy(mockReadApplyPolicyUrl(false)),
      (p) => acpFns4.setAllowModes(p, createAcpMap(true))
    );
    const readPolicyRule = acpFns4.createMatcher(mockReadPolicyRuleUrl(false));
    const policyDataset = chain(
      mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
      (d) => acpFns4.setPolicy(d, readPolicy)
    );

    it("creates a rule on the fly if no rules exist azdjb", () => {
      expect(getMatchersOrCreate([], readPolicy, policyDataset)).toEqual({
        existing: false,
        matchers: [acpFns4.createMatcher(mockReadPolicyRuleUrl(false))],
      });
    });

    it("returns existing rule if it exist", () => {
      const modifiedPolicyDataset = setThing(policyDataset, readPolicyRule);
      expect(
        getMatchersOrCreate(
          [mockReadPolicyRuleUrl(false)],
          readPolicy,
          modifiedPolicyDataset
        )
      ).toEqual({
        existing: true,
        matchers: [readPolicyRule],
      });
    });
  });
});

describe("getRuleWithAgent", () => {
  describe("legacy ACP system", () => {
    const ruleUrl = "http://example.com/#Rule";
    const rule = acpFns3.createRule(ruleUrl);
    const webId = "http://example.com/profile/card#me";

    it("returns a rule if it's connected to the agent", () => {
      const ruleWithAgent = acpFns4.addAgent(rule, webId);
      expect(getMatcherWithAgent([rule, ruleWithAgent], webId)).toBe(
        ruleWithAgent
      );
    });

    it("returns first rule if no rule is connected to the agent", () => {
      expect(getMatcherWithAgent([rule], webId)).toBe(rule);
    });
  });

  describe("latest ACP systems", () => {
    const matcherUrl = "http://example.com/#Matcher";
    const matcher = acpFns4.createMatcher(matcherUrl);
    const webId = "http://example.com/profile/card#me";

    it("returns a rule if it's connected to the agent", () => {
      const ruleWithAgent = acpFns4.addAgent(matcher, webId);
      expect(getMatcherWithAgent([matcher, ruleWithAgent], webId)).toBe(
        ruleWithAgent
      );
    });

    it("returns first rule if no rule is connected to the agent", () => {
      expect(getMatcherWithAgent([matcher], webId)).toBe(matcher);
    });
  });
});

describe("setAgents", () => {
  describe("legacy ACP systems", () => {
    const readPolicy = chain(
      acpFns4.createPolicy(mockReadApplyPolicyUrl(true)),
      (p) => acpFns4.setAllowModes(p, createAcpMap(true))
    );
    const readPolicyRule = acpFns3.createRule(mockReadPolicyRuleUrl(true));
    const policyDataset = chain(
      mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
      (d) => acpFns4.setPolicy(d, readPolicy)
    );
    const webId = "http://example.com/profile/card#me";

    describe("adding agent", () => {
      it("will add new rule and add agent to it", () => {
        const expectedRule = acpFns4.addAgent(readPolicyRule, webId);
        const expectedDataset = setThing(policyDataset, expectedRule);
        const expectedPolicy = acpFns3.addAllOfRuleUrl(
          readPolicy,
          expectedRule
        );
        expect(setAgents(readPolicy, policyDataset, webId, true, true)).toEqual(
          {
            policy: expectedPolicy,
            dataset: expectedDataset,
          }
        );
      });

      it("will use existing rule and add agent to it", () => {
        const policyDatasetWithRule = setThing(policyDataset, readPolicyRule);
        const expectedRule = acpFns4.addAgent(readPolicyRule, webId);
        const expectedDataset = setThing(policyDatasetWithRule, expectedRule);
        const expectedPolicy = acpFns3.setAllOfRuleUrl(
          readPolicy,
          expectedRule
        );
        expect(
          setAgents(readPolicy, policyDatasetWithRule, webId, true, true)
        ).toEqual({
          policy: expectedPolicy,
          dataset: expectedDataset,
        });
      });

      it("will use existing rule and not add agent to it if agent already is added", () => {
        const ruleWithAgent = acpFns4.addAgent(readPolicyRule, webId);
        const policyDatasetWithRule = setThing(policyDataset, ruleWithAgent);
        const expectedDataset = setThing(policyDatasetWithRule, ruleWithAgent);
        const expectedPolicy = acpFns3.setAllOfRuleUrl(
          readPolicy,
          ruleWithAgent
        );
        expect(
          setAgents(readPolicy, policyDatasetWithRule, webId, true, true)
        ).toEqual({
          policy: expectedPolicy,
          dataset: expectedDataset,
        });
      });
    });

    describe("removing agent", () => {
      it("adds rule to policy and dataset if trying to remove agent when there are no rules yet", () => {
        const expectedPolicy = acpFns3.setAllOfRuleUrl(
          readPolicy,
          readPolicyRule
        );
        const expectedDataset = setThing(policyDataset, readPolicyRule);
        expect(
          setAgents(readPolicy, policyDataset, webId, false, true)
        ).toEqual({
          policy: expectedPolicy,
          dataset: expectedDataset,
        });
      });

      it("removes agent from rule", () => {
        const ruleWithAgent = acpFns4.addAgent(readPolicyRule, webId);
        const policyWithRule = acpFns3.setAllOfRuleUrl(
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
          false,
          true
        );
        expect(policy).toEqual(policyWithRule);
        const rules = acpFns3.getRuleAll(dataset);
        expect(rules).toHaveLength(1);
        const agents = acpFns4.getAgentAll(rules[0]);
        expect(agents).toHaveLength(0);
      });
    });
  });

  describe("latest ACP systems", () => {
    const readPolicy = chain(
      acpFns4.createPolicy(mockReadApplyPolicyUrl(false)),
      (p) => acpFns4.setAllowModes(p, createAcpMap(true))
    );
    const readPolicyRule = acpFns4.createMatcher(mockReadPolicyRuleUrl(false));
    const policyDataset = chain(
      mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
      (d) => acpFns4.setPolicy(d, readPolicy)
    );
    const webId = "http://example.com/profile/card#me";

    describe("adding agent", () => {
      it("will add new rule and add agent to it", () => {
        const expectedRule = acpFns4.addAgent(readPolicyRule, webId);
        const expectedDataset = setThing(policyDataset, expectedRule);
        const expectedPolicy = acpFns4.addAllOfMatcherUrl(
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
        const expectedRule = acpFns4.addAgent(readPolicyRule, webId);
        const expectedDataset = setThing(policyDatasetWithRule, expectedRule);
        const expectedPolicy = acpFns4.setAllOfMatcherUrl(
          readPolicy,
          expectedRule
        );
        expect(
          setAgents(readPolicy, policyDatasetWithRule, webId, true)
        ).toEqual({
          policy: expectedPolicy,
          dataset: expectedDataset,
        });
      });

      it("will use existing rule and not add agent to it if agent already is added", () => {
        const ruleWithAgent = acpFns4.addAgent(readPolicyRule, webId);
        const policyDatasetWithRule = setThing(policyDataset, ruleWithAgent);
        const expectedDataset = setThing(policyDatasetWithRule, ruleWithAgent);
        const expectedPolicy = acpFns4.setAllOfMatcherUrl(
          readPolicy,
          ruleWithAgent
        );
        expect(
          setAgents(readPolicy, policyDatasetWithRule, webId, true)
        ).toEqual({
          policy: expectedPolicy,
          dataset: expectedDataset,
        });
      });
    });

    describe("removing agent", () => {
      it("adds rule to policy and dataset if trying to remove agent when there are no rules yet", () => {
        const expectedPolicy = acpFns4.setAllOfMatcherUrl(
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
        const ruleWithAgent = acpFns4.addAgent(readPolicyRule, webId);
        const policyWithRule = acpFns4.setAllOfMatcherUrl(
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
        const rules = acpFns4.getMatcherAll(dataset);
        expect(rules).toHaveLength(1);
        const agents = acpFns4.getAgentAll(rules[0]);
        expect(agents).toHaveLength(0);
      });
    });
  });
});

describe("getNamedPolicyModesAndAgents", () => {
  describe("legacy ACP systems", () => {
    const webId1 = "http://example.com/agent1";
    const webId2 = "http://example.com/agent2";
    const editorsPolicyRule = chain(
      acpFns3.createRule(mockEditorsPolicyRuleUrl(true)),
      (r) => acpFns4.addAgent(r, webId1),
      (r) => acpFns4.addAgent(r, webId2)
    );
    const policy = chain(
      acpFns4.createPolicy(mockEditorsPolicyUrl(true)),
      (p) => acpFns3.setAllowModes(p, createAcpMap(true, true)),
      (p) => acpFns3.setAllOfRuleUrl(p, editorsPolicyRule)
    );
    const policyDataset = chain(
      mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
      (d) => setThing(d, editorsPolicyRule),
      (d) => setThing(d, policy)
    );
    it("returns empty modes and agents if there is no policy", () => {
      jest.spyOn(scFns.acp_v4, "getPolicy").mockReturnValueOnce(null);
      expect(
        getNamedPolicyModesAndAgents(
          mockEditorsPolicyUrl(true),
          policyDataset,
          true
        )
      ).toEqual({ agents: [], modes: {} });
    });
    it("maps agents from policies together with the access modes they're granted", () => {
      jest.spyOn(scFns.acp_v4, "getPolicy").mockReturnValueOnce(policy);
      expect(
        getNamedPolicyModesAndAgents(
          mockEditorsPolicyUrl(true),
          policyDataset,
          true
        )
      ).toEqual({
        agents: [webId1, webId2],
        modes: createAcpMap(true, true),
        policyUrl: mockEditorsPolicyUrl(true),
      });
    });
    it("includes public and authenticated agents azdazed", () => {
      const editorsPolicyRuleWithPublicAndAuthenticated = chain(
        acpFns3.createRule(mockEditorsPolicyRuleUrl(true)),
        (r) => acpFns3.setAuthenticated(r),
        (r) => acpFns3.setPublic(r)
      );
      const policyWithPublicAndAuthenticated = chain(
        acpFns4.createPolicy(mockEditorsPolicyUrl(true)),
        (p) => acpFns3.setAllowModes(p, createAcpMap(true, true)),
        (p) =>
          acpFns3.setAllOfRuleUrl(
            p,
            editorsPolicyRuleWithPublicAndAuthenticated
          )
      );
      const policyDatasetWithPublicAndAuthenticated = chain(
        mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
        (d) => setThing(d, editorsPolicyRuleWithPublicAndAuthenticated),
        (d) => setThing(d, policyWithPublicAndAuthenticated)
      );
      jest
        .spyOn(scFns.acp_v4, "getPolicy")
        .mockReturnValueOnce(policyWithPublicAndAuthenticated);
      expect(
        getNamedPolicyModesAndAgents(
          mockEditorsPolicyUrl(true),
          policyDatasetWithPublicAndAuthenticated,
          true
        )
      ).toEqual({
        agents: [PUBLIC_AGENT_PREDICATE, AUTHENTICATED_AGENT_PREDICATE],
        modes: createAcpMap(true, true),
        policyUrl: mockEditorsPolicyUrl(true),
      });
    });
  });

  describe("latest ACP systems", () => {
    const webId1 = "http://example.com/agent1";
    const webId2 = "http://example.com/agent2";
    const editorsPolicyRule = chain(
      acpFns4.createMatcher(mockEditorsPolicyRuleUrl(false)),
      (r) => acpFns4.addAgent(r, webId1),
      (r) => acpFns4.addAgent(r, webId2)
    );
    const policy = chain(
      acpFns4.createPolicy(mockEditorsPolicyUrl(false)),
      (p) => acpFns4.setAllowModes(p, createAcpMap(true, true)),
      (p) => acpFns4.setAllOfMatcherUrl(p, editorsPolicyRule)
    );
    const policyDataset = chain(
      mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
      (d) => setThing(d, editorsPolicyRule),
      (d) => setThing(d, policy)
    );
    it("returns empty modes and agents if there is no policy", () => {
      jest.spyOn(scFns.acp_v4, "getPolicy").mockReturnValueOnce(null);
      expect(
        getNamedPolicyModesAndAgents(mockEditorsPolicyUrl(false), policyDataset)
      ).toEqual({ agents: [], modes: {} });
    });
    it("maps agents from policies together with the access modes they're granted", () => {
      jest.spyOn(scFns.acp_v4, "getPolicy").mockReturnValueOnce(policy);
      expect(
        getNamedPolicyModesAndAgents(mockEditorsPolicyUrl(false), policyDataset)
      ).toEqual({
        agents: [webId1, webId2],
        modes: createAcpMap(true, true),
        policyUrl: mockEditorsPolicyUrl(false),
      });
    });
    it("includes public and authenticated agents", () => {
      const editorsPolicyRuleWithPublicAndAuthenticated = chain(
        acpFns4.createMatcher(mockEditorsPolicyRuleUrl(false)),
        (r) => acpFns4.setAuthenticated(r),
        (r) => acpFns4.setPublic(r)
      );
      const policyWithPublicAndAuthenticated = chain(
        acpFns4.createPolicy(mockEditorsPolicyUrl(false)),
        (p) => acpFns4.setAllowModes(p, createAcpMap(true, true)),
        (p) =>
          acpFns4.setAllOfMatcherUrl(
            p,
            editorsPolicyRuleWithPublicAndAuthenticated
          )
      );
      const policyDatasetWithPublicAndAuthenticated = chain(
        mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
        (d) => setThing(d, editorsPolicyRuleWithPublicAndAuthenticated),
        (d) => setThing(d, policyWithPublicAndAuthenticated)
      );
      jest
        .spyOn(scFns.acp_v4, "getPolicy")
        .mockReturnValueOnce(policyWithPublicAndAuthenticated);
      expect(
        getNamedPolicyModesAndAgents(
          mockEditorsPolicyUrl(false),
          policyDatasetWithPublicAndAuthenticated
        )
      ).toEqual({
        agents: [PUBLIC_AGENT_PREDICATE, AUTHENTICATED_AGENT_PREDICATE],
        modes: createAcpMap(true, true),
        policyUrl: mockEditorsPolicyUrl(false),
      });
    });
  });
});

describe("getPolicyModesAndAgents", () => {
  describe("legacy ACP systems", () => {
    it("maps agents from policies together with the access modes they're granted", () => {
      const webId1 = "http://example.com/agent1";
      const webId2 = "http://example.com/agent2";
      const readPolicyRule = chain(
        acpFns3.createRule(mockReadPolicyRuleUrl(true)),
        (r) => acpFns4.addAgent(r, webId1),
        (r) => acpFns4.addAgent(r, webId2)
      );
      const readPolicy = chain(
        acpFns4.createPolicy(mockReadApplyPolicyUrl(true)),
        (p) => acpFns3.setAllowModes(p, createAcpMap(true)),
        (p) => acpFns3.setAllOfRuleUrl(p, readPolicyRule)
      );
      const writePolicyRule = chain(
        acpFns3.createRule(mockWritePolicyRuleUrl(true)),
        (r) => acpFns4.addAgent(r, webId2)
      );
      const writePolicy = chain(
        acpFns4.createPolicy(mockWriteApplyPolicyUrl(true)),
        (p) => acpFns3.setAllowModes(p, createAcpMap(false, true)),
        (p) => acpFns3.setAllOfRuleUrl(p, writePolicyRule)
      );
      const policyDataset = chain(
        mockSolidDatasetFrom(mockPolicyResourceUrl(true)),
        (d) => setThing(d, readPolicyRule),
        (d) => setThing(d, readPolicy),
        (d) => setThing(d, writePolicyRule),
        (d) => setThing(d, writePolicy)
      );
      jest
        .spyOn(scFns.acp_v4, "getPolicy")
        .mockReturnValueOnce(readPolicy)
        .mockReturnValueOnce(writePolicy);
      expect(
        getPolicyModesAndAgents(
          [mockReadApplyPolicyUrl(true), mockWriteApplyPolicyUrl(true)],
          policyDataset,
          true
        )
      ).toEqual([
        { agents: [webId1, webId2], modes: createAcpMap(true) },
        { agents: [webId2], modes: createAcpMap(false, true) },
      ]);
    });
  });

  describe("latest ACP systems", () => {
    it("maps agents from policies together with the access modes they're granted", () => {
      const webId1 = "http://example.com/agent1";
      const webId2 = "http://example.com/agent2";
      const readPolicyMatcher = chain(
        acpFns4.createMatcher(mockReadPolicyRuleUrl(false)),
        (r) => acpFns4.addAgent(r, webId1),
        (r) => acpFns4.addAgent(r, webId2)
      );
      const readPolicy = chain(
        acpFns4.createPolicy(mockReadApplyPolicyUrl(false)),
        (p) => acpFns4.setAllowModes(p, createAcpMap(true)),
        (p) => acpFns4.setAllOfMatcherUrl(p, readPolicyMatcher)
      );
      const writePolicyRule = chain(
        acpFns4.createMatcher(mockWritePolicyRuleUrl(false)),
        (r) => acpFns4.addAgent(r, webId2)
      );
      const writePolicy = chain(
        acpFns4.createPolicy(mockWriteApplyPolicyUrl(false)),
        (p) => acpFns4.setAllowModes(p, createAcpMap(false, true)),
        (p) => acpFns4.setAllOfMatcherUrl(p, writePolicyRule)
      );
      const policyDataset = chain(
        mockSolidDatasetFrom(mockPolicyResourceUrl(false)),
        (d) => setThing(d, readPolicyMatcher),
        (d) => setThing(d, readPolicy),
        (d) => setThing(d, writePolicyRule),
        (d) => setThing(d, writePolicy)
      );
      jest
        .spyOn(scFns.acp_v4, "getPolicy")
        .mockReturnValueOnce(readPolicy)
        .mockReturnValueOnce(writePolicy);
      expect(
        getPolicyModesAndAgents(
          [mockReadApplyPolicyUrl(false), mockWriteApplyPolicyUrl(false)],
          policyDataset
        )
      ).toEqual([
        { agents: [webId1, webId2], modes: createAcpMap(true) },
        { agents: [webId2], modes: createAcpMap(false, true) },
      ]);
    });
  });
});

describe("removePermissionsForAgent", () => {
  describe("legacy ACP systems", () => {
    it("removes all permissions for a given agent", () => {
      const agent1 = aliceWebIdUrl;
      const agent2 = bobWebIdUrl;
      const rule1WithAgents = chain(
        acpFns3.createRule(mockReadPolicyRuleUrl(true)),
        (r) => acpFns4.setAgent(r, agent1),
        (r) => acpFns4.setAgent(r, agent2)
      );
      const rule2WithAgents = chain(
        acpFns3.createRule(mockWritePolicyRuleUrl(true)),
        (r) => acpFns4.setAgent(r, agent1)
      );
      const datasetWithRules = chain(
        mockSolidDatasetFrom(resourceUrl),
        (d) => setThing(d, rule1WithAgents),
        (d) => setThing(d, rule2WithAgents)
      );
      const updatedDataset = removePermissionsForAgent(
        agent1,
        datasetWithRules,
        true
      );
      expect(
        acpFns3
          .getRuleAll(updatedDataset)
          .reduce((memo, rule) => memo.concat(acpFns4.getAgentAll(rule)), [])
      ).toEqual([agent2]);
    });
  });

  describe("latest ACP systems", () => {
    it("removes all permissions for a given agent", () => {
      const agent1 = aliceWebIdUrl;
      const agent2 = bobWebIdUrl;
      const rule1WithAgents = chain(
        acpFns4.createMatcher(mockReadPolicyRuleUrl(false)),
        (r) => acpFns4.setAgent(r, agent1),
        (r) => acpFns4.setAgent(r, agent2)
      );
      const rule2WithAgents = chain(
        acpFns4.createMatcher(mockWritePolicyRuleUrl(false)),
        (r) => acpFns4.setAgent(r, agent1)
      );
      const datasetWithRules = chain(
        mockSolidDatasetFrom(resourceUrl),
        (d) => setThing(d, rule1WithAgents),
        (d) => setThing(d, rule2WithAgents)
      );
      const updatedDataset = removePermissionsForAgent(
        agent1,
        datasetWithRules
      );
      expect(
        acpFns4
          .getMatcherAll(updatedDataset)
          .reduce((memo, rule) => memo.concat(acpFns4.getAgentAll(rule)), [])
      ).toEqual([agent2]);
    });
  });
});

describe("getWebIdsFromPermissions", () => {
  it("returns WebID from list of permissions", () => {
    const webId = "http://example.com/card#me";
    expect(getWebIdsFromPermissions([])).toEqual([]);
    expect(getWebIdsFromPermissions([{ webId }])).toEqual([webId]);
    expect(getWebIdsFromPermissions(null)).toEqual([]);
  });
});

describe("getWebIdsFromInheritedPermissions", () => {
  it("returns WebID from list of inherited permissions", () => {
    const webId1 = "http://example.com/card1#me";
    const webId2 = "http://example.com/card2#me";
    expect(getWebIdsFromInheritedPermissions([])).toEqual([]);
    expect(
      getWebIdsFromInheritedPermissions([
        { webId: webId1, inherited: true },
        { webId: webId2 },
      ])
    ).toEqual([webId1]);
    expect(getWebIdsFromInheritedPermissions(null)).toEqual([]);
  });
});

describe("hasAcpConfiguration", () => {
  it("returns false if the request to the target ACR returns no Link headers", async () => {
    const mockedFetch = jest.fn(global.fetch).mockResolvedValueOnce(
      new Response(undefined, {
        headers: {
          "Not-Link": "some value",
        },
      })
    );
    await expect(
      hasAcpConfiguration("https://some.acr", mockedFetch)
    ).resolves.toBe(false);
  });

  it("returns false if the request to the target ACR returns no ACP configuration", async () => {
    const mockedFetch = jest.fn(global.fetch).mockResolvedValueOnce(
      new Response(undefined, {
        headers: {
          Link: '<http://some.link>; rel="someRel"',
        },
      })
    );
    await expect(
      hasAcpConfiguration("https://some.acr", mockedFetch)
    ).resolves.toBe(false);
  });

  it("returns true if the request to the target ACR returns an ACP configuration", async () => {
    const mockedFetch = jest.fn(global.fetch).mockResolvedValueOnce(
      new Response(undefined, {
        headers: {
          Link:
            '<http://www.w3.org/ns/solid/acp#agent>; rel="http://www.w3.org/ns/solid/acp#attribute"',
        },
      })
    );
    await expect(
      hasAcpConfiguration("https://some.acr", mockedFetch)
    ).resolves.toBe(true);
  });
});
