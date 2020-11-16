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
import T from "prop-types";
import Link from "next/link";
import { useThing } from "@inrupt/solid-ui-react";
import { getStringNoLocale, asUrl } from "@inrupt/solid-client";
import { vcard, foaf } from "rdf-namespaces";

export function buildProfileLink(webId) {
  return `/contacts/${encodeURIComponent(webId)}`;
}

export default function ProfileLink(props) {
  const { webId } = props;
  const { thing } = useThing();

  // Pass in an iri, or use the thing from context (such as for the contacts list)
  const profileIri = webId || asUrl(thing);

  // TODO remove this once react-sdk allows property fallbacks
  const name =
    getStringNoLocale(thing, vcard.fn) || getStringNoLocale(thing, foaf.name);

  return (
    <Link href="/contacts/[show]" as={buildProfileLink(profileIri)}>
      {name}
    </Link>
  );
}

ProfileLink.propTypes = {
  webId: T.string,
};

ProfileLink.defaultProps = {
  webId: null,
};
