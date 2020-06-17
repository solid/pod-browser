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

import Router from "next/router";
import { mock } from "jest-mock-extended";

import { SESSION_STATES, redirectBasedOnSessionState } from "./index";

jest.mock("next/router");

const redirectLocation = "/redirectLocation";

describe("auth effects", () => {
  (Router.push as jest.Mock).mockResolvedValue(null);

  describe("do nothing if session is still loading", () => {
    test("if the session is loading, don't attempt to redirect", async () => {
      await redirectBasedOnSessionState(
        undefined,
        true,
        SESSION_STATES.LOGGED_OUT,
        redirectLocation
      );

      expect(Router.push).not.toHaveBeenCalled();
    });
  });

  describe("redirect if logged out", () => {
    test("if there is not a session, redirect", async () => {
      await redirectBasedOnSessionState(
        undefined,
        false,
        SESSION_STATES.LOGGED_OUT,
        redirectLocation
      );

      expect(Router.push).toHaveBeenCalledWith(redirectLocation);
    });

    test("if there is a session, do not redirect", async () => {
      await redirectBasedOnSessionState(
        mock(),
        false,
        SESSION_STATES.LOGGED_OUT,
        redirectLocation
      );

      expect(Router.push).not.toHaveBeenCalled();
    });
  });

  describe("redirect if logged in", () => {
    test("if there is a session, redirect", async () => {
      await redirectBasedOnSessionState(
        undefined,
        false,
        SESSION_STATES.LOGGED_IN,
        redirectLocation
      );

      expect(Router.push).not.toHaveBeenCalled();
    });

    test("if there is not a session, do not redirect", async () => {
      await redirectBasedOnSessionState(
        mock(),
        false,
        SESSION_STATES.LOGGED_IN,
        redirectLocation
      );

      expect(Router.push).toHaveBeenCalledWith(redirectLocation);
    });
  });
});
