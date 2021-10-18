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

import React from "react";
import { render } from "@testing-library/react";
import * as solidClientFns from "@inrupt/solid-client";
import { renderWithTheme } from "../../../__testUtils/withTheme";
import {
  aliceWebIdUrl,
  mockPersonDatasetAlice,
} from "../../../__testUtils/mockPersonResource";
import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import PersonAvatar, { setupErrorComponent } from "./index";

const profileIri = "https://example.com/profile/card#me";

describe("Person Avatar", () => {
  const profileDataset = mockPersonDatasetAlice();
  const profileThing = solidClientFns.getThing(profileDataset, aliceWebIdUrl);

  beforeEach(() => {
    jest
      .spyOn(solidClientFns, "getSolidDataset")
      .mockResolvedValue(profileDataset);
    jest.spyOn(solidClientFns, "getThing").mockReturnValue(profileThing);
  });

  test("renders a person avatar", async () => {
    const session = mockSession();
    const SessionProvider = mockSessionContextProvider(session);
    const { asFragment } = renderWithTheme(
      <SessionProvider>
        <PersonAvatar profileIri={profileIri} />
      </SessionProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("setupErrorComponent", () => {
  it("renders", () => {
    const bem = (value) => value;
    const { asFragment } = render(setupErrorComponent(bem)());
    expect(asFragment()).toMatchSnapshot();
  });
});
