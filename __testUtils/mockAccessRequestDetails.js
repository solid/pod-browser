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

export function getAccessRequestDetailsOnePurpose() {
  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
      "https://consent.pod.inrupt.com/credentials/v1",
    ],
    id: "https://consent.pod.inrupt.com/vc/53973727-f4d0-9e8dbdc041fd",
    type: ["VerifiableCredential", "SolidCredential", "SolidConsentRequest"],
    issuer: "https://consent.pod.inrupt.com",
    issuanceDate: "2021-05-26T16:40:03Z",
    expirationDate: "2022-06-23T16:40:03Z",
    credentialSubject: {
      id: "https://mockappurl.com",
      inbox: "https://mockappurl.com/inbox/",
      hasConsent: [
        {
          mode: ["Read", "Write"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data/"],
          forPurpose: "https://example.com/SomeSpecificPurpose",
        },
        {
          mode: ["Read"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data/"],
          forPurpose: "https://example.com/SomeSpecificPurpose",
        },
        {
          mode: ["Append"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data/"],
          forPurpose: "https://example.com/SomeSpecificPurpose",
        },
        {
          mode: ["Control"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data/"],
          forPurpose: "https://example.com/SomeSpecificPurpose",
        },
      ],
    },
    proof: {
      created: "2021-05-26T16:40:03.009Z",
      proofPurpose: "assertionMethod",
      proofValue: "eqp8h_kL1DwJCpn65z-d1Arnysx6b11...jb8j0MxUCc1uDQ",
      type: "Ed25519Signature2020",
      verificationMethod: "https://consent.pod.inrupt.com/key/396f686b4ec",
    },
  };
}

function getAccessRequestDetails() {
  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
      "https://consent.pod.inrupt.com/credentials/v1",
    ],
    id: "https://consent.pod.inrupt.com/vc/53973727-f4d0-9e8dbdc041fd",
    type: ["VerifiableCredential", "SolidCredential", "SolidConsentRequest"],
    issuer: "https://consent.pod.inrupt.com",
    issuanceDate: "2021-05-26T16:40:03Z",
    expirationDate: "2022-06-23T16:40:03Z",
    credentialSubject: {
      id: "https://mockappurl.com",
      inbox: "https://mockappurl.com/inbox/",
      hasConsent: [
        {
          mode: ["Read", "Write"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data/"],
          forPurpose: [
            "https://example.com/SomeSpecificPurpose",
            "https://example.com/SomeSpecificPurposeA",
            "https://example.com/SomeSpecificPurposeB",
          ],
        },
        {
          mode: ["Read"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data"],
          forPurpose: "https://example.com/SomeSpecificPurpose",
        },
        {
          mode: ["Append"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data"],
          forPurpose: "https://example.com/SomeSpecificPurpose",
        },
        {
          mode: ["Control"],
          hasStatus: "ConsentStatusRequested",
          forPersonalData: ["https://pod.inrupt.com/alice/private/data"],
          forPurpose: "https://example.com/SomeSpecificPurpose",
        },
      ],
    },
    proof: {
      created: "2021-05-26T16:40:03.009Z",
      proofPurpose: "assertionMethod",
      proofValue: "eqp8h_kL1DwJCpn65z-d1Arnysx6b11...jb8j0MxUCc1uDQ",
      type: "Ed25519Signature2020",
      verificationMethod: "https://consent.pod.inrupt.com/key/396f686b4ec",
    },
  };
}

export default getAccessRequestDetails;
