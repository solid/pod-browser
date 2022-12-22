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
import { getUrl } from "@inrupt/solid-client";
import { rdf, schema } from "rdf-namespaces";
import { useRouter } from "next/router";
import { getProfileIriFromContactThing } from "../../src/addressBook";
import useFullProfile from "../../src/hooks/useFullProfile";

export const TESTCAFE_ID_PROFILE_LINK = "profile-link";

export function buildProfileLink(webId, route, path) {
  if (route === "/contacts") {
    return `${route}/${encodeURIComponent(webId)}`;
  }
  return `${route}/${path}/${encodeURIComponent(webId)}`;
}

export default function ProfileLink() {
  const { route } = useRouter();
  const { thing } = useThing();
  const webId = getProfileIriFromContactThing(thing);
  const profile = useFullProfile(webId);

  if (profile === null) return null;

  const path = profile?.types.includes(schema.Person) ? "person" : "app";

  return (
    <Link
      href={buildProfileLink(webId, route, path)}
      data-testid={TESTCAFE_ID_PROFILE_LINK}
    >
      {profile?.names[0] || webId}
    </Link>
  );
}
