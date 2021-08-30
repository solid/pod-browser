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
import { useRouter } from "next/router";
import { render } from "@testing-library/react";
import { addUrl, mockThingFrom, setStringNoLocale } from "@inrupt/solid-client";
import { ThingProvider } from "@inrupt/solid-ui-react";
import { foaf, rdf, vcard, schema } from "rdf-namespaces";
import AgentResourceAccessLink, { buildResourcesLink } from "./index";
import { chain } from "../../src/solidClientHelpers/utils";

jest.mock("next/router");

const mockedUseRouter = useRouter;

const alice = chain(mockThingFrom("https://example.com/alice"), (t) =>
  setStringNoLocale(t, vcard.fn, "Alice")
);
const bob = chain(
  mockThingFrom("https://example.com/bob"),
  (t) => setStringNoLocale(t, foaf.name, "Bob"),
  (t) => addUrl(t, rdf.type, schema.Person)
);
const iri = "/iri with spaces";

describe("AgentResourceAccessLink", () => {
  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      route: "/privacy",
    });
  });
  it("supports rendering name from vcard.fn", () => {
    const { asFragment } = render(
      <ThingProvider thing={alice}>
        <AgentResourceAccessLink iri={iri} />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("supports rendering name from foaf.name", () => {
    const { asFragment } = render(
      <ThingProvider thing={bob}>
        <AgentResourceAccessLink />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders iri if name is not found", () => {
    const { asFragment } = render(
      <ThingProvider thing={mockThingFrom("https://mockiri.com")}>
        <AgentResourceAccessLink />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders correct path for privacy contacts", () => {
    mockedUseRouter.mockReturnValueOnce({
      route: "/privacy",
    });
    const { asFragment } = render(
      <ThingProvider thing={bob}>
        <AgentResourceAccessLink />
      </ThingProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

describe("buildProfileLink", () => {
  it("generates a valid path", () => {
    expect(buildResourcesLink(iri, "/privacy")).toEqual(
      `/privacy/resourceAccess/${encodeURIComponent(iri)}`
    );
  });
});
