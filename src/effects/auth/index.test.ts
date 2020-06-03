import Router from "next/router";
import { mock } from "jest-mock-extended";

import ISolidSession from "@inrupt/solid-auth-fetcher/dist/solidSession/ISolidSession";

import { SESSION_STATES, redirectBasedOnSessionState } from "./index";

const redirectLocation = "/redirectLocation";

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
      mock<ISolidSession>(),
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
      mock<ISolidSession>(),
      false,
      SESSION_STATES.LOGGED_IN,
      redirectLocation
    );

    expect(Router.push).toHaveBeenCalledWith(redirectLocation);
  });
});
