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

/* eslint-disable camelcase */
import useSWR from "swr";
import { ldp } from "rdf-namespaces";

import { getIriAll, getSolidDataset, getThing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";

async function fetchContainerResourceIris(containerIri, fetch) {
  const litDataset = await getSolidDataset(containerIri, { fetch });
  const container = getThing(litDataset, containerIri);
  return getIriAll(container, ldp.contains);
}

export const GET_CONTAINER_RESOURCE_IRIS = "getContainerResourceIris";
export default function useContainerResourceIris(iri) {
  const { fetch } = useSession();

  return useSWR([iri, GET_CONTAINER_RESOURCE_IRIS], () =>
    fetchContainerResourceIris(iri, fetch)
  );
}
