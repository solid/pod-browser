/* eslint-disable camelcase */
import { ldp } from "rdf-namespaces";
import * as litSolidFns from "lit-solid";
import {
  displayPermissions,
  displayTypes,
  getIriPath,
  getTypeName,
  normalizeDataset,
  normalizePermissions,
  fetchResource,
} from "./index";

const {
  addIri,
  createLitDataset,
  createThing,
  setDatetime,
  setDecimal,
  setInteger,
  setThing,
  unstable_fetchLitDatasetWithAcl,
} = litSolidFns;

const timestamp = new Date(Date.UTC(2020, 5, 2, 15, 59, 21));

function createResource(
  iri: string,
  type = "http://www.w3.org/ns/ldp#BasicContainer"
): litSolidFns.LitDataset {
  let publicContainer = createThing({ iri });

  publicContainer = addIri(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    type
  );

  publicContainer = addIri(
    publicContainer,
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "http://www.w3.org/ns/ldp#Container"
  );

  publicContainer = setDatetime(
    publicContainer,
    "http://purl.org/dc/terms/modified",
    timestamp
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

  return setThing(createLitDataset(), publicContainer);
}

describe("getTypeName", () => {
  test("it returns the type display name", () => {
    Object.keys(ldp).forEach((key: string): void => {
      expect(getTypeName(ldp[key])).toEqual(key);
    });
  });

  test("it returns the raw type when given an invalid type", () => {
    expect(getTypeName("invalid")).toEqual("invalid");
  });

  test("it returns an empty string if given a falsey value", () => {
    expect(getTypeName(undefined)).toEqual("");
  });
});

describe("normalizeDataset", () => {
  test("it returns a normalized dataset", () => {
    const containerIri = "https://user.dev.inrupt.net/public/";
    const litDataset = createResource(containerIri);
    const { iri, type, mtime, modified, size, contains } = normalizeDataset(
      litDataset,
      containerIri
    );
    expect(iri).toEqual(containerIri);
    expect(type).toContain("BasicContainer");
    expect(type).toContain("Container");
    expect(mtime).toEqual(1591131561.195);
    expect(modified).toEqual(new Date(Date.UTC(2020, 5, 2, 15, 59, 21)));
    expect(size).toEqual(4096);
    expect(contains).toContain("https://user.dev.inrupt.net/public/games/");
  });

  test("it uses full type if no human-friendly name found", () => {
    const containerIri = "https://user.dev.inrupt.net/public/";
    const litDataset = createResource(
      containerIri,
      "http://www.w3.org/ns/ldp#UnknownType"
    );
    const { type } = normalizeDataset(litDataset, containerIri);

    expect(type).toContain("http://www.w3.org/ns/ldp#UnknownType");
    expect(type).toContain("Container");
  });
});

describe("displayType", () => {
  test("it renders the human-friendly type name", () => {
    const type = displayType("http://www.w3.org/ns/ldp#BasicContainer");

    expect(type).toEqual("BasicContainer");
  });

  test("it returns an empty string if types are empty", () => {
    const type = displayType([]);

    expect(type).toEqual("");
  });

  test("it renders a list of human-friendly names when given a list", () => {
    const type = displayType([
      "http://www.w3.org/ns/ldp#BasicContainer",
      "http://www.w3.org/ns/ldp#Container",
    ]);

    expect(type).toContain("BasicContainer");
    expect(type).toContain("Container");
  });
});

describe("displayPermissions", () => {
  test("it returns 'Full Control' when all options are true", () => {
    const perms = displayPermissions({
      read: true,
      write: true,
      append: true,
      control: true,
    });

    expect(perms).toEqual("Full Control");
  });

  test("it returns 'No Access' when all options are false", () => {
    const perms = displayPermissions({
      read: false,
      write: false,
      append: false,
      control: false,
    });

    expect(perms).toEqual("No Access");
  });

  test("it returns 'Can Edit' when write permissions are true", () => {
    const perms = displayPermissions({
      read: true,
      write: true,
      append: true,
      control: false,
    });

    expect(perms).toEqual("Can Edit");
  });

  test("it returns 'Can View' when read permissions are true", () => {
    const perms = displayPermissions({
      read: true,
      write: false,
      append: false,
      control: false,
    });

    expect(perms).toEqual("Can View");
  });
});

describe("normalizePermissions", () => {
  test("it returns the webId and the human-friendly permission name", () => {
    const acl = {
      acl1: { read: true, write: false, control: false, append: false },
      acl2: { read: true, write: true, control: true, append: true },
      acl3: { read: true, write: true, control: false, append: true },
      acl4: { read: false, write: false, control: false, append: false },
    };

    const [perms1, perms2, perms3, perms4] = normalizePermissions(acl);

    expect(perms1.access).toEqual("Can View");
    expect(perms1.webId).toEqual("acl1");
    expect(perms2.access).toEqual("Full Control");
    expect(perms2.webId).toEqual("acl2");
    expect(perms3.access).toEqual("Can Edit");
    expect(perms3.webId).toEqual("acl3");
    expect(perms4.access).toEqual("No Access");
    expect(perms4.webId).toEqual("acl4");
  });
});

describe("getIriPath", () => {
  test("it extracts the pathname from the iri", () => {
    const path1 = getIriPath("https://user.dev.inrupt.net/public/");
    const path2 = getIriPath(
      "https://user.dev.inrupt.net/public/games/tictactoe/data.ttl"
    );

    expect(path1).toEqual("/public");
    expect(path2).toEqual("/public/games/tictactoe/data.ttl");
  });
});

describe("fetchResource", () => {
  test("it returns a normalized dataset", async () => {
    jest
      .spyOn(litSolidFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(async () => {
        return Promise.resolve(createResource());
      });

    jest
      .spyOn(litSolidFns, "unstable_getAgentAccessModesAll")
      .mockImplementationOnce(async () => {
        return Promise.resolve({
          owner: { read: true, write: true, append: true, control: true },
          collaborator: {
            read: true,
            write: false,
            append: true,
            control: false,
          },
        });
      });

    const expectedIri = "https://user.dev.inrupt.net/public/";
    const normalizedResource = await fetchResource(expectedIri);
    const { iri, contains, modified, mtime, size, type } = normalizedResource;

    expect(iri).toEqual(expectedIri);
    expect(contains).toBeInstanceOf(Array);
    expect(modified).toEqual(timestamp);
  });

  test("it filters known non-resource iris", async () => {
    const expectedIri = "https://user.dev.inrupt.net/public/favicon.ico";
    const { iri, type } = await fetchResource(expectedIri);

    expect(iri).toEqual("https://user.dev.inrupt.net/public/favicon.ico");
    expect(type).toEqual("ico");
  });
});
