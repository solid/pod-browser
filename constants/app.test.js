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

import getConfig from "./config";
import { getClientOptions } from "./app";
import { getCurrentHostname } from "../src/windowHelpers";

jest.mock("./config");

jest.mock("../src/windowHelpers", () => ({
  getCurrentHostname: jest.fn().mockReturnValue("localhost"),
  generateRedirectUrl: () => "https://localhost:3000/",
  getCurrentOrigin: () => "https://localhost:3000",
}));

const TEST_CLIENT_ID =
  "https://inrupt.test/clientid.json";

describe("app - getClientOptions", () => {
  beforeEach(() => {
    getConfig.mockReturnValue({
      devClientId: TEST_CLIENT_ID,
    });
  });

  it("should return configuration for login", () => {
    const actual = getClientOptions();
    expect(actual).toMatchSnapshot();
  });

  it("should not use the devClientId in production", () => {
    getCurrentHostname.mockReturnValue("http://example.podbrowser");

    const actual = getClientOptions();
    expect(actual).toMatchSnapshot();
    expect(actual.clientId).toBe("https://localhost:3000/api/app");
    expect(actual.clientId).not.toBe(TEST_CLIENT_ID);
  });
});
