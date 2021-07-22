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

const webIdsWithAccessToFeatures = [
  "https://pod.inrupt.com/jacklawson/profile/card#me",
  "https://pod.inrupt.com/arneh/profile/card#me",
  "https://pod.inrupt.com/megoth/profile/card#me",
  "https://megoth-demo1.inrupt.net/profile/card#me",
  "https://megoth-demo2.inrupt.net/profile/card#me",
  "https://megoth-demo3.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/kyra/profile/card#me",
  "https://pod.inrupt.com/virginiabalseiro/profile/card#me",
  "https://virginiabalseiro.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/efe/profile/card#me",
  "https://podbrowser.inrupt.net/profile/card#me",
  "https://podbrowser2.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/podbrowser/profile/card#me",
  "https://pod.inrupt.com/podbrowser2/profile/card#me",
  "https://pod-compat.inrupt.com/podbrowser/profile/card#me",
  "https://pod-compat.inrupt.com/podbrowser2/profile/card#me",
  "https://pod.inrupt.com/docsteam/profile/card#me",
  "https://pod.inrupt.com/vincent/profile/card#me",
  "https://testsharepat.inrupt.net/profile/card#me",
  "https://pod.inrupt.com/acoburn/profile/card#me",
  "https://pod.inrupt.com/norbertn/profile/card#me",
];
function enableForGivenWebIds(webIds) {
  return (session) =>
    session.info.isLoggedIn && webIds.includes(session.info.webId);
}

export const GROUPS_PAGE_ENABLED_FOR = webIdsWithAccessToFeatures;
export const PRIVACY_PAGE_ENABLED_FOR = webIdsWithAccessToFeatures;
export const GROUPS_PAGE_ENABLED = "groupsPageEnabled";
export const PRIVACY_PAGE_ENABLED = "privacyPageEnabled";
export const groupsPageEnabled = enableForGivenWebIds(GROUPS_PAGE_ENABLED_FOR);
export const privacyPageEnabled = enableForGivenWebIds(
  PRIVACY_PAGE_ENABLED_FOR
);
export const consentPageEnabled = enableForGivenWebIds(
  PRIVACY_PAGE_ENABLED_FOR
);

export default function FeatureFlags() {
  return {
    [GROUPS_PAGE_ENABLED]: groupsPageEnabled,
    [PRIVACY_PAGE_ENABLED]: privacyPageEnabled,
  };
}
