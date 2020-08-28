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
import { space, foaf, vcard } from "rdf-namespaces";
import { displayProfileName, fetchProfile } from "./profile";

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
    const profileWebId = "https://mypod.myhost.com/profile/card#me";
    const profileDataset = {};

    jest
      .spyOn(solidClientFns, "fetchLitDataset")
      .mockResolvedValue(profileDataset);

    jest.spyOn(solidClientFns, "getThing").mockReturnValue(profileDataset);

    jest
      .spyOn(solidClientFns, "getStringNoLocale")
      .mockResolvedValueOnce(undefined);

    jest
      .spyOn(solidClientFns, "getStringNoLocale")
      .mockResolvedValueOnce(undefined);

    jest.spyOn(solidClientFns, "getIri").mockResolvedValueOnce(undefined);

    jest.spyOn(solidClientFns, "getIriAll").mockResolvedValueOnce(undefined);

    const fetch = jest.fn();
    const profile = await fetchProfile(profileWebId, fetch);

    expect(solidClientFns.fetchLitDataset).toHaveBeenCalledWith(profileWebId, {
      fetch,
    });
    expect(solidClientFns.getStringNoLocale).toHaveBeenCalledWith(
      profileDataset,
      foaf.nick
    );
    expect(solidClientFns.getStringNoLocale).toHaveBeenCalledWith(
      profileDataset,
      vcard.fn
    );
    expect(solidClientFns.getIri).toHaveBeenCalledWith(
      profileDataset,
      vcard.hasPhoto
    );
    expect(solidClientFns.getIriAll).toHaveBeenCalledWith(
      profileDataset,
      space.storage
    );
    expect(Object.keys(profile)).toEqual([
      "avatar",
      "dataset",
      "name",
      "nickname",
      "pods",
      "webId",
    ]);
  });
});
