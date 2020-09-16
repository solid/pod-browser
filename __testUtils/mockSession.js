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

import profile from "./mocks/profile.ttl";
import storageAclTtl from "./mocks/storageAcl.ttl";
import mockResponse from "./mockResponse";

export const webId = "http://example.com/webId#me";
export const storage = "http://example.com/";
export const storageAcl = "http://example.com/.acl";
export const anotherUsersStorage = "http://anotheruser.com/";
export const anotherUsersStorageAcl = "http://anotheruser.com/.acl";

export { profile };

export default function mockSession(options = {}) {
  // this instance is a normal, authenticated session
  // you can override the properties with what you need, but if you repeat something a lot
  // consider naming it and create a reusable mock function
  return {
    fetch: mockFetch({
      [webId]: () => mockResponse(200, profile),
      [storage]: () =>
        mockResponse(200, "", {
          Link: `<${storageAcl}>; rel="acl"`,
        }),
      [storageAcl]: () => mockResponse(200, storageAclTtl),
    }),
    info: {
      isLoggedIn: true,
      sessionId: "some-session-id",
      webId,
    }, // add more properties as needed
    ...options,
  }; // add more properties as needed
}

// create other functions in this file to reflect other types of sessions we need to test with

export function mockUnauthenticatedSession() {
  return {
    fetch: () => mockFetch(),
    info: {
      isLoggedIn: false,
      sessionId: null,
      webId: null,
    }, // add more properties as needed
  }; // add more properties as needed
}

export function mockAuthenticatedSessionWithNoAccessToPod() {
  return {
    fetch: mockFetch({
      [webId]: () => mockResponse(200, profile),
      [storage]: () =>
        mockResponse(200, "", {
          Link: `<${storageAcl}>; rel="acl"`,
        }),
      [storageAcl]: () => mockResponse(401),
    }),
    info: {
      isLoggedIn: true,
      sessionId: "some-session-id",
      webId,
    },
  };
}

export function mockAuthenticatedSessionWithNoAccessToAnotherUsersPod() {
  return {
    fetch: mockFetch({
      [webId]: () => mockResponse(200, profile),
      [anotherUsersStorage]: () =>
        mockResponse(200, "", {
          Link: `<${anotherUsersStorageAcl}>; rel="acl"`,
        }),
      [anotherUsersStorageAcl]: () => mockResponse(401),
    }),
    info: {
      isLoggedIn: true,
      sessionId: "some-session-id",
      webId,
    },
  };
}
