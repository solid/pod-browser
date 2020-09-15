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

import { getSolidDataset } from "@inrupt/solid-client";
import mockFetch from "../../__testUtils/mockFetch";
import { getOrCreateSettings } from "./settings";
import { mockTurtleResponse } from "../../__testUtils/mockResponse";

import profileWithPrefsPointer from "./mocks/profileWithPrefsPointer.ttl";
import profileWithoutPrefsPointer from "./mocks/profileWithoutPrefsPointer.ttl";
import prefsWithPodBrowserPrefsPointer from "./mocks/prefsWithPodBrowserPrefsPointer.ttl";
import prefsWithoutPBPrefsPointer from "./mocks/prefsWithoutPodBrowserPrefsPointer.ttl";
import podBrowserPrefs from "./mocks/podBrowserPrefs.ttl";

describe("getOrCreateSettings", () => {
  const root = "http://localhost";
  const webId = "http://localhost/webid";
  const prefs = "http://localhost/settings/prefs.ttl";
  const pbPrefs = "http://localhost/settings/podBrowserPrefs.ttl";

  let session;
  let mockedPbPrefsResource;

  beforeAll(async () => {
    mockedPbPrefsResource = await getSolidDataset(pbPrefs, {
      fetch: mockFetch({
        [pbPrefs]: () => mockTurtleResponse(200, podBrowserPrefs),
      }),
    });
  });

  describe("pointer to PodBrowserPrefs.ttl is set and file exist", () => {
    beforeEach(async () => {
      session = {
        fetch: mockFetch({
          [root]: () => mockTurtleResponse(200),
          [webId]: () => mockTurtleResponse(200, profileWithPrefsPointer),
          [prefs]: () =>
            mockTurtleResponse(200, prefsWithPodBrowserPrefsPointer),
          [pbPrefs]: () => mockTurtleResponse(200, podBrowserPrefs),
        }),
      };
    });

    it("returns Pod Browser Resource", async () =>
      expect(await getOrCreateSettings(webId, session)).toEqual(
        mockedPbPrefsResource
      ));
  });

  describe("pointer to PodBrowserPrefs.ttl in prefs.ttl is missing", () => {
    let fetch;
    let pbPrefsResource;
    let prefsFetchSpy;

    beforeEach(async () => {
      prefsFetchSpy = jest.fn();
      fetch = mockFetch({
        [root]: () => mockTurtleResponse(200),
        [webId]: () => mockTurtleResponse(200, profileWithPrefsPointer),
        [prefs]: {
          GET: () => mockTurtleResponse(200, prefsWithoutPBPrefsPointer),
          PATCH: (...args) => {
            prefsFetchSpy(...args);
            return mockTurtleResponse(201);
          },
        },
        [pbPrefs]: () => mockTurtleResponse(200, podBrowserPrefs),
      });
      session = { fetch };
      pbPrefsResource = await getOrCreateSettings(webId, session);
    });

    it("creates pointer to PodBrowserPrefs.ttl in prefs.ttl", () => {
      expect(prefsFetchSpy).toHaveBeenCalledWith(prefs, {
        body: ` INSERT DATA {<http://localhost/settings/prefs.ttl> <https://inrupt.com/podbrowser#preferencesFile> <http://localhost/settings/podBrowserPrefs.ttl>.};`,
        headers: {
          "Content-Type": "application/sparql-update",
        },
        method: "PATCH",
      });
    });

    it("returns Pod Browser Resource", () =>
      expect(pbPrefsResource).toEqual(mockedPbPrefsResource));
  });

  describe("PodBrowserPrefs.ttl is missing", () => {
    let fetch;
    let pbPrefsResource;
    let pbPrefsPutSpy;

    beforeEach(async () => {
      let pbPrefsIsCreated = false;
      pbPrefsPutSpy = jest.fn();
      fetch = mockFetch({
        [root]: () => mockTurtleResponse(200),
        [webId]: () => mockTurtleResponse(200, profileWithPrefsPointer),
        [prefs]: () => mockTurtleResponse(200, prefsWithPodBrowserPrefsPointer),
        [pbPrefs]: {
          GET: () => mockTurtleResponse(200, podBrowserPrefs),
          HEAD: () => {
            if (pbPrefsIsCreated) {
              return mockTurtleResponse(200);
            }
            pbPrefsIsCreated = true;
            return mockTurtleResponse(404);
          },
          PUT: (...args) => {
            pbPrefsPutSpy(...args);
            return mockTurtleResponse(201);
          },
        },
      });
      session = { fetch };
      pbPrefsResource = await getOrCreateSettings(webId, session);
    });

    it("creates PodBrowserPrefs.ttl", () =>
      expect(pbPrefsPutSpy).toHaveBeenCalledWith(pbPrefs, {
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

    it("returns Pod Browser Resource", async () =>
      expect(pbPrefsResource).toEqual(mockedPbPrefsResource));
  });

  describe("Missing pointer to User Preferences resource", () => {
    beforeEach(async () => {
      const fetch = mockFetch({
        [root]: () => mockTurtleResponse(200),
        [webId]: () => mockTurtleResponse(200, profileWithoutPrefsPointer),
      });
      session = { fetch };
    });

    it("casts error", async () => {
      await expect(() => getOrCreateSettings(webId, session)).rejects.toThrow();
    });
  });

  describe("PodBrowserPrefs.ttl returns any error beside 404", () => {
    beforeEach(async () => {
      const fetch = mockFetch({
        [root]: () => mockTurtleResponse(200),
        [webId]: () => mockTurtleResponse(200, profileWithPrefsPointer),
        [prefs]: () => mockTurtleResponse(200, prefsWithPodBrowserPrefsPointer),
        [pbPrefs]: {
          HEAD: () => mockTurtleResponse(403),
        },
      });
      session = { fetch };
    });

    it("casts error", async () => {
      await expect(() => getOrCreateSettings(webId, session)).rejects.toThrow();
    });
  });
});
