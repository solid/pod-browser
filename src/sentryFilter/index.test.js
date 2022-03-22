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

import { filterSentryEvent, redactCodeParameter } from "./index";

describe("redactCodeParameter", () => {
  it("returns the given string if no code parameter is present", () => {
    const string = "hello";
    expect(redactCodeParameter(string)).toEqual(string);
  });

  it("returns a redacted code parameter when given a code parameter", () => {
    const string = "/?code=VSDX2EfjlNyZ1fwEiusfU5ZQcPUsODv82twW0fLVs3U";
    const expected = "/?code=[REDACTED]";
    expect(redactCodeParameter(string)).toEqual(expected);
  });

  it("returns a redacted code parameter with additional elements", () => {
    const string =
      "/authenticate?code=VSDX2EfjlNyZ1fwEiusfU5ZQcPUsODv82twW0fLVs3U&foo=bar";
    const expected = "/authenticate?code=[REDACTED]&foo=bar";
    expect(redactCodeParameter(string)).toEqual(expected);
  });

  it("should not filter parameters that end with `code`", () => {
    const string = "hello_code=test";
    expect(redactCodeParameter(string)).toEqual(string);
  });
});

describe("filterSentryEvent", () => {
  it("does nothing when there is no data to filter", () => {
    const event = {
      culprit:
        "Error: Fetching the metadata of the (Resource at [https://storage.inrupt.com/cat-picture.jpeg] failed: [403] [].)",
      environment: "production",
      exception: {
        values: [
          {
            type: "Error",
            value:
              "Fetching the metadata of the Resource at [https://storage.inrupt.com/cat-picture.jpeg] failed: [403] [].",
            stacktrace: {
              frames: [],
            },
          },
        ],
      },
    };

    expect(filterSentryEvent(event)).toMatchObject(event);
  });

  it("redacts the code parameter in navigation breadcrumbs", () => {
    const event = {
      breadcrumbs: [
        {
          category: "other",
        },
        {
          category: "navigation",
          from: "?code=1a2s3d4f",
          to: "?code=1a2s3d4f",
        },
        {
          category: "navigation",
        },
        {
          timestamp: 1649085964.927,
          type: "http",
          category: "fetch",
          level: "info",
          data: {
            method: "GET",
            status_code: 200,
            url: "https://login.inrupt.com/.well-known/openid-configuration",
          },
        },
      ],
    };

    const sanitizedEvent = {
      breadcrumbs: [
        { category: "other" },
        {
          category: "navigation",
          from: "?code=[REDACTED]",
          to: "?code=[REDACTED]",
        },
        { category: "navigation" },
        {
          timestamp: 1649085964.927,
          type: "http",
          category: "fetch",
          level: "info",
          data: {
            method: "GET",
            status_code: 200,
            url: "https://login.inrupt.com/.well-known/openid-configuration",
          },
        },
      ],
    };

    expect(filterSentryEvent(event)).toMatchObject(sanitizedEvent);
  });
});
