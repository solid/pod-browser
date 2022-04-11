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

// TODO: replace with solid-client functions
// TODO: replace mock data with real data

/* Model constants */

export const MOCK_PURPOSES_DESCRIPTIONS = {
  "https://example.com/SomeSpecificPurpose": "Some Specific Purpose",
  "https://example.com/SomeSpecificPurposeA": "Another Purpose",
  "https://example.com/SomeSpecificPurposeB": "A Different Purpose",
};

/* Model functions */

export function getPurposeUrls(accessRequest) {
  if (!accessRequest) return null;
  return Array.isArray(accessRequest?.credentialSubject?.hasConsent)
    ? accessRequest?.credentialSubject?.hasConsent[0].forPurpose // getting first item in array for now
    : accessRequest?.credentialSubject?.hasConsent.forPurpose;
}

export function getIssuanceDate(accessRequest) {
  return accessRequest?.issuanceDate;
}

export function getExpiryDate(accessRequest) {
  return accessRequest?.expirationDate;
}

export function getRequestedAccesses(accessRequest) {
  return Array.isArray(accessRequest?.credentialSubject?.hasConsent)
    ? accessRequest?.credentialSubject?.hasConsent
    : [accessRequest?.credentialSubject?.hasConsent];
}

export function getRequestedResourcesIris(sectionDetails) {
  return sectionDetails.forPersonalData;
}

export function getAccessMode(access) {
  return access.mode;
}

export function getRequestorWebId(accessRequest) {
  return accessRequest?.credentialSubject?.id;
}

export function getDataSubjectWebId(accessRequest) {
  return Array.isArray(accessRequest?.credentialSubject?.hasConsent)
    ? accessRequest?.credentialSubject?.hasConsent[0].isConsentForDataSubject
    : accessRequest?.credentialSubject?.hasConsent?.isConsentForDataSubject;
}

export function getVcId(vc) {
  return vc?.id;
}
