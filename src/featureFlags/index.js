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

import {
  getWellKnownSolid,
  getThingAll,
  getIri,
  getSolidDataset,
  getThing,
} from "@inrupt/solid-client";

const webIdsWithAccessToFeatures = [
  "https://pod.inrupt.com/jacklawson/profile/card#me",
  "https://pod.inrupt.com/arneh/profile/card#me",
  "https://pod.inrupt.com/megoth/profile/card#me",
  "https://megoth-demo1.inrupt.net/profile/card#me",
  "https://megoth-demo2.inrupt.net/profile/card#me",
  "https://megoth-demo3.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/kyra/profile/card#me",
  "https://pod.inrupt.com/virginiabalseiro/profile/card#me",
  "https://pod.inrupt.com/fraubalseiro/profile/card#me",
  "https://virginiabalseiro.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/gandalfcat/profile/card#me",
  "https://pod.inrupt.com/efe/profile/card#me",
  "https://podbrowser.inrupt.net/profile/card#me",
  "https://podbrowser2.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/podbrowser/profile/card#me",
  "https://pod.inrupt.com/podbrowser2/profile/card#me",
  "https://id.inrupt.com/podbrowser",
  "https://id.inrupt.com/podbrowser2",
  "https://id.play.inrupt.com/podbrowser",
  "https://id.play.inrupt.com/podbrowser2",
  "https://che.inrupt.net/profile/card#me",
  "https://fidel.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/che/profile/card#me",
  "https://pod.inrupt.com/fidel/profile/card#me",
  "https://id.inrupt.com/che",
  "https://id.inrupt.com/fidel",
  "https://pod.inrupt.com/docsteam/profile/card#me",
  "https://testsharepat.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/acoburn/profile/card#me",
  "https://pod.inrupt.com/vctestalice1/profile/card#me",
  "https://pod.inrupt.com/zwifi/profile/card#me",
];
function enableForGivenWebIds(webIds) {
  return (session) =>
    session.info.isLoggedIn && webIds.includes(session.info.webId);
}

function enableForGivenServerCapability(webIds, capability) {
  async function checkServerCapability(session, fetch) {
    let capabilityEnabled = null;
    /* istanbul ignore next */
    try {
      if (typeof window !== "undefined") {
        // TODO: Discovering the storage from the profile should be an SDK function.
        const profile = await getSolidDataset(session.info.webId);
        const profileData = getThing(profile, session.info.webId);
        const storageIri = getIri(
          profileData,
          "http://www.w3.org/ns/pim/space#storage"
        );
        const welKnownData = await getWellKnownSolid(storageIri, {
          fetch,
        });
        const wellKnownSubjects = getThingAll(welKnownData, {
          acceptBlankNodes: true,
        });
        const wellKnownSubject = wellKnownSubjects[0];
        capabilityEnabled = getIri(wellKnownSubject, capability);
      }
      return (
        (session.info.isLoggedIn && webIds.includes(session.info.webId)) ||
        !!capabilityEnabled
      );
    } catch (error) {
      // returning the webId list check to allow showing of these features
      return session.info.isLoggedIn && webIds.includes(session.info.webId);
    }
  }

  return (session, fetch) => checkServerCapability(session, fetch);
}

export const GROUPS_PAGE_ENABLED_FOR = webIdsWithAccessToFeatures;
export const PRIVACY_PAGE_ENABLED_FOR = webIdsWithAccessToFeatures;
export const GROUPS_PAGE_ENABLED = "groupsPageEnabled";
export const PRIVACY_PAGE_ENABLED = "privacyPageEnabled";
export const PRIVACY_PAGE_ENABLED_SERVER = "privacyPageEnabledServer";
export const GRAPHQL_ENABLED = "http://inrupt.com/ns/ess#graphqlEndpoint";
export const groupsPageEnabled = enableForGivenWebIds(GROUPS_PAGE_ENABLED_FOR);
export const privacyPageEnabled = enableForGivenWebIds(
  PRIVACY_PAGE_ENABLED_FOR
);
export const privacyPageEnabledServer = enableForGivenServerCapability(
  PRIVACY_PAGE_ENABLED_FOR,
  GRAPHQL_ENABLED
);
export const consentPageEnabled = enableForGivenWebIds(
  PRIVACY_PAGE_ENABLED_FOR
);

export default function FeatureFlags() {
  return {
    [GROUPS_PAGE_ENABLED]: groupsPageEnabled,
    [PRIVACY_PAGE_ENABLED]: privacyPageEnabled,
    [PRIVACY_PAGE_ENABLED_SERVER]: privacyPageEnabledServer,
  };
}
