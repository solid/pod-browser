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

/* eslint-disable camelcase */
import { foaf, rdf, vcard } from "rdf-namespaces";
import {
  mockSolidDatasetFrom,
  mockThingFrom,
  setThing,
  setUrl,
} from "@inrupt/solid-client";
import * as resourceFns from "../../solidClientHelpers/resource";
import * as profileFns from "../../solidClientHelpers/profile";
import {
  aliceAlternativeWebIdUrl,
  aliceWebIdUrl,
  bobAlternateWebIdUrl,
  mockProfileAlice,
} from "../../../__testUtils/mockPersonResource";
import mockPersonContactThing from "../../../__testUtils/mockPersonContactThing";
import { chain } from "../../solidClientHelpers/utils";
import {
  getProfile,
  getProfileForContact,
  getProfilesForPersonContacts,
} from "./index";

describe("getProfilesForPersonContacts", () => {
  test("it fetches the profiles of the given people contacts", async () => {
    const fetch = jest.fn();
    const person1Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person2Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person1Thing = chain(
      mockThingFrom(person1Iri),
      (t) => setUrl(t, rdf.type, foaf.Person),
      (t) => setUrl(t, vcard.url, aliceAlternativeWebIdUrl)
    );
    const person2Thing = chain(
      mockThingFrom(person2Iri),
      (t) => setUrl(t, rdf.type, foaf.Person),
      (t) => setUrl(t, vcard.url, bobAlternateWebIdUrl)
    );
    const person1 = {
      dataset: chain(mockSolidDatasetFrom(person1Iri), (d) =>
        setThing(d, person1Thing)
      ),
      thing: person1Thing,
    };
    const person2 = {
      dataset: chain(mockSolidDatasetFrom(person2Iri), (d) =>
        setThing(d, person2Thing)
      ),
      thing: person2Thing,
    };

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: {
          dataset: person1.dataset,
          iri: person1Iri,
        },
      })
      .mockResolvedValueOnce({
        response: {
          dataset: person2.dataset,
          iri: person2Iri,
        },
      });

    const person1Profile = {
      webId: aliceAlternativeWebIdUrl,
      dataset: person1.dataset,
      pods: "https://example.com",
      inbox: "https://example.com/inbox",
      avatar: null,
      name: "Alice",
      types: foaf.Person,
    };

    const person2Profile = {
      webId: bobAlternateWebIdUrl,
      dataset: person2.dataset,
      pods: "https://example.com",
      inbox: "https://example.com/inbox",
      avatar: null,
      name: "Bob",
      types: foaf.Person,
    };

    jest
      .spyOn(profileFns, "fetchProfile")
      .mockResolvedValueOnce(person1Profile)
      .mockResolvedValueOnce(person2Profile);

    const [profile1, profile2] = await getProfilesForPersonContacts(
      [person1, person2],
      fetch
    );

    expect(profile1.webId).toEqual(aliceAlternativeWebIdUrl);
    expect(profile2.webId).toEqual(bobAlternateWebIdUrl);
  });

  test("it filters out people for which the resource couldn't be fetched", async () => {
    const fetch = jest.fn();
    const person1Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person2Iri =
      "https://user.example.com/contacts/Person/1234/index.ttl";
    const person1Thing = chain(
      mockThingFrom(person1Iri),
      (t) => setUrl(t, rdf.type, foaf.Person),
      (t) => setUrl(t, vcard.url, aliceAlternativeWebIdUrl)
    );
    const person2Thing = chain(
      mockThingFrom(person2Iri),
      (t) => setUrl(t, rdf.type, foaf.Person),
      (t) => setUrl(t, vcard.url, bobAlternateWebIdUrl)
    );
    const person1 = {
      dataset: chain(mockSolidDatasetFrom(person1Iri), (d) =>
        setThing(d, person1Thing)
      ),
      thing: person1Thing,
    };
    const person2 = {
      dataset: chain(mockSolidDatasetFrom(person2Iri), (d) =>
        setThing(d, person2Thing)
      ),
      thing: person2Thing,
    };

    jest
      .spyOn(resourceFns, "getResource")
      .mockResolvedValueOnce({
        response: {
          dataset: person1.dataset,
          iri: person1Iri,
        },
      })
      .mockResolvedValueOnce({
        response: {
          dataset: person2.dataset,
          iri: person2Iri,
        },
      });

    const person1Profile = {
      webId: aliceAlternativeWebIdUrl,
      dataset: person1.dataset,
      pods: "https://example.com",
      inbox: "https://example.com/inbox",
      avatar: null,
      name: "Alice",
      types: foaf.Person,
    };

    jest
      .spyOn(profileFns, "fetchProfile")
      .mockResolvedValueOnce(person1Profile)
      .mockRejectedValue("error");
    const profiles = await getProfilesForPersonContacts(
      [person1, person2],
      fetch
    );

    expect(profiles).toHaveLength(1);
  });
});

describe("getProfileForContact", () => {
  const personContactDataset = setThing(
    mockSolidDatasetFrom(aliceAlternativeWebIdUrl),
    mockPersonContactThing(aliceAlternativeWebIdUrl)
  );
  beforeEach(() => {
    jest.spyOn(resourceFns, "getResource").mockResolvedValueOnce({
      response: {
        dataset: personContactDataset,
        iri: aliceAlternativeWebIdUrl,
      },
    });
    jest
      .spyOn(profileFns, "fetchProfile")
      .mockResolvedValue(mockProfileAlice());
  });
  const person1Iri = "https://user.example.com/contacts/Person/1234/index.ttl";
  it("returns a profile for a person contact url", async () => {
    expect(await getProfileForContact(person1Iri)).toEqual(mockProfileAlice());
  });
});

describe("getProfile", () => {
  const profileAlice = {
    webId: aliceWebIdUrl,
    avatar: null,
    name: "Alice",
  };
  test("it returns a profile for a given webId", async () => {
    jest.spyOn(profileFns, "fetchProfile").mockResolvedValueOnce(profileAlice);
    expect(await getProfile(aliceWebIdUrl)).toEqual({
      profile: profileAlice,
      profileError: undefined,
    });
  });
  test("it returns a profile error if fetching profile fails", async () => {
    jest.spyOn(profileFns, "fetchProfile").mockRejectedValueOnce("error");
    expect(await getProfile(aliceWebIdUrl)).toEqual({
      profile: undefined,
      profileError: "error",
    });
  });
});
