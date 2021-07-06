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

import { ThingProvider } from "@inrupt/solid-ui-react";
import { mockThingFrom } from "@inrupt/solid-client";
import React from "react";
import { renderWithTheme } from "../../__testUtils/withTheme";
import mockPersonContactThing from "../../__testUtils/mockPersonContactThing";
import AgentAvatar from "./index";

describe("AgentAvatar", () => {
  it("renders avatar for person contact", () => {
    const contact = mockPersonContactThing("https://examplewebid.com");
    const { asFragment } = renderWithTheme(
      <ThingProvider thing={contact}>
        <AgentAvatar imageUrl="https://example.org" altText="alt text" />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it("renders fallback icon for app contact", () => {
    const thing = mockThingFrom("https://someappwebid.com");
    const { asFragment } = renderWithTheme(
      <ThingProvider thing={thing}>
        <AgentAvatar imageUrl="https://example.org" altText="alt text" />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
