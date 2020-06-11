import {
  LitDataset,
  getIntegerOne,
  getThingOne,
  getIriAll,
  IriString,
  getDecimalOne,
  getDatetimeOne,
} from "lit-solid";
import { ldp } from "rdf-namespaces";

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

export function getTypeName(rawType: string): string {
  if (!rawType) return "";
  return typeNameMap[rawType] || rawType;
}

export function displayType(type: string | string[]): string | string[] {
  if (Array.isArray(type)) {
    return type.map((t: string): string => getTypeName(t));
  }

  return getTypeName(type);
}

interface normalizeAclProps {
  resourceAcl?: LitDataset;
  fallbackAcl: LitDataset;
}

interface normalizedAcl {
  user: Record<string, boolean>;
  public: Record<string, boolean>;
}

export function extractPermissions(acl: LitDataset): normalizedAcl {
  const {
    datasetInfo: {
      unstable_permissions: { user, public: publicPermissions },
    },
  } = acl;
  return { user, public: publicPermissions };
}

export function normalizeAcl({
  resourceAcl,
  fallbackAcl,
}: normalizeAclProps): normalizedAcl {
  const resourcePerms = resourceAcl ? extractPermissions(resourceAcl) : {};
  const fallbackPerms = extractPermissions(fallbackAcl);

  return {
    ...fallbackPerms,
    ...resourcePerms,
  };
}

export interface NormalizedDataset {
  iri: string;
  type?: string | string[] | null;
  mtime?: number | null;
  modified?: Date | null;
  size?: number | null;
  contains?: string[];
  acl?: Record<string, unknown> | undefined;
}

export function normalizeDataset(
  dataset: LitDataset,
  iri: IriString
): NormalizedDataset {
  const thing = getThingOne(dataset, iri);
  const rawType = getIriAll(
    thing,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );

  // TODO use ldp namespace when available
  const mtime = getDecimalOne(thing, "http://www.w3.org/ns/posix/stat#mtime");
  const modified = getDatetimeOne(thing, "http://purl.org/dc/terms/modified");
  const size = getIntegerOne(thing, "http://www.w3.org/ns/posix/stat#size");
  const contains = getIriAll(thing, ldp.contains);
  const type = displayType(rawType);

  return {
    contains,
    iri,
    modified,
    mtime,
    size,
    type,
  };
}
