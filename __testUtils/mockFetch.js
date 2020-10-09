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

export default function mockFetch(responses = {}) {
  return jest.fn().mockImplementation((url, init) => {
    const responseFn = responses[url.toString()];
    const responseObject = responseFn;
    const method = init?.method || "GET";
    let response;
    if (responseFn && typeof responseObject[method] !== "undefined") {
      response = responseObject[method](url, init);
    } else if (responseFn) {
      response = responseFn(url, init);
    } else {
      throw new Error(`URL (${url}) not mocked properly`);
    }
    const urlObj = new URL(url);
    response.url = urlObj.origin + urlObj.pathname; // to mimic that calls for /card#me are actually /card
    return Promise.resolve(response);
  });
}

export function mockSolidClientRequest(body, method = "GET", headers = {}) {
  return new Request(body, {
    headers: new Headers(headers),
    method,
  });
}

export function mockTurtleResponse(status, body = "") {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/turtle",
    },
  });
}
