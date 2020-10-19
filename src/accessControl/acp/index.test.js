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

import { mockSolidDatasetFrom } from "@inrupt/solid-client";
import * as mockedAcpFns from "./mockedClientApi";
import AcpAccessControlStrategy, {
  addAcpModes,
  convertAcpToAcl,
  createAcpMap,
  getOrCreatePermission,
  getPoliciesContainerUrl,
  getPolicyUrl,
} from "./index";
import { createAccessMap } from "../../solidClientHelpers/permissions";
import { joinPath } from "../../stringHelpers";

describe("AcpAccessControlStrategy", () => {
  const resourceInfo = "resourceInfo";
  const policies = "policies";
  const fetch = "fetch";
  const acr = "acr";

  let acp;

  describe("init", () => {
    beforeEach(async () => {
      jest.spyOn(mockedAcpFns, "getResourceInfoWithAcp").mockResolvedValue(acr);
      acp = await AcpAccessControlStrategy.init(resourceInfo, policies, fetch);
    });

    it("uses getResourceInfoWithAcp to fetch data", () =>
      expect(
        mockedAcpFns.getResourceInfoWithAcp
      ).toHaveBeenCalledWith(resourceInfo, { fetch }));

    it("exposes the methods we expect for a access control strategy", () =>
      ["getPermissions", "savePermissionsForAgent"].forEach((method) =>
        expect(acp[method]).toBeDefined()
      ));
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

describe("getPolicyUrl", () => {
  const podUrl = "http://example.com/";
  const policiesUrl = getPoliciesContainerUrl(podUrl);
  const policies = mockSolidDatasetFrom(policiesUrl);

  it("returns corresponding policy URLs", () => {
    expect(getPolicyUrl(mockSolidDatasetFrom(podUrl), policies)).toEqual(
      "http://example.com/policies/.ttl"
    );
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test`), policies)
    ).toEqual("http://example.com/policies/test.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test.ttl`), policies)
    ).toEqual("http://example.com/policies/test.ttl.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}foo/bar`), policies)
    ).toEqual("http://example.com/policies/foo/bar.ttl");
    expect(getPolicyUrl(mockSolidDatasetFrom(policiesUrl), policies)).toEqual(
      "http://example.com/policies/policies/.ttl"
    );
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${policiesUrl}test`), policies)
    ).toEqual("http://example.com/policies/policies/test.ttl");
  });
});
