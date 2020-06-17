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

import { parseUrl } from "./index";

describe("parseUrl", () => {
  test("it parses a given url into parts", () => {
    const {
      hash,
      host,
      hostname,
      origin,
      pathname,
      port,
      protocol,
      search,
    } = parseUrl("https://example.com:1000/path?query=param#hash");

    expect(hash).toEqual("#hash");
    expect(host).toEqual("example.com:1000");
    expect(hostname).toEqual("example.com");
    expect(origin).toEqual("https://example.com:1000");
    expect(pathname).toEqual("/path");
    expect(port).toEqual("1000");
    expect(protocol).toEqual("https:");
    expect(search).toEqual("?query=param");
  });

  test("it gracefully handles non-urls", () => {
    const {
      hash,
      host,
      hostname,
      origin,
      pathname,
      port,
      protocol,
      search,
    } = parseUrl("not a url");

    expect(hash).toEqual("");
    expect(host).toEqual("localhost");
    expect(hostname).toEqual("localhost");
    expect(origin).toEqual("http://localhost");
    expect(pathname).toEqual("/not%20a%20url");
    expect(port).toEqual("");
    expect(protocol).toEqual("http:");
    expect(search).toEqual("");
  });
});
