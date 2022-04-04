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
import AccessRequestContext, { AccessRequestProvider } from "./index";

function ChildComponent() {
  const { accessRequest, setAccessRequest } = useContext(AccessRequestContext);
  setAccessRequest({ agentName: "Access Request Details" });
  return <div id="accessRequest">{accessRequest.agentName}</div>;
}

describe("accessRequestContext", () => {
  it("Renders initial context data", () => {
    const accessRequest = { agentName: "Access Request initial" };
    const { asFragment } = render(
      <AccessRequestProvider accessRequest={accessRequest}>
        <ChildComponent />
      </AccessRequestProvider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("provides accessRequest and setAccessRequest", () => {
    const accessRequest = { agentName: "Access Request initial" };
    const setAccessRequest = jest.fn();
    const { container } = render(
      <AccessRequestProvider
        accessRequest={accessRequest}
        setAccessRequest={setAccessRequest}
      >
        <ChildComponent />
      </AccessRequestProvider>
    );

    expect(container.querySelector("#accessRequest").innerHTML).toEqual(
      accessRequest.agentName
    );
    expect(setAccessRequest).toHaveBeenCalledWith({
      agentName: "Access Request Details",
    });
  });
});
