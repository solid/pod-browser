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

import useSWR from "swr";
import {
  fetchLitDataset,
  getThingOne,
  getIriAll,
  unstable_AccessModes,
  unstable_fetchResourceInfoWithAcl,
  unstable_getAgentAccessModesAll,
  isContainer,
} from "@solid/lit-pod";
import { space } from "rdf-namespaces";
import {
  fetchResourceWithAcl,
  getIriPath,
  namespace,
  normalizePermissions,
  ResourceDetails,
} from "../../lit-solid-helpers";

export async function fetchContainerResourceIris(
  containerIri: string
): Promise<string[]> {
  const litDataset = await fetchLitDataset(containerIri);
  const container = getThingOne(litDataset, containerIri);
  const iris = getIriAll(container, namespace.contains);
  return iris;
}

export const GET_CONTAINER_RESOURCE_IRIS = "getContainerResourceIris";
export function useFetchContainerResourceIris(iri: string): any {
  return useSWR<string[]>(
    [iri, GET_CONTAINER_RESOURCE_IRIS],
    fetchContainerResourceIris
  );
}

export async function fetchResourceDetails(
  iri: string
): Promise<ResourceDetails> {
  const name = getIriPath(iri) as string;
  const resourceInfo = await unstable_fetchResourceInfoWithAcl(iri);
  const accessModeList = unstable_getAgentAccessModesAll(resourceInfo);
  const permissions = await normalizePermissions(
    accessModeList as Record<string, unstable_AccessModes>
  );

  let types = [];
  const contentType = resourceInfo?.resourceInfo?.contentType;

  if (contentType) types = [contentType];
  if (isContainer(resourceInfo)) types = ["Container"];

  return {
    iri,
    permissions,
    types,
    name,
  };
}

export const FETCH_RESOURCE_DETAILS = "fetchResourceDetails";
export function useFetchResourceDetails(iri: string): any {
  return useSWR([iri, FETCH_RESOURCE_DETAILS], fetchResourceDetails);
}

export const FETCH_RESOURCE_WITH_ACL = "fetchResourceWithAcl";
export function useFetchResourceWithAcl(iri: string): any {
  return useSWR([iri, "fetchResourceWithAcl"], fetchResourceWithAcl);
}

export async function fetchPodIrisFromWebId(webId: string): Promise<string[]> {
  const profileDoc = await fetchLitDataset(webId);
  const profile = getThingOne(profileDoc, webId);

  return getIriAll(profile, space.storage);
}
export const FETCH_POD_IRIS_FROM_WEB_ID = "fetchPodIrisFromWebId";
export function useFetchPodIrisFromWebId(webId: string): any {
  return useSWR([webId, FETCH_POD_IRIS_FROM_WEB_ID], fetchPodIrisFromWebId);
}
