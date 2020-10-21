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
import { vcard } from "rdf-namespaces";
import { mockThingFrom } from "@inrupt/solid-client";
import { ThingProvider } from "@inrupt/solid-ui-react";

import mockSession from "../../../__testUtils/mockSession";
import mockSessionContextProvider from "../../../__testUtils/mockSessionContextProvider";
import { mountToJson } from "../../../__testUtils/mountWithTheme";

import ContactInfoTable from "./index";

describe("ContactInfoTable", () => {
  test("renders a table of contact info", () => {
    const session = mockSession({ fetch });
    const SessionProvider = mockSessionContextProvider(session);
    const thing = mockThingFrom("http://example.com/alice#me");

    const tree = mountToJson(
      <SessionProvider>
        <ThingProvider thing={thing}>
          <ContactInfoTable property={vcard.hasEmail} />
        </ThingProvider>
      </SessionProvider>
    );

    expect(tree).toMatchSnapshot();
  });

  test("renders an editable table of contact info", () => {
    const session = mockSession({ fetch });
    const SessionProvider = mockSessionContextProvider(session);
    const thing = mockThingFrom("http://example.com/alice#me");

    const tree = mountToJson(
      <SessionProvider>
        <ThingProvider thing={thing}>
          <ContactInfoTable property={vcard.hasEmail} editing />
        </ThingProvider>
      </SessionProvider>
    );

    expect(tree).toMatchSnapshot();
  });
});
