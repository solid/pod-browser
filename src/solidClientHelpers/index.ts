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
  fetchLitDataset,
  getDatetime,
  getDecimal,
  getInteger,
  getIri,
  getIriAll,
  getStringNoLocale,
  getThing,
  IriString,
  LitDataset,
  Thing,
  unstable_Access,
  unstable_AgentAccess,
  unstable_fetchFile,
  unstable_fetchLitDatasetWithAcl,
  unstable_getAgentAccessAll,
  unstable_getResourceAcl,
  unstable_hasAccessibleAcl,
  unstable_hasResourceAcl,
  unstable_saveAclFor,
  unstable_setAgentDefaultAccess,
  unstable_setAgentResourceAccess,
} from "@inrupt/solid-client";
import { ldp, space } from "rdf-namespaces";
import { parseUrl, isUrl } from "../stringHelpers";

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

export const ACL = {
  NONE: {
    key: "none",
    alias: "No access",
    acl: {
      read: false,
      write: false,
      append: false,
      control: false,
    },
  },
  READ: {
    key: "read",
    alias: "View",
    acl: {
      read: true,
      write: false,
      append: false,
      control: false,
    },
  },
  WRITE: {
    key: "write",
    alias: "Edit",
    acl: {
      read: true,
      write: true,
      append: true,
      control: false,
    },
  },
  APPEND: {
    key: "append",
    alias: "Append",
    acl: {
      read: true,
      write: false,
      append: true,
      control: false,
    },
  },
  CONTROL: {
    key: "control",
    alias: "Control",
    acl: {
      read: true,
      write: true,
      append: true,
      control: true,
    },
  },
};

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

export function isContainerIri(iri: string): boolean {
  return iri.charAt(iri.length - 1) === "/";
}

export function getIriPath(iri: string): string | undefined {
  const { pathname } = parseUrl(iri);
  return pathname.replace(/\/?$/, "");
}

export function getResourceName(iri: string): string | undefined {
  let { pathname } = parseUrl(iri);
  if (isContainerIri(pathname)) {
    pathname = pathname.substring(0, pathname.length - 1);
  }
  return pathname.match(/(?!\/)(?:.(?!\/))+$/)?.toString();
}

export function getTypeName(rawType: string): string {
  if (!rawType) return "";
  return typeNameMap[rawType] || rawType;
}

export function displayTypes(types: string[]): string[] {
  return types?.length ? types.map((t: string): string => getTypeName(t)) : [];
}

export function aclToString(acl: unstable_Access): string {
  return `read:${acl.read},write:${acl.write},append:${acl.append},control:${acl.control}`;
}

export function displayProfileName({ nickname, name, webId }: Profile): string {
  if (name) return name;
  if (nickname) return nickname;
  return webId;
}

export function isEqualACL(
  aclA: unstable_Access,
  aclB: unstable_Access
): boolean {
  return aclToString(aclA) === aclToString(aclB);
}

export function displayPermissions(permissions: unstable_Access): string {
  const templatePermission = Object.values(ACL).find((template) => {
    const { acl } = template;
    return isEqualACL(permissions, acl as unstable_Access);
  });

  if (templatePermission) return templatePermission.alias;
  return "Custom";
}

export interface Profile {
  webId: string;
  avatar?: string | null;
  name?: string | null;
  nickname?: string | null;
  pods?: string[] | null;
}

export async function fetchProfile(
  webId: string,
  fetch: typeof window.fetch
): Promise<Profile> {
  const profileResource = await fetchLitDataset(webId, { fetch });

  const profile = getThing(profileResource, webId);
  const nickname = getStringNoLocale(profile, namespace.nickname);
  const name = getStringNoLocale(profile, namespace.name);
  const avatar = getIri(profile, namespace.hasPhoto);
  const pods = getIriAll(profile, space.storage);

  return {
    webId,
    nickname,
    name,
    avatar,
    pods,
  };
}

export interface NormalizedPermission {
  webId: string;
  alias: string;
  acl: unstable_Access;
  profile: Profile;
}

export interface ISavePermissions {
  iri: string;
  webId: string;
  access: unstable_Access;
  fetch: typeof window.fetch;
}

export interface IResponse {
  error?: string;
  response?: unknown;
}

interface IResponder {
  respond: (response: unknown) => IResponse;
  error: (message: string) => IResponse;
}

export function createResponder(): IResponder {
  const respond = (response: unknown): IResponse => ({ response });
  const error = (message: string): IResponse => ({ error: message });

  return { respond, error };
}

export async function savePermissions({
  iri,
  webId,
  access,
  fetch,
}: ISavePermissions): Promise<IResponse> {
  const { respond, error } = createResponder();
  const dataset = await unstable_fetchLitDatasetWithAcl(iri, { fetch });
  if (!dataset) return error("dataset is empty");

  if (!unstable_hasResourceAcl(dataset)) {
    return error("dataset does not have resource ACL");
  }

  if (!unstable_hasAccessibleAcl(dataset)) {
    return error("dataset does not have accessible ACL");
  }

  const aclDataset = unstable_getResourceAcl(dataset);
  if (!aclDataset) return error("aclDataset is empty");

  const updatedAcl = unstable_setAgentResourceAccess(aclDataset, webId, access);
  if (!updatedAcl) return error("updatedAcl is empty");

  const response = await unstable_saveAclFor(dataset, updatedAcl, { fetch });
  if (!response) return error("response is empty");

  return respond(response);
}

export async function saveDefaultPermissions({
  iri,
  webId,
  access,
  fetch,
}: ISavePermissions): Promise<IResponse> {
  const { respond, error } = createResponder();
  const dataset = await unstable_fetchLitDatasetWithAcl(iri, { fetch });
  if (!dataset) return error("dataset is empty");

  if (!unstable_hasResourceAcl(dataset)) {
    return error("dataset does not have resource ACL");
  }

  if (!unstable_hasAccessibleAcl(dataset)) {
    return error("dataset does not have accessible ACL");
  }

  const aclDataset = unstable_getResourceAcl(dataset);
  if (!aclDataset) return error("aclDataset is empty");

  const updatedAcl = unstable_setAgentDefaultAccess(aclDataset, webId, access);

  if (!updatedAcl) return error("updatedAcl is empty");

  const response = await unstable_saveAclFor(dataset, updatedAcl, { fetch });
  if (!response) return error("response is empty");

  return respond(response);
}

export async function normalizePermissions(
  permissions: unstable_AgentAccess,
  fetch: typeof window.fetch,
  fetchProfileFn = fetchProfile
): Promise<NormalizedPermission[]> {
  return Promise.all(
    Object.keys(permissions)
      .filter(isUrl)
      .map(
        async (webId: string): Promise<NormalizedPermission> => {
          const acl = permissions[webId];
          const profile = await fetchProfileFn(webId, fetch);

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

  const mtime = getDecimal(dataset, namespace.mtime);
  const modified = getDatetime(dataset, namespace.modified);
  const size = getInteger(dataset, namespace.size);
  const contains = getIriAll(dataset, namespace.contains);
  const types = displayTypes(rawType);

  return {
    contains,
    iri,
    modified,
    mtime,
    size,
    types,
    dataset,
  };
}

export interface NormalizedResource {
  iri: string;
  types: string[];
  dataset?: Thing;
  mtime?: number | null;
  modified?: Date | null;
  size?: number | null;
  contains?: string[];
  permissions?: NormalizedPermission[];
}

export interface IResourceDetails extends NormalizedResource {
  name: string;
  defaultPermissions: NormalizedPermission[];
}

export const PERMISSIONS: string[] = ["read", "write", "append", "control"];

export function parseStringAcl(acl: string): unstable_Access {
  return PERMISSIONS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: acl.includes(key),
    }),
    {} as unstable_Access
  );
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

export async function fetchFileWithAcl(
  iri: string,
  fetch: typeof window.fetch
): Promise<NormalizedFile> {
  const file = await unstable_fetchFile(iri, { fetch });
  const {
    internal_resourceInfo: { permissions: filePermissions, contentType: type },
  } = file;

  const permissions = filePermissions
    ? [
        {
          webId: "user",
          alias: displayPermissions(filePermissions.user),
          profile: { webId: "user" },
          acl: filePermissions?.user as unstable_Access,
        } as NormalizedPermission,
        {
          webId: "public",
          alias: displayPermissions(filePermissions.public),
          profile: { webId: "public" },
          acl: filePermissions?.public as unstable_Access,
        } as NormalizedPermission,
      ]
    : [];
  const types = type ? [type] : [];

  return {
    iri,
    permissions,
    types,
    file,
  };
}

export async function fetchResourceWithAcl(
  iri: string,
  fetch: typeof window.fetch,
  normalizePermissionsFn = normalizePermissions
): Promise<NormalizedResource> {
  const resource = await unstable_fetchLitDatasetWithAcl(iri, { fetch });
  const acl = await unstable_getAgentAccessAll(resource);
  const permissions = acl
    ? await normalizePermissionsFn(acl, fetch)
    : undefined;
  const dataset = resource as LitDataset;
  const thing = dataset as Thing;

  return {
    permissions,
    ...normalizeDataset(thing, iri),
  };
}

export async function fetchResource(
  iri: string,
  normalizeDatasetFn = normalizeDataset,
  fetch: typeof window.fetch
): Promise<NormalizedResource> {
  const resource = await fetchLitDataset(iri, { fetch });
  const dataset = resource as LitDataset;
  const thing = dataset as Thing;

  return normalizeDatasetFn(thing, iri);
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
