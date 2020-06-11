/* eslint-disable camelcase */
import { ldp } from "rdf-namespaces";
import {
  addIri,
  createLitDataset,
  createThing,
  LitDataset,
  setDatetime,
  setDecimal,
  setInteger,
  setThing,
} from "lit-solid";
import {
  getTypeName,
  normalizeDataset,
  displayType,
  normalizeAcl,
  extractPermissions,
} from "./index";

function createContainer(
  iri: string,
  type = "http://www.w3.org/ns/ldp#BasicContainer"
): LitDataset {
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

  return setThing(createLitDataset(), publicContainer);
}

const defaultAcl = {
  read: true,
  write: true,
  control: true,
  append: true,
};

const noAccess = {
  read: false,
  write: false,
  control: false,
  append: false,
};

function createAcl(
  user: Record<string, boolean> = defaultAcl,
  publicAcl: Record<string, boolean> = noAccess
): Record<string, string | Record<string, unknown>> {
  return {
    quads: {},
    datasetInfo: {
      fetchedFrom: "https://dayton.dev.inrupt.net/public/.acl",
      unstable_aclIri: "https://dayton.dev.inrupt.net/public/.acl.acl",
      unstable_permissions: {
        user,
        public: publicAcl,
      },
    },
    accessTo: "https://dayton.dev.inrupt.net/public/",
  };
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
    const litDataset = createContainer(containerIri);
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
    const litDataset = createContainer(
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
});

describe("normalizeAcl", () => {
  test("it normalizes the resource ACL", () => {
    const acl = {
      fallbackAcl: createAcl(),
      resourceAcl: createAcl(
        {
          read: true,
          write: false,
          append: false,
          control: true,
        },
        {
          read: false,
          write: true,
          append: true,
          control: false,
        }
      ),
    };

    const { user, public: publicPermissions } = normalizeAcl(acl);

    expect(user.read).toBe(true);
    expect(user.write).toBe(false);
    expect(user.append).toBe(false);
    expect(user.control).toBe(true);

    expect(publicPermissions.read).toBe(false);
    expect(publicPermissions.write).toBe(true);
    expect(publicPermissions.append).toBe(true);
    expect(publicPermissions.control).toBe(false);
  });
});

describe("extractPermissions", () => {
  test("it returns the acl permissions", () => {
    const acl = createAcl();
    const permissions = extractPermissions(acl);
    const { user, public: publicPermissions } = permissions;

    expect(user.read).toBe(true);
    expect(user.write).toBe(true);
    expect(user.append).toBe(true);
    expect(user.control).toBe(true);

    expect(publicPermissions.read).toBe(false);
    expect(publicPermissions.write).toBe(false);
    expect(publicPermissions.append).toBe(false);
    expect(publicPermissions.control).toBe(false);
  });
});
