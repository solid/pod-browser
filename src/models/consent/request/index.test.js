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

import getConsentRequestDetails, {
  getConsentRequestDetailsOnePurpose,
} from "../../../../__testUtils/mockConsentRequestDetails";
import { getExpiryDate, getPurposeUrls, getRequestedAccesses } from "./index";

const consentRequest = getConsentRequestDetails();
const consentRequestOnePurpose = getConsentRequestDetailsOnePurpose();

describe("getPurposeUrls", () => {
  test("returns null if consentRequest is unavailable", () => {
    const purposes = getPurposeUrls(undefined);
    expect(purposes).toBeNull();
  });
  it("returns purpose urls for multiple purposes", () => {
    const purposes = getPurposeUrls(consentRequest);
    expect(purposes).toEqual([
      "https://example.com/SomeSpecificPurpose",
      "https://example.com/SomeSpecificPurposeA",
      "https://example.com/SomeSpecificPurposeB",
    ]);
  });
  it("returns purpose urls for one purpose", () => {
    const purpose = getPurposeUrls(consentRequestOnePurpose);
    expect(purpose).toEqual("https://example.com/SomeSpecificPurpose");
  });
});

describe("getExpiryDate", () => {
  it("returns expiration date", () => {
    const date = getExpiryDate(consentRequest);
    expect(date).toEqual("2022-06-23T16:40:03Z");
  });
});

describe("getRequestedAccesses", () => {
  it("returns requested accesses", () => {
    const resources = getRequestedAccesses(consentRequest);
    expect(resources).toEqual([
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
    ]);
  });
});
