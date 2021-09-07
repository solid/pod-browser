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
import { getStringNoLocale, getUrl } from "@inrupt/solid-client";
import { vcard, foaf, rdf, schema } from "rdf-namespaces";
import { useRouter } from "next/router";
import { getProfileIriFromContactThing } from "../../src/addressBook";

export const TESTCAFE_ID_RESOURCE_ACCESS_LINK = "resource-access-link";

export function buildResourcesLink(webId, route, path) {
  return `${route}/${path}/${encodeURIComponent(webId)}`;
}

export function isPerson(type) {
  return type === schema.Person || type === foaf.Person ? "person" : "app";
}

export default function AgentResourceAccessLink(props) {
  const { route } = useRouter();
  const { webId } = props;
  const { thing } = useThing();
  const contact = getProfileIriFromContactThing(thing);

  const type = getUrl(thing, rdf.type);
  const path = isPerson(type);
  // Pass in an iri, or use the thing from context (such as for the contacts list)
  const profileIri = webId || contact;

  // TODO remove this once react-sdk allows property fallbacks
  const name =
    getStringNoLocale(thing, foaf.name) ||
    getStringNoLocale(thing, vcard.fn) ||
    profileIri;

  return (
    <Link href={buildResourcesLink(profileIri, route, path)}>
      <a data-testid={TESTCAFE_ID_RESOURCE_ACCESS_LINK}>{name}</a>
    </Link>
  );
}

AgentResourceAccessLink.propTypes = {
  webId: T.string,
};

AgentResourceAccessLink.defaultProps = {
  webId: null,
};
