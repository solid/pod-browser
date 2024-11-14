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

// This is needed for using `_getJSONData`
/* eslint-disable no-underscore-dangle */

import { createMocks } from "node-mocks-http";
import handler from "./app";

const TEST_ORIGIN = "podbrowser.test";
const PODBROWSER_RESPONSE = {
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  client_id: "https://podbrowser.test/api/app",
  client_name: "Inrupt PodBrowser",
  redirect_uris: ["https://podbrowser.test/", "https://podbrowser.test/login"],
  grant_types: ["authorization_code", "refresh_token"],
  scope: "openid offline_access webid",
  response_types: ["code"],
  token_endpoint_auth_method: "none",
  application_type: "web",
  require_auth_time: false,
};

function mockRequestResponse(method, origin, accepts) {
  const { req, res } = createMocks({ method });
  req.headers = {
    host: origin,
  };

  if (accepts) {
    req.headers.accept = accepts;
  }

  return { req, res };
}

describe("/api/app handler tests", () => {
  it("responds with 405 Method Not Allowed if the request method is not GET", async () => {
    const { req, res } = mockRequestResponse("POST", TEST_ORIGIN, undefined);

    await handler(req, res);

    expect(res.statusCode).toBe(405);
  });

  describe("document contents", () => {
    it("mirrors the Host header in the document contents", async () => {
      const HOST_UNDER_TEST = "podbrowser-different-host.test";
      const { req, res } = mockRequestResponse(
        "GET",
        HOST_UNDER_TEST,
        "application/ld+json"
      );

      await handler(req, res);

      // Check the status code:
      expect(res.statusCode).toBe(200);

      // Check payload:
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty(
        "client_id",
        `https://${HOST_UNDER_TEST}/api/app`
      );
      expect(responseData).toHaveProperty("redirect_uris", [
        `https://${HOST_UNDER_TEST}/`,
        `https://${HOST_UNDER_TEST}/login`,
      ]);
    });

    it("accepts localhost:3000", async () => {
      const { req, res } = mockRequestResponse(
        "GET",
        "localhost:3000",
        "application/json"
      );

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const responseData = res._getJSONData();
      expect(responseData.client_id).toBe("https://localhost:3000/api/app");
    });

    it("rejects invalid host with special characters", async () => {
      const { req, res } = mockRequestResponse(
        "GET",
        "invalid*host:3000",
        "application/json"
      );

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const responseData = res._getJSONData();
      expect(responseData.error).toBe("Invalid Host header");
    });
  });

  describe("content-type negotiation", () => {
    it("responds with 406 if the Accept header is set but is not application/json, application/ld+json, or text/html", async () => {
      const { req, res } = mockRequestResponse("GET", TEST_ORIGIN, "image/png");

      // Run the API handler
      await handler(req, res);

      // Check headers and status code:
      expect(res.statusCode).toBe(406);
    });

    it("responds with 200 and content-type of application/ld+json when no Accept header is present", async () => {
      const { req, res } = mockRequestResponse("GET", TEST_ORIGIN, undefined);

      // Run the API handler
      await handler(req, res);

      // Check headers and status code:
      expect(res.statusCode).toBe(200);
      expect(res.getHeaders()).toEqual({
        "content-type": "application/ld+json",
        "x-content-type-options": "nosniff",
      });

      // Check payload:
      const responseData = res._getJSONData();
      expect(responseData).toEqual(PODBROWSER_RESPONSE);
    });

    it("responds with 200 and content-type of application/json when Accept header requests application/json", async () => {
      const { req, res } = mockRequestResponse(
        "GET",
        TEST_ORIGIN,
        "application/json"
      );

      // Run the API handler
      await handler(req, res);

      // Check headers and status code:
      expect(res.statusCode).toBe(200);
      expect(res.getHeaders()).toEqual({
        "content-type": "application/json",
        "x-content-type-options": "nosniff",
      });

      // Check payload:
      const responseData = res._getJSONData();
      expect(responseData).toEqual(PODBROWSER_RESPONSE);
    });

    it("responds with 200 and content-type of application/ld+json when Accept header requests application/ld+json", async () => {
      const { req, res } = mockRequestResponse(
        "GET",
        TEST_ORIGIN,
        "application/ld+json"
      );

      // Run the API handler
      await handler(req, res);

      // Check headers and status code:
      expect(res.statusCode).toBe(200);
      expect(res.getHeaders()).toEqual({
        "content-type": "application/ld+json",
        "x-content-type-options": "nosniff",
      });

      // Check payload:
      const responseData = res._getJSONData();
      expect(responseData).toEqual(PODBROWSER_RESPONSE);
    });

    it("responds with 200 and content-type of application/json when Accept header is text/html", async () => {
      const { req, res } = mockRequestResponse("GET", TEST_ORIGIN, "text/html");

      // Run the API handler
      await handler(req, res);

      // Check headers and status code:
      expect(res.statusCode).toBe(200);
      expect(res.getHeaders()).toEqual({
        "content-type": "application/json",
        "x-content-type-options": "nosniff",
      });

      // Check payload:
      const responseData = res._getJSONData();
      expect(responseData).toEqual(PODBROWSER_RESPONSE);
    });
  });
});
