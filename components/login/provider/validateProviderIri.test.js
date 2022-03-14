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

import { validateProviderIri } from "./validateProviderIri";

let mockedFetch;
let mockedFetchJson;

const VALID_ISSUER = "http://openid.provider.com/";

describe("validateProviderIri", () => {
  beforeEach(() => {
    mockedFetchJson = jest.fn().mockResolvedValue({ issuer: VALID_ISSUER });
    mockedFetch = jest.fn();
    mockedFetch.mockResolvedValue({
      ok: true,
      json: mockedFetchJson,
    });

    Object.defineProperty(window, "fetch", {
      value: mockedFetch,
      writable: true,
    });
  });

  it("should return invalid_url error if no URL is passed in", async () => {
    const result = await validateProviderIri("");

    expect(result.error).toBe("invalid_url");
  });

  it("should return invalid_url if an invalid URL is passed in", async () => {
    const result = await validateProviderIri("invalid.url");

    expect(result.error).toBe("invalid_url");
  });

  it("should fetch the openid configuration if a valid URL is passed in", async () => {
    const result = await validateProviderIri("http://openid.provider.com/");

    expect(mockedFetch).toHaveBeenCalledWith(
      "http://openid.provider.com/.well-known/openid-configuration",
      expect.anything()
    );

    expect(mockedFetch.mock.calls[0][1].headers).toMatchObject({
      accept: "application/json",
    });

    expect(result.error).not.toBeDefined();
    expect(result.issuer).toBe(VALID_ISSUER);
  });

  it("should handle fetch errors", async () => {
    mockedFetch.mockRejectedValue("network error");

    const result = await validateProviderIri("http://openid.provider.com/");

    expect(result.error).toBe("network_error");
    expect(result.issuer).not.toBeDefined();
  });

  it("should handle json errors", async () => {
    mockedFetchJson.mockRejectedValue("bad json");

    const result = await validateProviderIri("http://openid.provider.com/");

    expect(result.error).toBe("invalid_url");
    expect(result.issuer).not.toBeDefined();
  });

  it("should handle json not containing the issuer key", async () => {
    mockedFetchJson.mockResolvedValue({ no_issuer: true });

    const result = await validateProviderIri("http://openid.provider.com/");

    expect(result.error).toBe("invalid_url");
    expect(result.issuer).not.toBeDefined();
  });

  it("should handle 4xx errors", async () => {
    mockedFetch.mockResolvedValue({ ok: false, status: 400 });

    const result = await validateProviderIri("http://openid.provider.com/");

    expect(result.error).toBe("bad_request");
    expect(result.issuer).not.toBeDefined();
  });

  it("should handle 5xx errors", async () => {
    mockedFetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await validateProviderIri("http://openid.provider.com/");

    expect(result.error).toBe("unavailable");
    expect(result.issuer).not.toBeDefined();
  });

  it("should return the issuer from the openid configuration, not the provider passed in", async () => {
    const expectedIssuer = "http://openid.provider.com/";
    mockedFetchJson.mockResolvedValue({ issuer: expectedIssuer });

    const result = await validateProviderIri("http://openid.provider.com");

    expect(mockedFetch).toHaveBeenCalledWith(
      "http://openid.provider.com/.well-known/openid-configuration",
      expect.anything()
    );

    expect(result.error).not.toBeDefined();
    expect(result.issuer).toBe(expectedIssuer);
  });

  it("should support providers located not at the root of the host", async () => {
    const result = await validateProviderIri(
      "http://openid.provider.com/some/path"
    );

    expect(mockedFetch).toHaveBeenCalledWith(
      "http://openid.provider.com/some/path/.well-known/openid-configuration",
      expect.anything()
    );

    expect(result.error).not.toBeDefined();
  });
});
