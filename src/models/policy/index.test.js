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
import {
  getPolicyUrl,
  getPoliciesContainerUrl,
  getResourcePoliciesContainerPath,
  getPolicyResourceUrl,
  isCustomPolicy,
  isNamedPolicy,
  getPolicyType,
} from "./index";

const podUrl = "http://example.com/";

describe("getPolicyUrl", () => {
  const containerUrl = getPoliciesContainerUrl(podUrl);

  it("returns corresponding policy URLs", () => {
    expect(getPolicyUrl(mockSolidDatasetFrom(podUrl), containerUrl)).toEqual(
      "http://example.com/pb_policies/.ttl"
    );
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test`), containerUrl)
    ).toEqual("http://example.com/pb_policies/test.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test.ttl`), containerUrl)
    ).toEqual("http://example.com/pb_policies/test.ttl.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}foo/bar`), containerUrl)
    ).toEqual("http://example.com/pb_policies/foo/bar.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(containerUrl), containerUrl)
    ).toEqual("http://example.com/pb_policies/pb_policies/.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${containerUrl}test`), containerUrl)
    ).toEqual("http://example.com/pb_policies/pb_policies/test.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}public`), containerUrl)
    ).toEqual("http://example.com/pb_policies/public.ttl");
    expect(
      getPolicyUrl(
        mockSolidDatasetFrom(`${podUrl}pb_policies/.ttl`),
        containerUrl
      )
    ).toEqual("http://example.com/pb_policies/pb_policies/.ttl.ttl");
    expect(
      getPolicyUrl(
        mockSolidDatasetFrom(`${podUrl}pb_policies/test/`),
        containerUrl
      )
    ).toEqual("http://example.com/pb_policies/pb_policies/test/.ttl");
  });
});

describe("getResourcePoliciesContainerPath", () => {
  const policiesUrl = getPoliciesContainerUrl(podUrl);

  it("returns corresponding policy resource container for a given resource", () => {
    expect(
      getResourcePoliciesContainerPath(
        mockSolidDatasetFrom(`${podUrl}foo/`),
        policiesUrl
      )
    ).toEqual("http://example.com/pb_policies/foo/");
  });
});

describe("getPoliciesContainerUrl", () => {
  it("returns the policies container url", () => {
    expect(getPoliciesContainerUrl(podUrl)).toEqual(
      "http://example.com/pb_policies/"
    );
  });
});

describe("getPolicyResourceUrl", () => {
  const policiesUrl = getPoliciesContainerUrl(podUrl);

  it("returns the policies container url", () => {
    expect(
      getPolicyResourceUrl(
        mockSolidDatasetFrom(`${podUrl}foo/`),
        policiesUrl,
        "editors"
      )
    ).toEqual("http://example.com/pb_policies/foo/.ttl.editors.ttl");
  });
});

describe("getPolicyType", () => {
  it("returns something for known policy types", () => {
    expect(getPolicyType("editors")).toBeDefined();
    expect(getPolicyType("viewers")).toBeDefined();
    expect(getPolicyType("blocked")).toBeDefined();
    expect(getPolicyType("viewAndAdd")).toBeDefined();
    expect(getPolicyType("editOnly")).toBeDefined();
    expect(getPolicyType("addOnly")).toBeDefined();
    expect(getPolicyType("test")).toBeUndefined();
  });
});

describe("isCustomPolicy", () => {
  it("returns true for custom policies", () => {
    expect(isCustomPolicy("editors")).toBe(false);
    expect(isCustomPolicy("viewers")).toBe(false);
    expect(isCustomPolicy("blocked")).toBe(false);
    expect(isCustomPolicy("viewAndAdd")).toBe(true);
    expect(isCustomPolicy("editOnly")).toBe(true);
    expect(isCustomPolicy("addOnly")).toBe(true);
  });
});

describe("isNamedPolicy", () => {
  it("returns true for named policies", () => {
    expect(isNamedPolicy("editors")).toBe(true);
    expect(isNamedPolicy("viewers")).toBe(true);
    expect(isNamedPolicy("blocked")).toBe(true);
    expect(isNamedPolicy("viewAndAdd")).toBe(false);
    expect(isNamedPolicy("editOnly")).toBe(false);
    expect(isNamedPolicy("addOnly")).toBe(false);
  });
});
