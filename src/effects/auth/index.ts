import { useEffect } from 'react';
import Router from 'next/router';

import { getSession } from '../../../lib/solid-auth-fetcher/dist';


// TODO figure out typescript enums
export const SESSION_STATES = {
  LOGGED_IN: 'LOGGED_IN',
  LOGGED_OUT: 'LOGGED_OUT',
};

export async function redirectBasedOnSessionState(
  redirectIfSessionState: string,
  location: string,
  getSAFSession: Function,
) {
  const session = await getSAFSession();

  if (!session && redirectIfSessionState === SESSION_STATES.LOGGED_OUT) {
    Router.push(location);
  }

  if (session && redirectIfSessionState === SESSION_STATES.LOGGED_IN) {
    Router.push(location);
  }
}

export function useRedirectIfLoggedOut(
  location = '/login',
  getSAFSession = getSession,
) {
  return useEffect(() => {
    redirectBasedOnSessionState(SESSION_STATES.LOGGED_OUT, location, getSAFSession);
  }, [location, getSAFSession]);
}

export function useRedirectIfLoggedIn(
  location = '/',
  getSAFSession = getSession,
) {
  return useEffect(() => {
    redirectBasedOnSessionState(SESSION_STATES.LOGGED_IN, location, getSAFSession);
  }, [location, getSAFSession]);
}
