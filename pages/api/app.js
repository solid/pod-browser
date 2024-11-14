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
import accepts from "accepts";
import { CLIENT_NAME } from "../../constants/app";

// Validate host header according to RFC 9110
function validateHost(host) {
  if (!host) {
    throw new Error("Host header is required");
  }

  const [hostname, port] = host.split(":");

  // Basic hostname validation
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!hostnameRegex.test(hostname)) {
    throw new Error("Invalid hostname format");
  }

  // Port validation if present
  if (port !== undefined) {
    const portNum = parseInt(port, 10);
    if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error("Invalid port number");
    }
  }

  return host;
}

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
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "web",
    require_auth_time: false,
  };
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // Validate the host
    const validHost = validateHost(req.headers.host);
    const clientId = `https://${validHost}/api/app`;
    const hostname = `https://${validHost}/`;

    const acceptedType = accepts(req).type([
      "application/ld+json",
      "application/json",
      // handle loading the Client Identifier document directly in the browser
      "text/html",
    ]);

    if (acceptedType === false) {
      return res.status(406).send("Not Acceptable");
    }

    // If the request is for text/html, serve it as application/json:
    const contentType =
      acceptedType === "text/html" ? "application/json" : acceptedType;

    res.status(200);
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(JSON.stringify(buildAppProfile(hostname, clientId)));

    return res;
  } catch (error) {
    return res.status(400).json({
      error: "Invalid Host header",
      message: error.message,
    });
  }
}
