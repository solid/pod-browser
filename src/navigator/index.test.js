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
  resourceContextRedirect,
  resourceHref,
  urlForResourceAction,
} from "./index";

describe("resourceHref", () => {
  test("it generates a resource link", () => {
    const link = resourceHref("https://example.com/example.ttl");
    expect(link).toEqual("/resource/https%3A%2F%2Fexample.com%2Fexample.ttl");
  });
});

describe("resourceContextRedirect", () => {
  test("it calls router.replace with a new action for a given container and resource", () => {
    const resourceIri = "https://mypod.myhost.com/resource";
    const containerIri = "https://mypod.myhost.com";
    const action = "myAction";

    const router = {
      replace: jest.fn(),
    };

    // Seriously, in test files, linter?
    /* eslint @typescript-eslint/no-floating-promises: 0 */
    resourceContextRedirect(action, resourceIri, containerIri, router);

    expect(router.replace).toHaveBeenCalledWith(
      urlForResourceAction(action, resourceIri, undefined),
      urlForResourceAction(action, resourceIri, containerIri)
    );
  });
});

describe("urlForResourceAction", () => {
  test("generates a url without a querystring if no action is given", () => {
    const resourceIri = "https://mypod.myhost.com/resource";
    const containerIri = "https://mypod.myhost.com";

    // TODO reorder so that action is last
    expect(urlForResourceAction(undefined, resourceIri, containerIri)).toEqual({
      pathname: resourceHref(containerIri),
    });
  });

  test("generates a url for a resource+container", () => {
    const resourceIri = "https://mypod.myhost.com/resource";
    const containerIri = "https://mypod.myhost.com";
    const action = "myAction";

    expect(urlForResourceAction(action, resourceIri, containerIri)).toEqual({
      pathname: resourceHref(containerIri),
      query: { action, resourceIri },
    });
  });

  test("generates an alias url for a resource", () => {
    const resourceIri = "https://mypod.myhost.com/resource";
    const action = "myAction";

    expect(urlForResourceAction(action, resourceIri, undefined)).toEqual({
      pathname: "/resource/[iri]",
      query: { action, resourceIri },
    });
  });
});
