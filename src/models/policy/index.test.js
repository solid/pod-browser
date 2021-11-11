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

  describe("legacy ACP systems", () => {
    it("returns corresponding policy URLs", () => {
      expect(
        getPolicyUrl(mockSolidDatasetFrom(podUrl), containerUrl, true)
      ).toEqual("http://example.com/pb_policies/.ttl");
      expect(
        getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test`), containerUrl, true)
      ).toEqual("http://example.com/pb_policies/test.ttl");
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}test.ttl`),
          containerUrl,
          true
        )
      ).toEqual("http://example.com/pb_policies/test.ttl.ttl");
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}foo/bar`),
          containerUrl,
          true
        )
      ).toEqual("http://example.com/pb_policies/foo/bar.ttl");
      expect(
        getPolicyUrl(mockSolidDatasetFrom(containerUrl), containerUrl, true)
      ).toEqual("http://example.com/pb_policies/pb_policies/.ttl");
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${containerUrl}test`),
          containerUrl,
          true
        )
      ).toEqual("http://example.com/pb_policies/pb_policies/test.ttl");
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}public`),
          containerUrl,
          true
        )
      ).toEqual("http://example.com/pb_policies/public.ttl");
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}pb_policies/.ttl`),
          containerUrl,
          true
        )
      ).toEqual("http://example.com/pb_policies/pb_policies/.ttl.ttl");
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}pb_policies/test/`),
          containerUrl,
          true
        )
      ).toEqual("http://example.com/pb_policies/pb_policies/test/.ttl");
    });
  });

  describe("latest ACP systems", () => {
    it("returns corresponding policy URLs", () => {
      expect(
        getPolicyUrl(mockSolidDatasetFrom(podUrl), containerUrl, false)
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tLw%3D%3D"
      );
      expect(
        getPolicyUrl(mockSolidDatasetFrom(`${podUrl}test`), containerUrl, false)
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL3Rlc3Q%3D"
      );
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}test.ttl`),
          containerUrl,
          false
        )
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL3Rlc3QudHRs"
      );
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}foo/bar`),
          containerUrl,
          false
        )
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL2Zvby9iYXI%3D"
      );
      expect(
        getPolicyUrl(mockSolidDatasetFrom(containerUrl), containerUrl, false)
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL3BiX3BvbGljaWVzLw%3D%3D"
      );
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${containerUrl}test`),
          containerUrl,
          false
        )
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL3BiX3BvbGljaWVzL3Rlc3Q%3D"
      );
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}public`),
          containerUrl,
          false
        )
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL3B1YmxpYw%3D%3D"
      );
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}pb_policies/.ttl`),
          containerUrl,
          false
        )
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL3BiX3BvbGljaWVzLy50dGw%3D"
      );
      expect(
        getPolicyUrl(
          mockSolidDatasetFrom(`${podUrl}pb_policies/test/`),
          containerUrl,
          false
        )
      ).toEqual(
        "http://example.com/pb_policies/#aHR0cDovL2V4YW1wbGUuY29tL3BiX3BvbGljaWVzL3Rlc3Qv"
      );
    });
  });
});

describe("getResourcePoliciesContainerPath", () => {
  const policiesUrl = getPoliciesContainerUrl(podUrl);

  describe("legacy ACP systems", () => {
    it("returns corresponding policy resource container for a given resource", () => {
      expect(
        getResourcePoliciesContainerPath(
          mockSolidDatasetFrom(`${podUrl}foo/`),
          policiesUrl,
          true
        )
      ).toEqual("http://example.com/pb_policies/foo/");
    });
  });

  describe("latest ACP systems", () => {
    it("returns corresponding policy resource container for a given resource", () => {
      expect(
        getResourcePoliciesContainerPath(
          mockSolidDatasetFrom(`${podUrl}foo/`),
          policiesUrl,
          false
        )
      ).toEqual("http://example.com/pb_policies/");
    });
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

  describe("legacy ACP systems", () => {
    it("returns the policies container url", () => {
      expect(
        getPolicyResourceUrl(
          mockSolidDatasetFrom(`${podUrl}foo/`),
          policiesUrl,
          "editors",
          true
        )
      ).toEqual("http://example.com/pb_policies/foo/.ttl.editors.ttl");
    });
  });

  describe("latest ACP systems", () => {
    it("returns the policies container url", () => {
      expect(
        getPolicyResourceUrl(
          mockSolidDatasetFrom(`${podUrl}foo/`),
          policiesUrl,
          "editors",
          false
        )
      ).toEqual("http://example.com/pb_policies/");
    });
  });
});

// TODO: add blocked to named policies list once we have deny policies

describe("getPolicyType", () => {
  it("returns something for known policy types", () => {
    expect(getPolicyType("editors")).toBeDefined();
    expect(getPolicyType("viewers")).toBeDefined();
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
    expect(isCustomPolicy("viewAndAdd")).toBe(true);
    expect(isCustomPolicy("editOnly")).toBe(true);
    expect(isCustomPolicy("addOnly")).toBe(true);
  });
});

describe("isNamedPolicy", () => {
  it("returns true for named policies", () => {
    expect(isNamedPolicy("editors")).toBe(true);
    expect(isNamedPolicy("viewers")).toBe(true);
    expect(isNamedPolicy("viewAndAdd")).toBe(false);
    expect(isNamedPolicy("editOnly")).toBe(false);
    expect(isNamedPolicy("addOnly")).toBe(false);
  });
});
