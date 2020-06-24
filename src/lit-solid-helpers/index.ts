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
import {
  DatasetInfo,
  fetchLitDataset,
  getDatetimeOne,
  getDecimalOne,
  getIntegerOne,
  getIriAll,
  getStringUnlocalizedOne,
  getThingOne,
  getIriOne,
  IriString,
  LitDataset,
  Thing,
  unstable_AccessModes,
  unstable_Acl,
  unstable_AgentAccess,
  unstable_fetchFile,
  unstable_fetchLitDatasetWithAcl,
  unstable_getAgentAccessModesAll,
} from "@solid/lit-pod";
import { ldp } from "rdf-namespaces";
import { parseUrl } from "../stringHelpers";

const ldpWithType: Record<string, string> = ldp;

const typeNameMap = Object.keys(ldpWithType).reduce(
  (acc: Record<string, string>, key: string): Record<string, string> => {
    const value = ldpWithType[key];
    return {
      ...acc,
      [value]: key,
    };
  },
  {}
);

// TODO use ldp namespace when available
export const namespace: Record<string, string> = {
  ...ldp,
  ...typeNameMap,
  mtime: "http://www.w3.org/ns/posix/stat#mtime",
  "http://www.w3.org/ns/posix/stat#mtime": "mtime",
  modified: "http://purl.org/dc/terms/modified",
  "http://purl.org/dc/terms/modified": "modified",
  size: "http://www.w3.org/ns/posix/stat#size",
  "http://www.w3.org/ns/posix/stat#size": "size",
  nickname: "http://xmlns.com/foaf/0.1/nick",
  "http://xmlns.com/foaf/0.1/nick": "nickname",
  familyName: "http://xmlns.com/foaf/0.1/familyName",
  "http://xmlns.com/foaf/0.1/familyName": "familyName",
  img: "http://xmlns.com/foaf/0.1/img",
  "http://xmlns.com/foaf/0.1/img": "img",
  name: "http://xmlns.com/foaf/0.1/name",
  "http://xmlns.com/foaf/0.1/name": "name",
  hasPhoto: "http://www.w3.org/2006/vcard/ns#hasPhoto",
  "http://www.w3.org/2006/vcard/ns#hasPhoto": "hasPhoto",
};

export function getIriPath(iri: string): string | undefined {
  const { pathname } = parseUrl(iri);
  return pathname.replace(/\/?$/, "");
}

export function getTypeName(rawType: string): string {
  if (!rawType) return "";
  return typeNameMap[rawType] || rawType;
}

export function displayTypes(types: string[]): string[] {
  return types?.length ? types.map((t: string): string => getTypeName(t)) : [];
}

export function displayPermissions(permissions: unstable_AccessModes): string {
  const perms = Object.values(permissions);
  if (perms.every((p) => p)) return "Full Control";
  if (perms.every((p) => !p)) return "No Access";
  if (permissions.write) return "Can Edit";
  return "Can View";
}

export interface Profile {
  webId: string;
  avatar?: string | null;
  name?: string | null;
  nickname?: string | null;
}

export async function fetchProfile(webId: string): Promise<Profile> {
  const profileResource = await fetchLitDataset(webId);
  const profile = getThingOne(profileResource, webId);
  const nickname = getStringUnlocalizedOne(profile, namespace.nickname);
  const name = getStringUnlocalizedOne(profile, namespace.name);
  const avatar = getIriOne(profile, namespace.hasPhoto);

  return { webId, nickname, name, avatar };
}

export interface NormalizedPermission {
  webId: string;
  alias: string;
  acl: unstable_AccessModes;
  profile: Profile;
}

export async function normalizePermissions(
  permissions: unstable_AgentAccess
): Promise<NormalizedPermission[]> {
  return Promise.all(
    Object.keys(permissions).map(
      async (webId: string): Promise<NormalizedPermission> => {
        const acl = permissions[webId];
        const profile = await fetchProfile(webId);

        return {
          acl,
          profile,
          alias: displayPermissions(acl),
          webId,
        };
      }
    )
  );
}

export function normalizeDataset(
  dataset: Thing,
  iri: IriString
): NormalizedResource {
  const rawType = getIriAll(
    dataset,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );

  const mtime = getDecimalOne(dataset, namespace.mtime);
  const modified = getDatetimeOne(dataset, namespace.modified);
  const size = getIntegerOne(dataset, namespace.size);
  const contains = getIriAll(dataset, namespace.contains);
  const types = displayTypes(rawType);

  return {
    contains,
    iri,
    modified,
    mtime,
    size,
    types,
  };
}

export interface NormalizedResource {
  iri: string;
  types: string[];
  mtime?: number | null;
  modified?: Date | null;
  size?: number | null;
  contains?: string[];
  permissions?: NormalizedPermission[];
}

export interface ResourceDetails extends NormalizedResource {
  name: string;
}

export const PERMISSIONS: string[] = ["read", "write", "append", "control"];

export function parseStringAcl(acl: string): unstable_AccessModes {
  return PERMISSIONS.reduce((acc, key) => {
    return {
      ...acc,
      [key]: acl.includes(key),
    };
  }, {} as unstable_AccessModes);
}

export function permissionsFromWacAllowHeaders(
  wacAllow?: string
): NormalizedPermission[] {
  if (!wacAllow) return [];
  const permissions = wacAllow.split(",");
  return permissions.reduce(
    (acc: NormalizedPermission[], permission: string) => {
      const [webId, stringAcl] = permission.split("=");
      const acl = parseStringAcl(stringAcl);
      const alias = displayPermissions(acl);

      return [
        ...acc,
        {
          webId,
          alias,
          acl,
          profile: { webId, name: webId },
        },
      ];
    },
    []
  );
}

export interface NormalizedFile extends NormalizedResource {
  file: Blob;
}

export async function fetchFileWithAcl(iri: string): Promise<NormalizedFile> {
  const response = await unstable_fetchFile(iri);
  const file = await response.blob();
  const { headers } = response;
  const permissions = permissionsFromWacAllowHeaders(
    headers.get("wac-allow") as string
  );
  const type = headers.get("content-type") as string;

  return {
    iri,
    permissions,
    types: [type],
    file,
  };
}

export async function fetchResourceWithAcl(
  iri: string
): Promise<NormalizedResource> {
  const resource = await unstable_fetchLitDatasetWithAcl(iri);
  const acl = await unstable_getAgentAccessModesAll(
    resource as LitDataset & DatasetInfo & unstable_Acl
  );
  const permissions = acl ? await normalizePermissions(acl) : undefined;
  const dataset = resource as LitDataset;
  const thing = dataset as Thing;

  return {
    permissions,
    ...normalizeDataset(thing, iri),
  };
}

export async function fetchResource(iri: string): Promise<NormalizedResource> {
  const resource = await fetchLitDataset(iri);
  const dataset = resource as LitDataset;
  const thing = dataset as Thing;

  return normalizeDataset(thing, iri);
}

export function isUserOrMatch(webId: string, id: string): boolean {
  return webId === "user" || webId === id;
}

export function getUserPermissions(
  id: string,
  permissions?: NormalizedPermission[]
): NormalizedPermission | null {
  if (!permissions) return null;

  const permission = permissions.find(({ webId }) => isUserOrMatch(webId, id));

  return permission || null;
}

export function getThirdPartyPermissions(
  id: string,
  permissions?: NormalizedPermission[]
): NormalizedPermission[] {
  if (!permissions) return [];
  return permissions.filter(({ webId }) => !isUserOrMatch(webId, id));
}
