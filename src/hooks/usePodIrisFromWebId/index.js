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
import { getSolidDataset, getThing, getUrlAll } from "@inrupt/solid-client";
import { space } from "rdf-namespaces";

async function fetchPodIrisFromWebId(webId, fetch) {
  const profileDoc = await getSolidDataset(webId, { fetch });
  const profile = getThing(profileDoc, webId);
  return getUrlAll(profile, space.storage);
}

export const FETCH_POD_IRIS_FROM_WEB_ID = "fetchPodIrisFromWebId";
export default function usePodIrisFromWebId(webId) {
  const { session } = useSession();
  return useSWR([webId, FETCH_POD_IRIS_FROM_WEB_ID], () =>
    fetchPodIrisFromWebId(webId, session.fetch)
  );
}
