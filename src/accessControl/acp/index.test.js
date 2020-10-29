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
  mockSolidDatasetFrom,
  acp_lowlevel_preview as acpFns,
  setThing,
} from "@inrupt/solid-client";
import AcpAccessControlStrategy, {
  addAcpModes,
  convertAcpToAcl,
  createAcpMap,
  getOrCreatePermission,
  getOrCreatePolicy,
  getPoliciesContainerUrl,
  getPolicyModesAndAgents,
  getPolicyUrl,
  getRulesOrCreate,
  getRuleWithAgent,
  setAgents,
} from "./index";
import { createAccessMap } from "../../solidClientHelpers/permissions";
import { chain } from "../../solidClientHelpers/utils";

const policyResourceUrl = "http://example.com/policies/.ttl";
const readPolicyUrl = `${policyResourceUrl}#readAccessPolicy`;
const readPolicyRuleUrl = `${readPolicyUrl}Rule`;
const writePolicyUrl = `${policyResourceUrl}#writeAccessPolicy`;
const writePolicyRuleUrl = `${writePolicyUrl}Rule`;

describe("AcpAccessControlStrategy", () => {
  const resourceInfoUrl = "http://example.com/resourceInfo";
  const resourceInfo = mockSolidDatasetFrom(resourceInfoUrl);
  const policiesContainerUrl = "http://example.com/pb_policies";
  const policiesContainer = mockSolidDatasetFrom(policiesContainerUrl);
  const fetch = "fetch";
  const datasetWithAcrUrl = "http://example.com/resourceInfo=acr";
  const datasetWithAcr = mockSolidDatasetFrom(datasetWithAcrUrl);

  let acp;

  describe("init", () => {
    beforeEach(async () => {
      jest
        .spyOn(acpFns, "getResourceInfoWithAcr")
        .mockResolvedValue(datasetWithAcr);
      acp = await AcpAccessControlStrategy.init(
        resourceInfo,
        policiesContainer,
        fetch
      );
    });

    it("uses getResourceInfoWithAcr to fetch data", () =>
      expect(
        acpFns.getResourceInfoWithAcr
      ).toHaveBeenCalledWith(resourceInfoUrl, { fetch }));

    it("exposes the methods we expect for a access control strategy", () =>
      [
        "deleteFile",
        "getPermissions",
        "savePermissionsForAgent",
      ].forEach((method) => expect(acp[method]).toBeDefined()));
  });

  describe("getPermissions", () => {});
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
  const policyThing = acpFns.createPolicy(readPolicyUrl);

  it("returns existing policy", () => {
    const modifiedDataset = chain(policyDataset, (d) =>
      setThing(d, policyThing)
    );
    const { policy, dataset } = getOrCreatePolicy(
      modifiedDataset,
      readPolicyUrl
    );
    expect(policy).toEqual(policyThing);
    expect(dataset).toEqual(modifiedDataset);
  });

  it("creates new policy if none exist", () => {
    const { policy, dataset } = getOrCreatePolicy(policyDataset, readPolicyUrl);
    expect(policy).toEqual(policyThing);
    expect(dataset).toEqual(setThing(policyDataset, policyThing));
  });
});

describe("getPolicyUrl", () => {
  const podUrl = "http://example.com/";
  const policiesUrl = getPoliciesContainerUrl(podUrl);
  const policies = mockSolidDatasetFrom(policiesUrl);

  it("returns corresponding policy URLs", () => {
    expect(getPolicyUrl(mockSolidDatasetFrom(podUrl), policies)).toEqual(
      "http://example.com/pb_policies/.ttl"
    );
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test`), policies)
    ).toEqual("http://example.com/pb_policies/test.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test.ttl`), policies)
    ).toEqual("http://example.com/pb_policies/test.ttl.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}foo/bar`), policies)
    ).toEqual("http://example.com/pb_policies/foo/bar.ttl");
    expect(getPolicyUrl(mockSolidDatasetFrom(policiesUrl), policies)).toEqual(
      "http://example.com/pb_policies/pb_policies/.ttl"
    );
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${policiesUrl}test`), policies)
    ).toEqual("http://example.com/pb_policies/pb_policies/test.ttl");
  });
});

describe("getRulesOrCreate", () => {
  const readPolicy = chain(acpFns.createPolicy(readPolicyUrl), (p) =>
    acpFns.setAllowModesOnPolicy(p, createAcpMap(true))
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
    const ruleWithAgent = acpFns.addAgentForRule(rule, webId);
    expect(getRuleWithAgent([rule, ruleWithAgent], webId)).toBe(ruleWithAgent);
  });

  it("returns first rule if no rule is connected to the agent", () => {
    expect(getRuleWithAgent([rule], webId)).toBe(rule);
  });
});

describe("setAgents", () => {
  const readPolicy = chain(acpFns.createPolicy(readPolicyUrl), (p) =>
    acpFns.setAllowModesOnPolicy(p, createAcpMap(true))
  );
  const readPolicyRule = acpFns.createRule(readPolicyRuleUrl);
  const policyDataset = chain(mockSolidDatasetFrom(policyResourceUrl), (d) =>
    acpFns.setPolicy(d, readPolicy)
  );
  const webId = "http://example.com/profile/card#me";

  describe("adding agent", () => {
    it("will add new rule and add agent to it", () => {
      const expectedRule = acpFns.addAgentForRule(readPolicyRule, webId);
      const expectedDataset = setThing(policyDataset, expectedRule);
      const expectedPolicy = acpFns.addRequiredRuleForPolicy(
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
      const expectedRule = acpFns.addAgentForRule(readPolicyRule, webId);
      const expectedDataset = setThing(policyDatasetWithRule, expectedRule);
      const expectedPolicy = acpFns.setRequiredRuleForPolicy(
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
      const ruleWithAgent = acpFns.addAgentForRule(readPolicyRule, webId);
      const policyDatasetWithRule = setThing(policyDataset, ruleWithAgent);
      const expectedDataset = setThing(policyDatasetWithRule, ruleWithAgent);
      const expectedPolicy = acpFns.setRequiredRuleForPolicy(
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
      const expectedPolicy = acpFns.addRequiredRuleForPolicy(
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
      const ruleWithAgent = acpFns.addAgentForRule(readPolicyRule, webId);
      const policyDatasetWithRule = setThing(policyDataset, ruleWithAgent);
      const expectedDataset = setThing(policyDatasetWithRule, readPolicyRule);
      const expectedPolicy = acpFns.setRequiredRuleForPolicy(
        readPolicy,
        readPolicyRule
      );
      expect(
        setAgents(readPolicy, policyDatasetWithRule, webId, false)
      ).toEqual({
        policy: expectedPolicy,
        dataset: expectedDataset,
      });
    });
  });
});

describe("getPolicyModesAndAgents", () => {
  it("maps agents from policies together with the access modes they're granted", () => {
    const webId1 = "http://example.com/agent1";
    const webId2 = "http://example.com/agent2";
    const readPolicyRule = chain(
      acpFns.createRule(readPolicyRuleUrl),
      (r) => acpFns.addAgentForRule(r, webId1),
      (r) => acpFns.addAgentForRule(r, webId2)
    );
    const readPolicy = chain(
      acpFns.createPolicy(readPolicyUrl),
      (p) => acpFns.setAllowModesOnPolicy(p, createAcpMap(true)),
      (p) => acpFns.setRequiredRuleForPolicy(p, readPolicyRule)
    );
    const writePolicyRule = chain(acpFns.createRule(writePolicyRuleUrl), (r) =>
      acpFns.addAgentForRule(r, webId2)
    );
    const writePolicy = chain(
      acpFns.createPolicy(writePolicyUrl),
      (p) => acpFns.setAllowModesOnPolicy(p, createAcpMap(false, true)),
      (p) => acpFns.setRequiredRuleForPolicy(p, writePolicyRule)
    );
    const policyDataset = chain(
      mockSolidDatasetFrom(policyResourceUrl),
      (d) => setThing(d, readPolicyRule),
      (d) => setThing(d, readPolicy),
      (d) => setThing(d, writePolicyRule),
      (d) => setThing(d, writePolicy)
    );
    expect(
      getPolicyModesAndAgents([readPolicyUrl, writePolicyUrl], policyDataset)
    ).toEqual([
      { agents: [webId1, webId2], modes: createAcpMap(true) },
      { agents: [webId2], modes: createAcpMap(false, true) },
    ]);
  });
});
