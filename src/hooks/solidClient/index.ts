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

/* eslint-disable camelcase, @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { useContext } from "react";
import useSWR from "swr";
import { space } from "rdf-namespaces";

import {
  fetchLitDataset,
  getThing,
  getIriAll,
  unstable_Access,
  fetchResourceInfoWithAcl,
  unstable_getAgentAccessAll,
  isContainer,
} from "@inrupt/solid-client";

import {
  fetchResourceWithAcl,
  getIriPath,
  namespace,
  normalizePermissions,
  IResourceDetails,
} from "../../solidClientHelpers";

import SessionContext from "../../contexts/sessionContext";

export async function fetchContainerResourceIris(
  containerIri: string,
  fetch: typeof window.fetch
): Promise<string[]> {
  const litDataset = await fetchLitDataset(containerIri, { fetch });
  const container = getThing(litDataset, containerIri);
  const iris = getIriAll(container, namespace.contains);
  return iris;
}

export const GET_CONTAINER_RESOURCE_IRIS = "getContainerResourceIris";
/* istanbul ignore next */
export function useFetchContainerResourceIris(iri: string): any {
  const { session } = useContext(SessionContext);

  return useSWR<string[]>([iri, GET_CONTAINER_RESOURCE_IRIS], () =>
    fetchContainerResourceIris(iri, session.fetch)
  );
}

export async function fetchResourceDetails(
  iri: string,
  fetch: typeof window.fetch
): Promise<IResourceDetails> {
  const name = getIriPath(iri) as string;
  const resourceInfo = await fetchResourceInfoWithAcl(iri, { fetch });

  const accessModeList = unstable_getAgentAccessAll(resourceInfo);
  const permissions = await normalizePermissions(
    accessModeList as Record<string, unstable_Access>,
    fetch
  );

  let types = [] as string[];
  const contentType = resourceInfo?.internal_resourceInfo?.contentType;

  if (contentType) types = [contentType];
  if (isContainer(resourceInfo)) types = ["Container"];

  return {
    iri,
    permissions,
    types,
    name,
    dataset: resourceInfo,
  };
}

export const FETCH_RESOURCE_DETAILS = "fetchResourceDetails";
/* istanbul ignore next */
export function useFetchResourceDetails(iri: string): any {
  const { session } = useContext(SessionContext);
  return useSWR([iri, FETCH_RESOURCE_DETAILS], () =>
    fetchResourceDetails(iri, session.fetch)
  );
}

export const FETCH_RESOURCE_WITH_ACL = "fetchResourceWithAcl";
/* istanbul ignore next */
export function useFetchResourceWithAcl(iri: string): any {
  const { session } = useContext(SessionContext);
  return useSWR([iri, FETCH_RESOURCE_WITH_ACL], () =>
    fetchResourceWithAcl(iri, session.fetch)
  );
}

export async function fetchPodIrisFromWebId(
  webId: string,
  fetch: typeof window.fetch
): Promise<string[]> {
  const profileDoc = await fetchLitDataset(webId, { fetch });

  const profile = getThing(profileDoc, webId);

  return getIriAll(profile, space.storage);
}
export const FETCH_POD_IRIS_FROM_WEB_ID = "fetchPodIrisFromWebId";
/* istanbul ignore next */
export function useFetchPodIrisFromWebId(webId: string): any {
  const { session } = useContext(SessionContext);
  return useSWR([webId, FETCH_POD_IRIS_FROM_WEB_ID], () =>
    fetchPodIrisFromWebId(webId, session.fetch)
  );
}
