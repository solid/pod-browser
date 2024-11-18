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
  describe("HTTP method handling", () => {
    it("responds with 405 Method Not Allowed if the request method is not GET", async () => {
      const { req, res } = mockRequestResponse("GET", TEST_ORIGIN, undefined);
      await handler(req, res);
      expect(res.statusCode).toBe(405);
    });
  });

  describe("Host header validation", () => {
    const validHosts = [
      ["simple hostname", "example.com"],
      ["hostname with port", "example.com:3000"],
      ["localhost with port", "localhost:3000"],
      ["subdomain", "sub.example.com"],
      ["multiple subdomains", "a.b.c.example.com"],
      ["hostname with hyphens", "my-site.example.com"],
      ["IPv4 address", "127.0.0.1"],
      ["IPv4 with port", "127.0.0.1:3000"],
    ];

    const invalidHosts = [
      ["missing host header", ""],
      ["multiple colons", "a:b:c:3000"],
      ["invalid port", "example.com:70000"],
      ["non-numeric port", "example.com:abc"],
      ["hostname starting with dot", ".example.com"],
      ["hostname ending with dot", "example.com."],
      ["hostname with invalid characters", "example*.com"],
      ["hostname starting with hyphen", "-example.com"],
      ["hostname ending with hyphen", "example-"],
      ["hostname with spaces", "my site.com"],
      ["hostname with underscores", "my_site.com"],
      ["invalid IPv4 format", "256.256.256.256"],
      ["partial IPv4", "127.0.0"],
      ["IPv4 with invalid port", "127.0.0.1:99999"],
      ["double dots", "example..com"],
      ["invalid port zero", "example.com:0"],
      ["negative port", "example.com:-80"],
    ];

    describe("valid hosts", () => {
      test.each(validHosts)("accepts %s: %s", async (_, host) => {
        const { req, res } = mockRequestResponse("GET", host, "application/json");
        await handler(req, res);
        expect(res.statusCode).toBe(200);
        const responseData = res._getJSONData();
        expect(responseData.client_id).toBe(`https://${host}/api/app`);
      });
    });

    describe("invalid hosts", () => {
      test.each(invalidHosts)("rejects %s: %s", async (_, host) => {
        const { req, res } = mockRequestResponse("GET", host, "application/json");
        await handler(req, res);
        expect(res.statusCode).toBe(400);
        const responseData = res._getJSONData();
        expect(responseData.error).toBe("Invalid Host header");
      });
    });
  });

  describe("document contents", () => {
    it("mirrors the Host header in the document contents", async () => {
      const HOST_UNDER_TEST = "podbrowser-different-host.test";
      const { req, res } = mockRequestResponse("GET", HOST_UNDER_TEST, "application/ld+json");

      await handler(req, res);
      expect(res.statusCode).toBe(200);

      const responseData = res._getJSONData();
      expect(responseData.client_id).toBe(`https://${HOST_UNDER_TEST}/api/app`);
      expect(responseData.redirect_uris).toEqual([
        `https://${HOST_UNDER_TEST}/`,
        `https://${HOST_UNDER_TEST}/login`,
      ]);
    });

    it("properly handles hostname with port in URIs", async () => {
      const HOST_WITH_PORT = "localhost:3000";
      const { req, res } = mockRequestResponse("GET", HOST_WITH_PORT, "application/json");

      await handler(req, res);
      expect(res.statusCode).toBe(200);

      const responseData = res._getJSONData();
      expect(responseData.client_id).toBe(`https://${HOST_WITH_PORT}/api/app`);
      expect(responseData.redirect_uris).toEqual([
        `https://${HOST_WITH_PORT}/`,
        `https://${HOST_WITH_PORT}/login`,
      ]);
    });
  });

  describe("content-type negotiation", () => {
    it("responds with 406 if Accept header is not application/json, application/ld+json, or text/html", async () => {
      const { req, res } = mockRequestResponse("GET", TEST_ORIGIN, "image/png");
      await handler(req, res);
      expect(res.statusCode).toBe(406);
    });

    it("responds with 200 and content-type of application/ld+json when no Accept header is present", async () => {
      const { req, res } = mockRequestResponse("GET", TEST_ORIGIN, undefined);
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.getHeaders()).toEqual({
        "content-type": "application/ld+json",
        "x-content-type-options": "nosniff",
      });
      expect(res._getJSONData()).toEqual(PODBROWSER_RESPONSE);
    });

    it("responds with 200 and content-type of application/json when Accept header requests application/json", async () => {
      const { req, res } = mockRequestResponse("GET", TEST_ORIGIN, "application/json");
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.getHeaders()).toEqual({
        "content-type": "application/json",
        "x-content-type-options": "nosniff",
      });
      expect(res._getJSONData()).toEqual(PODBROWSER_RESPONSE);
    });
  });

  describe("URL construction", () => {
    it("properly constructs URLs with encoded characters", async () => {
      const HOST = "example-site.test";
      const { req, res } = mockRequestResponse("GET", HOST, "application/json");
      await handler(req, res);

      const responseData = res._getJSONData();
      expect(responseData.client_id).toBe(`https://${HOST}/api/app`);
      expect(responseData.redirect_uris[0]).toBe(`https://${HOST}/`);
      expect(responseData.redirect_uris[1]).toBe(`https://${HOST}/login`);
    });
  });
});
