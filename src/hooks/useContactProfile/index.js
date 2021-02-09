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

import { useSession } from "@inrupt/solid-ui-react";
import useSWR from "swr";
import { asUrl } from "@inrupt/solid-client";
import { getResource } from "../../solidClientHelpers/resource";
import { getWebIdUrl } from "../../addressBook";
import { fetchProfile } from "../../solidClientHelpers/profile";

export default function useContactProfile(contact) {
  const { fetch } = useSession();
  let personThingUrl;
  try {
    personThingUrl = asUrl(contact);
  } catch {
    personThingUrl = null;
  }
  return useSWR(["contact", personThingUrl], async () => {
    if (!personThingUrl) return null;
    const {
      response: { dataset, iri },
    } = await getResource(personThingUrl, fetch);
    const webId = getWebIdUrl(dataset, iri);
    const fetchedProfile = await fetchProfile(webId, fetch);
    return fetchedProfile;
  });
}
