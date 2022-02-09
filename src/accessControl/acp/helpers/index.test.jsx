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

import { hasAcpConfiguration } from ".";
import "whatwg-fetch"; // must be imported so that Response class is available

describe("hasAcpConfiguration", () => {
  it("returns false if the request to the target ACR returns no Link headers", async () => {
    const mockedFetch = jest.fn(global.fetch).mockResolvedValueOnce(
      new global.Response(undefined, {
        headers: {
          "Not-Link": "some value",
        },
      })
    );
    await expect(
      hasAcpConfiguration("https://some.acr", mockedFetch)
    ).resolves.toBe(false);
  });

  it("returns false if the request to the target ACR returns no ACP configuration", async () => {
    const mockedFetch = jest.fn(global.fetch).mockResolvedValueOnce(
      new Response(undefined, {
        headers: {
          Link: '<http://some.link>; rel="someRel"',
        },
      })
    );
    await expect(
      hasAcpConfiguration("https://some.acr", mockedFetch)
    ).resolves.toBe(false);
  });

  it("returns true if the request to the target ACR returns an ACP configuration", async () => {
    const mockedFetch = jest.fn(global.fetch).mockResolvedValueOnce(
      new Response(undefined, {
        headers: {
          Link: '<http://www.w3.org/ns/solid/acp#agent>; rel="http://www.w3.org/ns/solid/acp#attribute"',
        },
      })
    );
    await expect(
      hasAcpConfiguration("https://some.acr", mockedFetch)
    ).resolves.toBe(true);
  });
});
