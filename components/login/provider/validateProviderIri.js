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

// This is taken largely from the solid-client-authn-browser code,
// but refined to be more specific:
function joinUrl(baseUrl, appendPath) {
  try {
    const parsedUrl = new URL(baseUrl);
    const path = parsedUrl.pathname;

    parsedUrl.pathname = `${path}${path.endsWith("/") ? "" : "/"}${appendPath}`;

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

export const WELL_KNOWN_OPENID_CONFIG = ".well-known/openid-configuration";

/**
 * Returns the `issuer` URL from the openid configuration from the given `issuer`
 * @returns "invalid_url" | "bad_request" | "unavailable" | "network_error" | URL
 */
export async function validateProviderIri(iri) {
  if (!iri) {
    return { error: "invalid_url" };
  }

  const openIdConfigUrl = joinUrl(iri, WELL_KNOWN_OPENID_CONFIG);
  if (!openIdConfigUrl) {
    return { error: "invalid_url" };
  }

  return fetch(openIdConfigUrl, {
    headers: { accept: "application/json" },
    mode: "cors",
    credentials: "omit",
    redirect: "follow",
    cache: "no-store",
  })
    .then(async (res) => {
      if (res.ok) {
        try {
          const json = await res.json();
          if (json.issuer) {
            return { issuer: json.issuer };
          }

          // This is really invalid_provider, but this'll have the same effect
          return { error: "invalid_url" };
        } catch {
          return { error: "invalid_url" };
        }
      }

      if (res.status >= 500) {
        return { error: "unavailable" };
      }

      return { error: "bad_request" };
    })
    .catch(() => {
      return { error: "network_error" };
    });
}
