import Router from 'next/router';
import { mock } from 'jest-mock-extended';

import ISolidSession from '../../../lib/solid-auth-fetcher/dist/solidSession/ISolidSession';

import {
  SESSION_STATES,
  redirectBasedOnSessionState,
} from './index';


function mockGetSession(isLoggedIn: boolean) {
  return () => {
    if (!isLoggedIn) {
      return Promise.resolve(null);
    }

    const mockedSession: ISolidSession = mock<ISolidSession>();
    mockedSession.loggedIn = isLoggedIn;
    return Promise.resolve(mockedSession);
  };
}

const redirectLocation = '/redirectLocation';

describe('redirect if logged out', () => {
  test('if there is a session, redirect', async () => {
    await redirectBasedOnSessionState(
      SESSION_STATES.LOGGED_OUT,
      redirectLocation,
      mockGetSession(false),
    );

    expect(Router.push).toHaveBeenCalledWith(redirectLocation);
  });

  test('if there is no session, do not redirect', async () => {
    await redirectBasedOnSessionState(
      SESSION_STATES.LOGGED_OUT,
      redirectLocation,
      mockGetSession(true),
    );

    expect(Router.push).not.toHaveBeenCalled();
  });
});

describe('redirect if logged in', () => {
  test('if there is no session, redirect', async () => {
    await redirectBasedOnSessionState(
      SESSION_STATES.LOGGED_IN,
      redirectLocation,
      mockGetSession(true),
    );

    expect(Router.push).toHaveBeenCalledWith(redirectLocation);
  });

  test('if there is a session, do not redirect', async () => {
    await redirectBasedOnSessionState(
      SESSION_STATES.LOGGED_IN,
      redirectLocation,
      mockGetSession(false),
    );

    expect(Router.push).not.toHaveBeenCalled();
  });
});
