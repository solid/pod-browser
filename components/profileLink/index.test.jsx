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
import { mockThingFrom, setStringNoLocale } from "@inrupt/solid-client";
import { ThingProvider } from "@inrupt/solid-ui-react";
import { foaf, vcard } from "rdf-namespaces";
import ProfileLink, { buildProfileLink } from "./index";
import { chain } from "../../src/solidClientHelpers/utils";

const alice = chain(mockThingFrom("https://example.com/alice"), (t) =>
  setStringNoLocale(t, vcard.fn, "Alice")
);
const bob = chain(mockThingFrom("https://example.com/bob"), (t) =>
  setStringNoLocale(t, foaf.name, "Bob")
);
const iri = "/iri with spaces";

describe("ProfileLink", () => {
  it("supports rendering name from vcard.fn", () => {
    const { asFragment } = render(
      <ThingProvider thing={alice}>
        <ProfileLink iri={iri} />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("supports rendering name from foaf.name", () => {
    const { asFragment } = render(
      <ThingProvider thing={bob}>
        <ProfileLink />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("buildProfileLink", () => {
  it("generates a valid path", () => {
    expect(buildProfileLink(iri)).toEqual(
      `/contacts/${encodeURIComponent(iri)}`
    );
  });
});
