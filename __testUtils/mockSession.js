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

import mockFetch from "./mockFetch";
import mockResponse from "./mockResponse";

import profileTurtle from "./mocks/profile.ttl";
import storageTurtle from "./mocks/podRoot.ttl";
import storageAclTurtle from "./mocks/storageAcl.ttl";

export const webIdUrl = "http://example.com/webId#me";
export const storageUrl = "http://example.com/";
export const storageAclUrl = "http://example.com/.acl";
export const anotherUsersStorageUrl = "http://anotheruser.com/";
export const anotherUsersStorageAclUrl = "http://anotheruser.com/.acl";

export { profileTurtle };

export default function mockSession(options = {}) {
  // this instance is a normal, authenticated session
  // you can override the properties with what you need, but if you repeat something a lot
  // consider naming it and create a reusable mock function
  return {
    on: jest.fn(),
    handleIncomingRedirect: jest.fn().mockResolvedValue(null),
    fetch: mockFetch({
      [webIdUrl]: () => mockResponse(200, profileTurtle),
      [storageUrl]: () =>
        mockResponse(200, storageTurtle, {
          Link: `<${storageAclUrl}>; rel="acl"`,
        }),
      [storageAclUrl]: () => mockResponse(200, storageAclTurtle),
    }),
    info: {
      isLoggedIn: true,
      sessionId: "some-session-id",
      webId: webIdUrl,
    }, // add more properties as needed
    ...options,
  }; // add more properties as needed
}

// create other functions in this file to reflect other types of sessions we need to test with

export function mockUnauthenticatedSession() {
  return {
    on: jest.fn(),
    handleIncomingRedirect: jest.fn().mockResolvedValue(null),
    fetch: () => mockFetch(),
    info: {
      isLoggedIn: false,
      sessionId: null,
      webId: null,
    },
    login: jest.fn(),
  };
}

export function mockAuthenticatedSessionWithNoAccessToPod() {
  return {
    on: jest.fn(),
    handleIncomingRedirect: jest.fn().mockResolvedValue(null),
    fetch: mockFetch({
      [webIdUrl]: () => mockResponse(200, profileTurtle),
      [storageUrl]: () =>
        mockResponse(200, "", {
          Link: `<${storageAclUrl}>; rel="acl"`,
        }),
      [storageAclUrl]: () => mockResponse(401),
    }),
    info: {
      isLoggedIn: true,
      sessionId: "some-session-id",
      webId: webIdUrl,
    },
  };
}

export function mockAuthenticatedSessionWithNoAccessToAnotherUsersPod() {
  return {
    on: jest.fn(),
    handleIncomingRedirect: jest.fn().mockResolvedValue(null),
    fetch: mockFetch({
      [webIdUrl]: () => mockResponse(200, profileTurtle),
      [anotherUsersStorageUrl]: () =>
        mockResponse(200, "", {
          Link: `<${anotherUsersStorageAclUrl}>; rel="acl"`,
        }),
      [anotherUsersStorageAclUrl]: () => mockResponse(401),
    }),
    info: {
      isLoggedIn: true,
      sessionId: "some-session-id",
      webId: webIdUrl,
    },
  };
}
