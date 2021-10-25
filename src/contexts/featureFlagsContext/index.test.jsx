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

import React, { useContext, useState, useEffect } from "react";
import { render, waitFor } from "@testing-library/react";
import rules from "../../featureFlags";
import FeatureContext, { defaultContext, FeatureProvider } from "./index";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";

jest.mock("../../featureFlags");

function ChildComponent() {
  const { enabled } = useContext(FeatureContext);
  const [featureToggle, setFeatureToggle] = useState(false);

  useEffect(() => {
    const resolveToggle = async () => {
      const getToggle = await enabled("test");
      setFeatureToggle(getToggle);
    };
    resolveToggle();
  }, [enabled]);

  return (
    <>
      {featureToggle && (
        <div data-testid="test">{featureToggle.toString()}</div>
      )}
    </>
  );
}

describe("FeatureFlagsContext", () => {
  let SessionProvider;

  beforeEach(() => {
    const session = mockSession();
    SessionProvider = mockSessionContextProvider(session);
  });

  it("has a default context", () => {
    expect(defaultContext.enabled()).toBe(false);
  });

  it("can read feature flags", async () => {
    rules.mockReturnValue({
      test: () => true,
    });

    const { getByTestId } = render(
      <SessionProvider>
        <FeatureProvider>
          <ChildComponent />
        </FeatureProvider>
      </SessionProvider>
    );
    await waitFor(() => {
      expect(getByTestId("test").innerHTML).toEqual("true");
    });
  });
});
