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

import { Session } from "@inrupt/solid-client-authn-browser";
import mockFetch, { mockTurtleResponse } from "../../__testUtils/mockFetch";
import { getOrCreateSettings } from "./settings";

import profileWithPrefsPointer from "./mocks/profileWithPrefsPointer.ttl";
import profileWithoutPrefsPointer from "./mocks/profileWithoutPrefsPointer.ttl";
import prefsWithPodBrowserPrefsPointer from "./mocks/prefsWithPodBrowserPrefsPointer.ttl";
import prefsWithoutPodBrowserPrefsPointer from "./mocks/prefsWithoutPodBrowserPrefsPointer.ttl";
import podBrowserPrefs from "./mocks/podBrowserPrefs.ttl";
import Mock = jest.Mock;

describe("getOrCreateSettings", () => {
  const root = "http://localhost";
  const webId = "http://localhost/webid";
  const prefs = "http://localhost/settings/prefs.ttl";
  const pbPrefs = "http://localhost/settings/podBrowserPrefs.ttl";

  let session: Session;

  describe("pointer to PodBrowserPrefs.ttl is set and file exist", () => {
    beforeEach(async () => {
      session = ({
        fetch: mockFetch({
          [root]: mockTurtleResponse(200),
          [webId]: mockTurtleResponse(200, profileWithPrefsPointer),
          [prefs]: mockTurtleResponse(200, prefsWithPodBrowserPrefsPointer),
          [pbPrefs]: mockTurtleResponse(200, podBrowserPrefs),
        }),
      } as unknown) as Session;
    });

    it("returns Pod Browser Resource", async () =>
      expect(await getOrCreateSettings(webId, session)).toEqual(pbPrefs));
  });

  describe("pointer to PodBrowserPrefs.ttl in prefs.ttl is missing", () => {
    let fetch: Mock<typeof window.fetch>;
    let pbPrefsUrl: string;

    beforeEach(async () => {
      fetch = mockFetch({
        [root]: mockTurtleResponse(200),
        [webId]: mockTurtleResponse(200, profileWithPrefsPointer),
        [prefs]: mockTurtleResponse(200, prefsWithoutPodBrowserPrefsPointer),
        [pbPrefs]: mockTurtleResponse(200, podBrowserPrefs),
      });
      session = ({ fetch } as unknown) as Session;
      pbPrefsUrl = await getOrCreateSettings(webId, session);
    });

    it("creates pointer to PodBrowserPrefs.ttl in prefs.ttl", () =>
      expect(fetch).toHaveBeenCalledWith(prefs, {
        body: `<http://localhost/settings/prefs.ttl> a <http://localhost/settings/sp#ConfigurationFile>;
    <https://inrupt.com/podbrowser#preferencesFile> <http://localhost/settings/podBrowserPrefs.ttl>.
`,
        headers: {
          "Content-Type": "text/turtle",
          "If-None-Match": "*",
          Link: '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
        },
        method: "PUT",
      }));

    it("returns Pod Browser Resource", () =>
      expect(pbPrefsUrl).toEqual(pbPrefs));
  });

  describe("PodBrowserPrefs.ttl is missing", () => {
    let fetch: Mock<typeof window.fetch>;
    let pbPrefsUrl: string;

    beforeEach(async () => {
      fetch = mockFetch({
        [root]: mockTurtleResponse(200),
        [webId]: mockTurtleResponse(200, profileWithPrefsPointer),
        [prefs]: mockTurtleResponse(200, prefsWithPodBrowserPrefsPointer),
        [pbPrefs]: {
          HEAD: mockTurtleResponse(404),
          PUT: mockTurtleResponse(201),
        },
      });
      session = ({ fetch } as unknown) as Session;
      pbPrefsUrl = await getOrCreateSettings(webId, session);
    });

    it("creates PodBrowserPrefs.ttl", () =>
      expect(fetch).toHaveBeenCalledWith(pbPrefsUrl, {
        body: `<http://localhost/settings/podBrowserPrefs.ttl> <http://purl.org/dc/terms/title> "Pod Browser Preferences File";
    a <http://www.w3.org/ns/pim/space#ConfigurationFile>.
`,
        headers: {
          "Content-Type": "text/turtle",
          "If-None-Match": "*",
          Link: '<http://www.w3.org/ns/ldp#Resource>; rel="type"',
        },
        method: "PUT",
      }));

    it("returns Pod Browser Resource", () =>
      expect(pbPrefsUrl).toEqual(pbPrefs));
  });

  describe("Missing pointer to User Preferences resource", () => {
    beforeEach(async () => {
      const fetch = mockFetch({
        [root]: mockTurtleResponse(200),
        [webId]: mockTurtleResponse(200, profileWithoutPrefsPointer),
      });
      session = ({ fetch } as unknown) as Session;
    });

    it("casts error", async () => {
      await expect(() => getOrCreateSettings(webId, session)).rejects.toThrow();
    });
  });

  describe("PodBrowserPrefs.ttl returns any error beside 404", () => {
    beforeEach(async () => {
      const fetch = mockFetch({
        [root]: mockTurtleResponse(200),
        [webId]: mockTurtleResponse(200, profileWithPrefsPointer),
        [prefs]: mockTurtleResponse(200, prefsWithPodBrowserPrefsPointer),
        [pbPrefs]: {
          HEAD: mockTurtleResponse(403),
        },
      });
      session = ({ fetch } as unknown) as Session;
    });

    it("casts error", async () => {
      await expect(() => getOrCreateSettings(webId, session)).rejects.toThrow();
    });
  });
});
