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
import ResourceInfoContext, { ResourceInfoProvider } from "./index";

jest.mock("../../featureFlags");

const errorText = "error is set";
const mutateText = "mutate is set";

function ChildComponent() {
  const { data, error, mutate, isValidating } = useContext(ResourceInfoContext);

  return (
    <>
      {data && <div data-testid="data">{data}</div>}
      {error && <div data-testid="error">{errorText}</div>}
      {mutate && <div data-testid="mutate">{mutateText}</div>}
      {isValidating && (
        <div data-testid="isValidating">{isValidating.toString()}</div>
      )}
    </>
  );
}

describe("ResourceInfoContext", () => {
  const data = "data";
  const error = {};
  const mutate = () => {};
  const isValidating = false;
  const swr = { data, error, mutate, isValidating };

  it("has a default context", () => {
    const { getByTestId, queryByTestId } = render(
      <ResourceInfoProvider
        swr={{
          data: null,
          error: null,
          mutate: jest.fn(),
          isValidating: true,
        }}
      >
        <ChildComponent />
      </ResourceInfoProvider>
    );

    expect(queryByTestId("data")).toBeNull();
    expect(queryByTestId("error")).toBeNull();
    expect(getByTestId("mutate").innerHTML).toEqual(mutateText);
    expect(getByTestId("isValidating").innerHTML).toEqual("true");
  });

  it("serves the swrResponse interface (with data, error, mutate, and isValidating)", () => {
    const { getByTestId, queryByTestId } = render(
      <ResourceInfoProvider swr={swr}>
        <ChildComponent />
      </ResourceInfoProvider>
    );

    expect(getByTestId("data").innerHTML).toEqual(data);
    expect(getByTestId("error").innerHTML).toEqual(errorText);
    expect(getByTestId("mutate").innerHTML).toEqual(mutateText);
    expect(queryByTestId("isValidating")).toBeNull();
  });
});
