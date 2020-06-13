/* eslint-disable camelcase */
import {
  LitDataset,
  getIntegerOne,
  getIriAll,
  IriString,
  getDecimalOne,
  getDatetimeOne,
  unstable_AccessModes,
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

export function getIriPath(iri: string): string | undefined {
  const { pathname } = parseUrl(iri);
  return pathname.replace(/\/?$/, "");
}

export function getTypeName(rawType: string): string {
  if (!rawType) return "";
  return typeNameMap[rawType] || rawType;
}

export function displayTypes(types: string[]): string[] {
  return types.length ? types.map((t: string): string => getTypeName(t)) : [];
}

export function displayPermissions(permissions: unstable_AccessModes): string {
  const perms = Object.values(permissions);
  if (perms.every((p) => p)) return "Full Control";
  if (perms.every((p) => !p)) return "No Access";
  if (permissions.write) return "Can Edit";
  return "Can View";
}

export function normalizePermissions(permissions: unstable_AgentAccess) {
  return Object.keys(permissions).map((webId) => {
    return {
      webId,
      access: displayPermissions(permissions[webId]),
    };
  });
}

export interface NormalizedResource {
  iri: string;
  types?: string[] | null;
  mtime?: number | null;
  modified?: Date | null;
  size?: number | null;
  contains?: string[];
  acl?: unstable_AgentAccess | null;
}

export function normalizeDataset(
  dataset: LitDataset,
  iri: IriString
): NormalizedResource {
  const rawType = getIriAll(
    dataset,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );

  // TODO use ldp namespace when available
  const mtime = getDecimalOne(dataset, "http://www.w3.org/ns/posix/stat#mtime");
  const modified = getDatetimeOne(dataset, "http://purl.org/dc/terms/modified");
  const size = getIntegerOne(dataset, "http://www.w3.org/ns/posix/stat#size");
  const contains = getIriAll(dataset, ldp.contains);
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

export async function fetchResource(iri: string): Promise<NormalizedResource> {
  const nonRdfIri = iri.match(/(ico|txt)$/);
  if (nonRdfIri) {
    return Promise.resolve({ iri, name: nonRdfIri[1], types: ["Unknown"] });
  }

  const resource = await unstable_fetchLitDatasetWithAcl(iri);
  const acl = await unstable_getAgentAccessModesAll(resource);

  return {
    acl,
    ...normalizeDataset(resource, iri),
  };
}
