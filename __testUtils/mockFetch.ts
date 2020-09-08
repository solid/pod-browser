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

import "whatwg-fetch";
import Mock = jest.Mock;

type fetchType = typeof window.fetch;

export default function mockFetch(
  responses: Record<string, Response | Record<string, Response>>
): Mock<fetchType> {
  return jest
    .fn<any, Parameters<fetchType>>()
    .mockImplementation((url, init) => {
      const response = responses[url.toString()];
      const responseObject = response as Record<string, Response>;
      const method = init?.method || "GET";
      if (typeof responseObject[method] !== "undefined") {
        return Promise.resolve(responseObject[method]);
      }
      if (response) {
        return Promise.resolve(response);
      }
      throw new Error(`URL (${url}) not mocked properly`);
    });
}

export function mockSolidClientRequest(
  body: string,
  method = "GET",
  headers: Record<string, string> = {}
): Request {
  return new Request(body, {
    headers: new Headers(headers),
    method,
  });
}

export function mockTurtleResponse(status: number, body = ""): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/turtle",
    },
  });
}
