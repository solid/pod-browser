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
import { URL } from "url";
import { CLIENT_NAME } from "../../constants/app";

function validateAndParseHost(host) {
  if (!host) {
    throw new Error("Host header is required");
  }

  try {
    const url = new URL(`https://${host}`);

    if (
      !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(
        url.hostname
      )
    ) {
      throw new Error("Invalid hostname format");
    }

    return {
      hostname: url.hostname,
      port: url.port || null,
    };
  } catch (error) {
    throw new Error(`Invalid host: ${error.message}`);
  }
}

function buildAppProfile(baseUrl) {
  return {
    "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
    client_id: new URL("/api/app", baseUrl).toString(),
    client_name: CLIENT_NAME,
    redirect_uris: [baseUrl, new URL("/login", baseUrl).toString()],
    grant_types: ["authorization_code", "refresh_token"],
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
    const { hostname, port } = validateAndParseHost(req.headers.host);

    const baseUrl = `https://${hostname}${port ? `:${port}` : ""}/`;

    const acceptedType = accepts(req).type([
      "application/ld+json",
      "application/json",
      "text/html",
    ]);

    if (acceptedType === false) {
      return res.status(406).send("Not Acceptable");
    }

    const contentType = acceptedType === "text/html" ? "application/json" : acceptedType;

    res.status(200);
    res.setHeader("Content-Type", contentType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.send(JSON.stringify(buildAppProfile(baseUrl)));

    return res;
  } catch (error) {
    return res.status(400).json({
      error: "Invalid Host header",
      message: error.message,
    });
  }
}
