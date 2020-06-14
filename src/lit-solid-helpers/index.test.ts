/* eslint-disable camelcase */
import { ldp } from "rdf-namespaces";
import * as litSolidFns from "lit-solid";
import {
  displayPermissions,
  displayTypes,
  fetchResourceWithAcl,
  getIriPath,
  getThirdPartyPermissions,
  getTypeName,
  getUserPermissions,
  isResourceIri,
  namespace,
  NON_RESOURCE_IRI_PATHS,
  normalizeDataset,
  normalizePermissions,
} from "./index";

const {
  addIri,
  createLitDataset,
  createThing,
  setDatetime,
  setDecimal,
  setInteger,
  setThing,
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

describe("namespace", () => {
  test("it reflects all the keys and values", () => {
    Object.keys(namespace).forEach((key) => {
      const value = namespace[key];
      expect(value).not.toBeUndefined();
      expect(namespace[value]).toEqual(key);
    });
  });

  test("it contains all the definitions in ldp", () => {
    const ldpWithType: Record<string, string> = ldp;
    Object.keys(ldpWithType).forEach((key) => {
      const value = namespace[key];
      const expectedValue = ldpWithType[key];

      expect(value).toEqual(expectedValue);
    });
  });
});

describe("getTypeName", () => {
  test("it returns the type display name", () => {
    const ldpWithType: Record<string, string> = ldp;

    Object.keys(ldpWithType).forEach((key: string): void => {
      expect(getTypeName(ldpWithType[key])).toEqual(key);
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
    const { iri, types, mtime, modified, size, contains } = normalizeDataset(
      litDataset,
      containerIri
    );
    expect(iri).toEqual(containerIri);
    expect(types).toContain("BasicContainer");
    expect(types).toContain("Container");
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
    const { types } = normalizeDataset(litDataset, containerIri);

    expect(types).toContain("http://www.w3.org/ns/ldp#UnknownType");
    expect(types).toContain("Container");
  });
});

describe("displayTypes", () => {
  test("it returns a list of the human-friendly type names", () => {
    const types = displayTypes([
      "http://www.w3.org/ns/ldp#BasicContainer",
      "http://www.w3.org/ns/ldp#Container",
    ]);

    expect(types).toContain("BasicContainer");
    expect(types).toContain("Container");
  });

  test("it returns an empty Array if types are empty", () => {
    const types = displayTypes([]);
    expect(types).toHaveLength(0);
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

    expect(perms1.webId).toEqual("acl1");
    expect(perms1.alias).toEqual("Can View");
    expect(perms1.acl).toMatchObject(acl.acl1);

    expect(perms2.webId).toEqual("acl2");
    expect(perms2.alias).toEqual("Full Control");
    expect(perms2.acl).toMatchObject(acl.acl2);

    expect(perms3.webId).toEqual("acl3");
    expect(perms3.alias).toEqual("Can Edit");
    expect(perms3.acl).toMatchObject(acl.acl3);

    expect(perms4.webId).toEqual("acl4");
    expect(perms4.alias).toEqual("No Access");
    expect(perms4.acl).toMatchObject(acl.acl4);
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

describe("isResourceIri", () => {
  test("it returns true when the url is not in the blacklist", () => {
    const iri = "https://user.dev.inrupt.net/public/";

    expect(isResourceIri(iri)).toBe(true);
  });

  test("it returns false when the url is in the blacklist", () => {
    NON_RESOURCE_IRI_PATHS.forEach((path) => {
      const iri = `https://user.dev.inrupt.net/${path}`;

      expect(isResourceIri(iri)).toBe(false);
    });
  });
});

describe("fetchResourceWithAcl", () => {
  test("it returns a normalized dataset", async () => {
    const perms = {
      owner: { read: true, write: true, append: true, control: true },
      collaborator: {
        read: true,
        write: false,
        append: true,
        control: false,
      },
    };
    const expectedIri = "https://user.dev.inrupt.net/public/";

    jest
      .spyOn(litSolidFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(async () => {
        return Promise.resolve(createResource());
      });

    jest
      .spyOn(litSolidFns, "unstable_getAgentAccessModesAll")
      .mockImplementationOnce(async () => {
        return Promise.resolve(perms);
      });

    const normalizedResource = await fetchResourceWithAcl(expectedIri);
    const {
      iri,
      contains,
      modified,
      mtime,
      size,
      types,
      permissions,
    } = normalizedResource;
    const ownerPerms = permissions[0];
    const collaboratorPerms = permissions[1];

    expect(iri).toEqual(expectedIri);
    expect(contains).toBeInstanceOf(Array);
    expect(modified).toEqual(timestamp);
    expect(mtime).toEqual(1591131561.195);
    expect(size).toEqual(4096);
    expect(types).toContain("Container");
    expect(types).toContain("BasicContainer");

    expect(ownerPerms.webId).toEqual("owner");
    expect(ownerPerms.alias).toEqual("Full Control");
    expect(ownerPerms.acl).toMatchObject(perms.owner);

    expect(collaboratorPerms.webId).toEqual("collaborator");
    expect(collaboratorPerms.alias).toEqual("Can View");
    expect(collaboratorPerms.acl).toMatchObject(perms.collaborator);
  });

  test("it returns no permissions when acl is not returned", async () => {
    jest
      .spyOn(litSolidFns, "unstable_fetchLitDatasetWithAcl")
      .mockImplementationOnce(async () => {
        return Promise.resolve(createResource());
      });

    jest
      .spyOn(litSolidFns, "unstable_getAgentAccessModesAll")
      .mockImplementationOnce(async () => {
        return Promise.resolve(undefined);
      });

    const { permissions, acl } = await fetchResourceWithAcl(
      "https://user.dev.inrupt.net/public/"
    );

    expect(permissions).toBeUndefined();
    expect(acl).toBeUndefined();
  });

  test("it filters known non-resource iris", async () => {
    const expectedIri = "https://user.dev.inrupt.net/public/favicon.ico";
    const { iri, types } = await fetchResourceWithAcl(expectedIri);

    expect(iri).toEqual("https://user.dev.inrupt.net/public/favicon.ico");
    expect(types).toContain("Unknown");
    expect(types).toHaveLength(1);
  });
});

describe("getUserPermissions", () => {
  test("it returns the permissions for the given webId", () => {
    const acl = {
      acl1: { read: true, write: false, control: false, append: false },
      acl2: { read: true, write: true, control: true, append: true },
      acl3: { read: true, write: true, control: false, append: true },
      acl4: { read: false, write: false, control: false, append: false },
    };

    const normalizedPermissions = normalizePermissions(acl);
    const permissions = getUserPermissions("acl1", normalizedPermissions);

    expect(permissions.webId).toEqual("acl1");
    expect(permissions.alias).toEqual("Can View");
    expect(permissions.acl).toMatchObject(acl.acl1);
  });
});

describe("getThirdPartyPermissions", () => {
  test("it returns the permissions that don't belong to the given webId", () => {
    const acl = {
      acl1: { read: true, write: false, control: false, append: false },
      acl2: { read: true, write: true, control: true, append: true },
      acl3: { read: true, write: true, control: false, append: true },
      acl4: { read: false, write: false, control: false, append: false },
    };

    const normalizedPermissions = normalizePermissions(acl);
    const thirdPartyPermissions = getThirdPartyPermissions(
      "acl1",
      normalizedPermissions
    );
    const [perms2, perms3, perms4] = thirdPartyPermissions;

    expect(thirdPartyPermissions.map(({ webId }) => webId)).not.toContain(
      "acl1"
    );

    expect(perms2.webId).toEqual("acl2");
    expect(perms2.alias).toEqual("Full Control");
    expect(perms2.acl).toMatchObject(acl.acl2);

    expect(perms3.webId).toEqual("acl3");
    expect(perms3.alias).toEqual("Can Edit");
    expect(perms3.acl).toMatchObject(acl.acl3);

    expect(perms4.webId).toEqual("acl4");
    expect(perms4.alias).toEqual("No Access");
    expect(perms4.acl).toMatchObject(acl.acl4);
  });
});
