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

import LinkHeader from "http-link-header";

/**
 * Discover whether an authorization server advertizes its configuration as descibed
 * in https://solid.github.io/authorization-panel/acp-specification/#capabilities-discovery.
 * This is used to determine whether an authorization server conforms to the legacy
 * ACP specification, or if it implements the latest version. The retrieved configuration
 * itself is irrelevant in this case, what is important is its presence or absence.
 *
 * TODO: Part of this should be moved to `@inrupt/solid-client`. When doing so,
 * make sure to remove the dependency on `http-link-header`, which will no longer
 * be necessary.
 *
 * @param {*} acrUrl The URL of the Access Control Resource
 */

// eslint-disable-next-line import/prefer-default-export
export async function hasAcpConfiguration(acrUrl, authFetch) {
  // Defaults to the latest system.
  if (typeof acrUrl !== "string") {
    return false;
  }
  const response = await authFetch(acrUrl, {
    // The specification requires that this should be an OPTIONS request, but
    // this causes issues for cross-origin requests from a browser. ESS currently
    // allows to work around this issuing a HEAD request instead.
    method: "HEAD",
  });
  const linkHeader = response.headers.get("Link");
  if (linkHeader === null) {
    return false;
  }
  const parsedLinks = LinkHeader.parse(linkHeader);
  return (
    parsedLinks.get("rel", "http://www.w3.org/ns/solid/acp#grant").length > 0 ||
    parsedLinks.get("rel", "http://www.w3.org/ns/solid/acp#attribute").length >
      0
  );
}
