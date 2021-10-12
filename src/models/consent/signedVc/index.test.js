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

import getSignedVc from "../../../../__testUtils/mockSignedVc";

<<<<<<< HEAD
import { getRequestedAccessesFromSignedVc } from "./index";
=======
import getRequestedAccessesFromSignedVc from "./index";
>>>>>>> add tests

const signedVc = getSignedVc();

describe("getRequestedAccessesFromSignedVc", () => {
  test("it returns requested accesses", () => {
    const accesses = getRequestedAccessesFromSignedVc(signedVc);
    expect(accesses).toEqual({
      mode: ["http://www.w3.org/ns/auth/acl#Read"],
      hasStatus: "https://w3id.org/GConsent#ConsentStatusExplicitlyGiven",
      forPersonalData: [
        "https://example.com/resource1",
        "https://example.com/resource2",
      ],
      forPurpose: [
        "https://example.org/someSpecificPurpose",
        "https://example.org/someSpecificPurpose2",
      ],
<<<<<<< HEAD
      isProvidedTo: "https://mockapp.com/app#id",
=======
      isProvidedTo: "https://pod.inrupt.com/virginiabalseiro/profile/card#me",
>>>>>>> add tests
    });
  });
});
