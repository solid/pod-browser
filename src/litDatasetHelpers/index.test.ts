import { ldp } from "rdf-namespaces";
import {
  createThing,
  addIri,
  setDatetime,
  setDecimal,
  setInteger,
  setThing,
  createLitDataset,
} from "lit-solid";
import { getTypeName, normalizeDataset } from "./index";

describe("getTypeName", () => {
  test("it returns the type display name", () => {
    Object.keys(ldp).forEach((key: string): void => {
      expect(getTypeName(ldp[key])).toEqual(key);
    });
  });

  test("it returns undefined when given an invalid type", () => {
    expect(getTypeName("invalid")).toBeUndefined();
  });
});

describe("normalizeDataset", () => {
  test("it returns a normalized dataset", () => {
    const containerIri = "https://user.dev.inrupt.net/public/";
    let publicContainer = createThing({ iri: containerIri });
    publicContainer = addIri(
      publicContainer,
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "http://www.w3.org/ns/ldp#BasicContainer"
    );
    publicContainer = addIri(
      publicContainer,
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "http://www.w3.org/ns/ldp#Container"
    );
    publicContainer = setDatetime(
      publicContainer,
      "http://purl.org/dc/terms/modified",
      new Date(Date.UTC(2020, 5, 2, 15, 59, 21))
    );
    publicContainer = addIri(
      publicContainer,
      "http://www.w3.org/ns/ldp#contains",
      "https://user.dev.inrupt.net/public/games/"
    );
    publicContainer = setDecimal(
      publicContainer,
      "http://www.w3.org/ns/posix/stat#mtime",
      1591131561.195
    );
    publicContainer = setInteger(
      publicContainer,
      "http://www.w3.org/ns/posix/stat#size",
      4096
    );
    let litDataset = createLitDataset();
    litDataset = setThing(litDataset, publicContainer);
    const { iri, type, mtime, modified, size, contains } = normalizeDataset(
      litDataset,
      containerIri
    );
    expect(iri).toEqual(containerIri);
    expect(type).toEqual("BasicContainer");
    expect(mtime).toEqual(1591131561.195);
    expect(modified).toEqual(new Date(Date.UTC(2020, 5, 2, 15, 59, 21)));
    expect(size).toEqual(4096);
    expect(contains).toContain("https://user.dev.inrupt.net/public/games/");
  });
});
