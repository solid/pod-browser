import {
  LitDataset,
  getIntegerOne,
  getThingOne,
  getIriAll,
  getIriOne,
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

export function getTypeName(rawType: string | null): string {
  if (!rawType) return "";
  return typeNameMap[rawType];
}

export interface NormalizedDataset {
  iri: string;
  type?: string | null;
  mtime?: number | null;
  modified?: Date | null;
  size?: number | null;
  contains?: string[];
}

export function normalizeDataset(
  dataset: LitDataset,
  iri: IriString
): NormalizedDataset {
  const thing = getThingOne(dataset, iri);
  const rawType = getIriOne(
    thing,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
  );

  // TODO use ldp namespace when available
  const mtime = getDecimalOne(thing, "http://www.w3.org/ns/posix/stat#mtime");
  const modified = getDatetimeOne(thing, "http://purl.org/dc/terms/modified");
  const size = getIntegerOne(thing, "http://www.w3.org/ns/posix/stat#size");
  const contains = getIriAll(thing, ldp.contains);
  const type = getTypeName(rawType) || rawType;

  return {
    iri,
    type,
    mtime,
    modified,
    size,
    contains,
  };
}
