import { useEffect, useContext } from "react";
import Router from "next/router";

import UserContext from "../../contexts/UserContext";

// TODO figure out typescript enums
export const SESSION_STATES = {
  LOGGED_IN: "LOGGED_IN",
  LOGGED_OUT: "LOGGED_OUT",
};

export function redirectBasedOnSessionState(
  session: any,
  isLoadingSession: boolean,
  redirectIfSessionState: string,
  location: string
): void {
  if (isLoadingSession) {
    return;
  }

  if (session && redirectIfSessionState === SESSION_STATES.LOGGED_IN) {
    Router.push(location).catch((e) => {
      throw e;
    });
  }

  if (!session && redirectIfSessionState === SESSION_STATES.LOGGED_OUT) {
    Router.push(location).catch((e) => {
      throw e;
    });
  }
}

export function useRedirectIfLoggedOut(location = "/login"): void {
  const { session, isLoadingSession } = useContext(UserContext);

  useEffect(() => {
    redirectBasedOnSessionState(
      session,
      isLoadingSession,
      SESSION_STATES.LOGGED_OUT,
      location
    );
  }, [session, isLoadingSession, location]);
}

export function useRedirectIfLoggedIn(location = "/"): void {
  const { session, isLoadingSession } = useContext(UserContext);

  useEffect(() => {
    redirectBasedOnSessionState(
      session,
      isLoadingSession,
      SESSION_STATES.LOGGED_IN,
      location
    );
  }, [session, isLoadingSession, location]);
}
