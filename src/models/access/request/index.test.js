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

import getAccessRequestDetails, {
  getAccessRequestDetailsOnePurpose,
  getAccessRequestDetailsOneResource,
} from "../../../../__testUtils/mockAccessRequestDetails";
import {
  getDataSubjectWebId,
  getExpiryDate,
  getPurposeUrls,
  getRequestedAccesses,
} from "./index";

const accessRequest = getAccessRequestDetails();
const accessRequestOnePurpose = getAccessRequestDetailsOnePurpose();

describe("getPurposeUrls", () => {
  it("returns null if accessRequest is unavailable", () => {
    const purposes = getPurposeUrls(undefined);
    expect(purposes).toBeNull();
  });

  it("returns purpose urls for multiple purposes", () => {
    const purposes = getPurposeUrls(accessRequest);
    expect(purposes).toEqual([
      "https://example.com/SomeSpecificPurpose",
      "https://example.com/SomeSpecificPurposeA",
      "https://example.com/SomeSpecificPurposeB",
    ]);
  });

  it("returns purpose urls for one purpose", () => {
    const purpose = getPurposeUrls(accessRequestOnePurpose);
    expect(purpose).toEqual("https://example.com/SomeSpecificPurpose");
  });
});

describe("getExpiryDate", () => {
  it("returns expiration date", () => {
    const date = getExpiryDate(accessRequest);
    expect(date).toEqual("2022-06-23T16:40:03Z");
  });
});

describe("getRequestedAccesses", () => {
  it("returns requested accesses", () => {
    const resources = getRequestedAccesses(accessRequest);
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
        isConsentForDataSubject: "https://id.inrupt.com/someWebId",
      },
      {
        mode: ["Read"],
        hasStatus: "ConsentStatusRequested",
        forPersonalData: ["https://pod.inrupt.com/alice/private/data"],
        forPurpose: "https://example.com/SomeSpecificPurpose",
        isConsentForDataSubject: "https://id.inrupt.com/someWebId",
      },
      {
        mode: ["Append"],
        hasStatus: "ConsentStatusRequested",
        forPersonalData: ["https://pod.inrupt.com/alice/private/data"],
        forPurpose: "https://example.com/SomeSpecificPurpose",
        isConsentForDataSubject: "https://id.inrupt.com/someWebId",
      },
      {
        mode: ["Control"],
        hasStatus: "ConsentStatusRequested",
        forPersonalData: ["https://pod.inrupt.com/alice/private/data"],
        forPurpose: "https://example.com/SomeSpecificPurpose",
        isConsentForDataSubject: "https://id.inrupt.com/someWebId",
      },
    ]);
  });
});

describe("getDataSubjectWebId", () => {
  it("returns data subject WebId for request with multiple resources", () => {
    const resourceOwnerWebId = getDataSubjectWebId(accessRequest);
    expect(resourceOwnerWebId).toEqual("https://id.inrupt.com/someWebId");
  });
  it("returns data subject WebId for request with one resource", () => {
    const oneResourceRequest = getAccessRequestDetailsOneResource();
    const resourceOwnerWebId = getDataSubjectWebId(oneResourceRequest);
    expect(resourceOwnerWebId).toEqual("https://id.inrupt.com/someWebId");
  });
});
