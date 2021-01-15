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
import { getPolicyUrl, getPoliciesContainerUrl } from "./policies";

const podUrl = "http://example.com/";

describe("getPolicyUrl", () => {
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
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}public`), policies)
    ).toEqual("http://example.com/pb_policies/public.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}pb_policies/.ttl`), policies)
    ).toEqual("http://example.com/pb_policies/pb_policies/.ttl.ttl");
    expect(
      getPolicyUrl(mockSolidDatasetFrom(`${podUrl}pb_policies/test/`), policies)
    ).toEqual("http://example.com/pb_policies/pb_policies/test/.ttl");
  });
});
