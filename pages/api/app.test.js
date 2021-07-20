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

import nock from "nock";
import { createRequest, createResponse } from "node-mocks-http";
import handler from "./app";

const LOCALHOST_RESPONSE = {
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  client_id: "http://www.w3.org/ns/solid/terms#PublicOidcClient",
  client_name: "Inrupt PodBrowser",
  grant_types: ["refresh_token", "authorization_code"],
  redirect_uris: ["https://http://localhost:3000/"],
  response_types: ["code"],
};

const PODBROWSER_RESPONSE = {
  "@context": "https://www.w3.org/ns/solid/oidc-context.jsonld",
  client_id: "https://https://podbrowser.inrupt.com/api/app",
  client_name: "Inrupt PodBrowser",
  grant_types: ["refresh_token", "authorization_code"],
  redirect_uris: ["https://https://podbrowser.inrupt.com/"],
  response_types: ["code"],
};

describe("/api/app handler tests", () => {
  let req;
  let res;

  beforeEach(() => {
    req = createRequest();
    res = createResponse();
    // eslint-disable-next-line func-names
    res.status = jest.fn(function () {
      return this;
    });
    res.end = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    nock.restore();
  });

  test("responds with 200 and correct json for localhost", async () => {
    req.headers = { host: "http://localhost:3000" };
    nock(/api/).get(/app$/).reply(200, LOCALHOST_RESPONSE);
    handler(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line no-underscore-dangle
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining(LOCALHOST_RESPONSE)
    );
  });

  test("responds with 200 and correct json for podBrowser", async () => {
    req.headers = { host: "https://podbrowser.inrupt.com" };
    nock(/api/).get(/app$/).reply(200, PODBROWSER_RESPONSE);
    handler(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line no-underscore-dangle
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining(PODBROWSER_RESPONSE)
    );
  });
});
