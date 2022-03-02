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
  addMockResourceAclTo,
  mockSolidDatasetFrom,
} from "@inrupt/solid-client";
import AcpAccessControlStrategy from "./acp";
import WacAccessControlStrategy from "./wac";
import {
  getAccessControl,
  hasAccess,
  isAcp,
  isWac,
  noAccessPolicyError,
} from "./index";

const acp = solidClientFns.acp_v1;
const acp3 = solidClientFns.acp_v3;

jest.mock("./acp");
jest.mock("./wac");

const resourceIri = "http://example.com";
const resource = mockSolidDatasetFrom("http://example.com");

describe("isAcp", () => {
  beforeEach(() => {
    jest.spyOn(acp3, "isAcpControlled").mockReturnValue(true);
  });

  it("uses acp3.isAcpControlled to determine whether a resource from a server uses ACP", () => {
    const fetch = jest.fn();
    expect(isAcp(resourceIri, fetch)).toBeTruthy();
    expect(acp3.isAcpControlled).toHaveBeenCalledWith(resourceIri, { fetch });
  });
});
describe("isWac", () => {
  beforeEach(() => {
    jest.spyOn(acp, "hasLinkedAcr").mockReturnValue(false);
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(true);
  });
  const fetch = jest.fn();
  it("uses acp.hasLinkedAcr and hasAccessibleAcl to determine whether a resource from a server uses WAC", () => {
    expect(isWac(resourceIri, fetch)).toBeTruthy();
    expect(acp.hasLinkedAcr).toHaveBeenCalledWith(resourceIri, fetch);
  });
});

describe("getAccessControl", () => {
  let result;
  const policiesContainerUrl = "policiesContainer";
  const fetch = "fetch";
  const acpStrategy = "acpStrategy";
  const wacStrategy = "wacStrategy";

  beforeEach(() => {
    jest.spyOn(acp3, "isAcpControlled").mockReturnValue(true);
    jest.spyOn(solidClientFns, "hasAccessibleAcl").mockReturnValue(false);
    jest.spyOn(acp, "hasLinkedAcr").mockReturnValue(false);
    jest.spyOn(WacAccessControlStrategy, "init").mockReturnValue(wacStrategy);
    jest.spyOn(AcpAccessControlStrategy, "init").mockReturnValue(acpStrategy);
  });

  afterEach(() => jest.restoreAllMocks());

  it("throws error if no ACL is found", async () => {
    jest.spyOn(acp3, "isAcpControlled").mockReturnValue(false);
    await expect(
      getAccessControl(resource, policiesContainerUrl, fetch)
    ).rejects.toEqual(new Error(noAccessPolicyError));
  });

  describe("ACP is supported", () => {
    beforeEach(async () => {
      acp.hasLinkedAcr.mockReturnValue(true);
      jest.spyOn(acp3, "isAcpControlled").mockReturnValue(true);

      result = await getAccessControl(
        resource,
        policiesContainerUrl,
        fetch,
        false,
        true,
        false
      );
    });

    it("calls AcpAccessControlStrategy.init, defaulting to the latest ACP systems", () =>
      expect(AcpAccessControlStrategy.init).toHaveBeenCalledWith(
        resource,
        policiesContainerUrl,
        fetch,
        false
      ));

    it("returns the result from WacAccessControlStrategy.init", () =>
      expect(result).toBe(acpStrategy));
  });

  describe("WAC is supported", () => {
    beforeEach(async () => {
      jest.spyOn(acp3, "isAcpControlled").mockReturnValue(false);
      solidClientFns.hasAccessibleAcl.mockReturnValue(true);
      result = await getAccessControl(
        resource,
        policiesContainerUrl,
        fetch,
        false,
        false,
        true
      );
    });

    it("calls WacAccessControlStrategy.init", () =>
      expect(WacAccessControlStrategy.init).toHaveBeenCalledWith(
        resource,
        fetch
      ));

    it("returns the result from WacAccessControlStrategy.init", () =>
      expect(result).toBe(wacStrategy));
  });
});

describe("hasAccess", () => {
  it("checks whether resource is accessible either through ACP or WAC", () => {
    const resourceWithWac = addMockResourceAclTo(resource);
    const resourceWithAcp = acp.addMockAcrTo(resource);
    jest
      .spyOn(acp, "hasLinkedAcr")
      .mockImplementation((r) => r === resourceWithAcp);

    expect(hasAccess(resource)).toBeFalsy();
    expect(hasAccess(resourceWithWac)).toBeTruthy();
    expect(hasAccess(resourceWithAcp)).toBeTruthy();
  });
});
