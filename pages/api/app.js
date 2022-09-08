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

import { CLIENT_NAME } from "../../constants/app";

function buildAppProfile(hostname, clientId) {
  return {
    "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
    client_id: clientId,
    client_name: CLIENT_NAME,
    // URLs the user will be redirected back to upon successful authentication:
    redirect_uris: [hostname, hostname.concat("login")],
    // Support refresh_tokens for refreshing the session:
    grant_types: ["authorization_code", "refresh_token"],
    // The scope must be explicit, as the default doesn't include offline_access,
    // preventing the refresh token from being issued.
    scope: "openid offline_access webid",
  };
}

export default function handler(req, res) {
  const clientId = `https://${req.headers.host}/api/app`;
  const hostname = `https://${req.headers.host}/`;
  res.status(200).json(buildAppProfile(hostname, clientId));
}
