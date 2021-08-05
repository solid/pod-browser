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

import React, { useContext } from "react";
import { render } from "@testing-library/react";
import ConsentRequestContext, { ConsentRequestProvider } from "./index";

function ChildComponent() {
  const { consentRequest, setConsentRequest } = useContext(
    ConsentRequestContext
  );
  setConsentRequest({ agentName: "Consent Request Details" });
  return <div id="consentRequest">{consentRequest.agentName}</div>;
}

describe("consentRequestContext", () => {
  test("Renders initial context data", () => {
    const consentRequest = { agentName: "Consent Request initial" };
    const { asFragment } = render(
      <ConsentRequestProvider consentRequest={consentRequest}>
        <ChildComponent />
      </ConsentRequestProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
  test("it provides consentRequest and setConsentRequest", () => {
    const consentRequest = { agentName: "Consent Request initial" };
    const setConsentRequest = jest.fn();
    const { container } = render(
      <ConsentRequestProvider
        consentRequest={consentRequest}
        setConsentRequest={setConsentRequest}
      >
        <ChildComponent />
      </ConsentRequestProvider>
    );

    expect(container.querySelector("#consentRequest").innerHTML).toEqual(
      consentRequest.agentName
    );
    expect(setConsentRequest).toHaveBeenCalledWith({
      agentName: "Consent Request Details",
    });
  });
});
