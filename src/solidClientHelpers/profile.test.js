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

import * as solidClientFns from "@inrupt/solid-client";
import { solid, schema, foaf, rdf, space, vcard } from "rdf-namespaces";
import {
  displayProfileName,
  fetchProfile,
  getPodConnectedToProfile,
  getProfileFromPersonThing,
  getProfileFromThing,
  getProfileFromThingError,
  locationIsConnectedToProfile,
  TYPE_MAP,
} from "./profile";
import {
  mockPersonThingAlice,
  mockPersonThingBob,
  mockProfileAlice,
  mockProfileBob,
  mockWebIdNode,
} from "../../__testUtils/mockPersonResource";
import createDataset from "../../__testUtils/createDataset";
import mockSession, { webIdUrl } from "../../__testUtils/mockSession";
import { chain } from "./utils";

const {
  setThing,
  createSolidDataset,
  addUrl,
  mockThingFrom,
  addStringNoLocale,
} = solidClientFns;

describe("displayProfileName", () => {
  test("with name, displays the name", () => {
    const name = "name";
    const nickname = "nickname";
    const webId = "webId";
    expect(displayProfileName({ name, nickname, webId })).toEqual(name);
  });

  test("without name, and a nickname, displays the nickname", () => {
    const nickname = "nickname";
    const webId = "webId";
    expect(displayProfileName({ nickname, webId })).toEqual(nickname);
  });

  test("with only webId, displays the webId", () => {
    const webId = "webId";
    expect(displayProfileName({ webId })).toEqual(webId);
  });
});

describe("fetchProfile", () => {
  it("fetches a profile and its information", async () => {
    const idUrl = "https://id.example.com/testuser";
    const vcardOrgName = "http://www.w3.org/2006/vcard/ns#organization-name";
    const storageUrl = "https://storage.example.com/testuser";
    const oidcUrl = "https://openid.example.com";
    const profileUrl = "https://storage.example.com/testuser/profile";
    const avatarUrl = "https://storage.example.com/testuser/avatar.png";
    const role = "Test Role";
    const nickname = "testuser";
    const name = "Test User";
    const organization = "Test Organization";

    const webIdDataset = setThing(
      createSolidDataset(),
      chain(
        mockThingFrom(idUrl),
        (t) => addUrl(t, rdf.type, foaf.Agent),
        (t) => addUrl(t, space.storage, storageUrl),
        (t) => addUrl(t, solid.oidcIssuer, oidcUrl),
        (t) => addUrl(t, foaf.isPrimaryTopicOf, profileUrl)
      )
    );
    const profileDataset = setThing(
      createSolidDataset(),
      chain(
        mockThingFrom(profileUrl),
        (t) => addUrl(t, rdf.type, foaf.Document),
        (t) => addStringNoLocale(t, vcardOrgName, organization),
        (t) => addStringNoLocale(t, vcard.role, role),
        (t) => addStringNoLocale(t, vcard.nickname, nickname),
        (t) => addUrl(t, foaf.maker, idUrl),
        (t) => addUrl(t, vcard.hasPhoto, avatarUrl),
        (t) => addStringNoLocale(t, foaf.name, name),
        (t) => addUrl(t, foaf.primaryTopic, idUrl)
      )
    );

    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValueOnce(webIdDataset);

    jest.spyOn(solidClientFns, "getProfileAll").mockResolvedValueOnce({
      webIdProfile: webIdDataset,
      altProfileAll: [profileDataset],
    });

    jest.spyOn(solidClientFns, "getSourceUrl").mockReturnValueOnce(profileUrl);

    const profile = await fetchProfile(idUrl, fetch);

    expect(profile.webId).toEqual(profileUrl);
    expect(profile.name).toEqual(name);
    expect(profile.nickname).toEqual(nickname);
    expect(profile.avatar).toEqual(avatarUrl);
    expect(profile.pods).toEqual([storageUrl]);
    expect(profile.dataset).toEqual(profileDataset);
  });
});

describe("getProfileFromPersonThing", () => {
  test("it maps people into profiles", async () => {
    const alice = mockProfileAlice();
    expect(getProfileFromPersonThing(mockPersonThingAlice())).toEqual({
      avatar: alice.avatar,
      name: alice.name,
      nickname: alice.nickname,
      webId: alice.webId,
      types: ["http://xmlns.com/foaf/0.1/Person"],
    });

    const bob = mockProfileBob();
    expect(getProfileFromPersonThing(mockPersonThingBob())).toEqual({
      avatar: bob.avatar,
      name: bob.name,
      nickname: bob.nickname,
      webId: bob.webId,
      types: ["http://xmlns.com/foaf/0.1/Person"],
    });
  });
});

describe("getProfileFromThing", () => {
  const personIri = "http://example.com/#person";
  const person = solidClientFns.mockThingFrom(personIri);

  it("handles foaf:Person", () => {
    jest.spyOn(TYPE_MAP, foaf.Person).mockReturnValue(42);
    const profile = chain(person, (t) =>
      solidClientFns.setUrl(t, rdf.type, foaf.Person)
    );
    expect(getProfileFromThing(profile)).toBe(42);
    expect(TYPE_MAP[foaf.Person]).toHaveBeenCalledWith(profile);
  });

  it("handles schema:Person", () => {
    jest.spyOn(TYPE_MAP, schema.Person).mockReturnValue(1337);
    const profile = chain(person, (t) =>
      solidClientFns.setUrl(t, rdf.type, schema.Person)
    );
    expect(getProfileFromThing(profile)).toBe(1337);
    expect(TYPE_MAP[schema.Person]).toHaveBeenCalledWith(profile);
  });

  it("throws errors for things it cannot handle", () => {
    expect(() => getProfileFromThing(person)).toThrow(
      getProfileFromThingError(person)
    );
  });
});

describe("getPodConnectedToProfile", () => {
  it("returns a profile's Pod to a location, if possible", () => {
    const pod = "http://example.com/";
    const podLocation = "http://example.com/test";
    expect(getPodConnectedToProfile(null, podLocation)).toBeUndefined();
    expect(getPodConnectedToProfile({}, podLocation)).toBeUndefined();
    expect(
      getPodConnectedToProfile(
        { pods: ["http://another.pod.com/", pod] },
        podLocation
      )
    ).toBe(pod);
  });
});

describe("locationIsConnectedToProfile", () => {
  it("returns whether or not a location is connected to a profile's listed Pods", () => {
    const pod = "http://example.com/";
    const podLocation = "http://example.com/test";
    expect(locationIsConnectedToProfile(null, podLocation)).toBeFalsy();
    expect(locationIsConnectedToProfile({}, podLocation)).toBeFalsy();
    expect(
      locationIsConnectedToProfile(
        { pods: ["http://another.pod.com/", pod] },
        podLocation
      )
    ).toBeTruthy();
  });
});
