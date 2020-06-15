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
  unstable_fetchLitDatasetWithAcl,
  unstable_getAgentAccessModesAll,
} from "lit-solid";
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

export const NON_RESOURCE_IRI_PATHS: string[] = ["favicon.ico", "robots.txt"];

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

  return { nickname, name, avatar };
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
  acl?: unstable_AgentAccess | null;
  permissions?: NormalizedPermission[];
}

export function isResourceIri(iri: string): boolean {
  return NON_RESOURCE_IRI_PATHS.every((path) => {
    const pattern = new RegExp(path);
    return !iri.match(pattern);
  });
}

export async function fetchResourceWithAcl(
  iri: string
): Promise<NormalizedResource> {
  if (!isResourceIri(iri)) {
    return Promise.resolve({ iri, name: "Unknown", types: ["Unknown"] });
  }

  const resource = await unstable_fetchLitDatasetWithAcl(iri);
  const acl = await unstable_getAgentAccessModesAll(
    resource as LitDataset & DatasetInfo & unstable_Acl
  );
  const permissions = acl ? await normalizePermissions(acl) : undefined;
  const dataset = resource as LitDataset;
  const thing = dataset as Thing;

  return {
    acl,
    permissions,
    ...normalizeDataset(thing, iri),
  };
}

export function getUserPermissions(
  id: string,
  permissions?: NormalizedPermission[]
): NormalizedPermission | null {
  if (!permissions) return null;

  const permission = permissions.find(({ webId }) => webId === id);

  return permission || null;
}

export function getThirdPartyPermissions(
  id: string,
  permissions?: NormalizedPermission[]
): NormalizedPermission[] {
  if (!permissions) return [];
  return permissions.filter(({ webId }) => webId !== id);
}
