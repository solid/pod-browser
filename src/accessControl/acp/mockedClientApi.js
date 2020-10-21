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

/* istanbul ignore file */
// TODO: Remove once Solid Client ACP API is complete
/* eslint-disable no-unused-vars */

export function getAccessControlAll(accessControlResource, options) {
  // Returns list of AccessControl
  throw new Error("Not implemented");
}

export function getAllowModesOnPolicy(policy) {
  // returns AccessModes
  throw new Error("Not implemented");
}

export function getPolicyAll(policyResource) {
  // returns Policy[]
  throw new Error("Not implemented");
}

export function getPolicyUrlAll(accessControl) {
  // returns UrlString[]
  throw new Error("Not implemented");
}

// function getRequiredRuleOnPolicyAll(policy: Policy): UrlString[]
export function getRequiredRuleOnPolicyAll(policy) {
  // returns AccessRule[]
  throw new Error("Not implemented");
}

export async function getSolidDatasetWithAcp(url, options) {
  throw new Error("Not implemented");
}

export async function getResourceInfoWithAcp(url, options) {
  // returns accessControlResource
  throw new Error("Not implemented");
}

export function hasLinkedAcr(resource) {
  // TODO: Switch this out with the corresponding API method exposed from @inrupt/solid-client
  return false;
}

// function setRequiredRuleOnPolicy(policy: AccessPolicy, rules: Rule[]): AccessPolicy
export function setRequiredRuleOnPolicy(policy, rules) {
  throw new Error("Not implemented");
}

// function savePolicyDatasetAt(url: Url | UrlString, dataset: PolicyDataset, options?: Partial<typeof internal_defaultFetchOptions>): ReturnType<typeof saveSolidDatasetAt>
export async function savePolicyDatasetAt(url, dataset, options) {
  throw new Error("Not implemented");
}

/* POLICY METHODS */
// function getPolicy(policyResource: PolicyDataset, url: Url | UrlString): Policy | null;
export function getPolicy(policyResource, url) {
  throw new Error("Not implemented");
}

// function createPolicy(url: UrlString): AccessPolicy
export function createPolicy(url) {
  throw new Error("Not implemented");
}

// function setPolicy(policyResource: PolicyDataset, policy: Policy): PolicyDataset
export function setPolicy(policyResource, policy) {
  throw new Error("Not implemented");
}

// function setAllowModesOnPolicy(policy: AccessPolicy, modes: AccessModes): AccessPolicy
export function setAllowModesOnPolicy(policy, modes) {
  throw new Error("Not implemented");
}

/* ACCESS CONTROL METHODS */
// function addPolicyUrl(accessControl: AccessControl, policyUrl: Url | UrlString | ThingPersisted): AccessControl;
export function addPolicyUrl(accessControl, policyUrl) {
  throw new Error("Not implemented");
}

// function createAccessControl(options?: Parameters<typeof createThing>[0]): AccessControl
export function createAccessControl(options) {
  throw new Error("Not implemented");
}

// function setAccessControl(accessControlResource: AccessControlResource, accessControl: AccessControl): AccessControlResource
export function setAccessControl(accessControlResource, accessControl) {
  throw new Error("Not implemented");
}

// export function addControlPolicyUrl<ResourceExt extends WithAccessibleAcr>(
//   withAccessControlResource: ResourceExt,
//   policyUrl: Url | UrlString | ThingPersisted
// ): ResourceExt
export function addControlPolicyUrl(withAccessControlResource, policyUrl) {
  throw new Error("Not implemented");
}

// function getControlPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(
//   withAccessControlResource: ResourceExt,
// ): UrlString[]
export function getReferencedPolicyUrlAll(withAccessControlResource) {
  throw new Error("Not implemented");
}

// returns the modified datasetWithAcr
export async function saveAccessControlResource(datasetWithAcr, dataset) {
  throw new Error("Not implemented");
}

/* RULE METHODS */
// function createRule(url: Url | UrlString): Rule
export function createRule(url) {
  throw new Error("Not implemented");
}

// function getRule(
//   ruleResource: RuleDataset,
//   url: Url | UrlString
// ): Rule | null
export function getRule(ruleResource, url) {
  throw new Error("Not implemented");
}

// function getAgentForRuleAll(rule: Rule): WebId[]
export function getAgentForRuleAll(rule) {
  throw new Error("Not implemented");
}

// function setAgentInRule(rule: Rule, agents: WebId[]): Rule
export function setAgentInRule(rule, agents) {
  throw new Error("Not implemented");
}
