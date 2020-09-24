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
  createAcl,
  getSolidDatasetWithAcl,
  getResourceAcl,
  hasAccessibleAcl,
  hasResourceAcl,
  saveAclFor,
  setAgentDefaultAccess,
  setAgentResourceAccess,
  createAclFromFallbackAcl,
  hasFallbackAcl,
  getAgentAccessAll,
  getAgentDefaultAccessAll,
  getFallbackAcl,
  getSourceUrl,
  getSolidDataset,
} from "@inrupt/solid-client";
import { isUrl } from "../stringHelpers";
import { createResponder, chain, datasetIsContainer } from "./utils";
import { fetchProfile } from "./profile";

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

export const PERMISSIONS = ["read", "write", "append", "control"];

export function parseStringAcl(access) {
  return PERMISSIONS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: access.includes(key),
    }),
    {}
  );
}

export function defineAcl(dataset, webId, access = ACL.CONTROL.acl) {
  const aclDataset = chain(
    createAcl(dataset),
    (a) => setAgentResourceAccess(a, webId, access),
    (a) => setAgentDefaultAccess(a, webId, access)
  );

  return aclDataset;
}

export function aclToString(access) {
  return `read:${access.read},write:${access.write},append:${access.append},control:${access.control}`;
}

export function isEqualACL(aclA, aclB) {
  return aclToString(aclA) === aclToString(aclB);
}

export function displayPermissions(permissions) {
  const templatePermission = Object.values(ACL).find((template) => {
    const { acl } = template;
    return isEqualACL(permissions, acl);
  });

  if (templatePermission) return templatePermission.alias;

  return "Custom";
}

export function permissionsFromWacAllowHeaders(wacAllow) {
  if (!wacAllow) return [];
  const permissions = wacAllow.split(",");
  return permissions.reduce((acc, permission) => {
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
  }, []);
}

export function isUserOrMatch(webId, id) {
  return webId === "user" || webId === id;
}

export function getUserPermissions(id, permissions) {
  if (!permissions) return null;

  const permission = permissions.find(({ webId }) => isUserOrMatch(webId, id));

  return permission || null;
}

export function getThirdPartyPermissions(id, permissions) {
  if (!permissions) return [];
  return permissions.filter(({ webId }) => !isUserOrMatch(webId, id));
}

export async function saveAllPermissions(datasetWithAcl, webId, access, fetch) {
  const { respond, error } = createResponder();

  if (!hasAccessibleAcl(datasetWithAcl)) {
    return [null, error("dataset does not have accessible ACL")];
  }

  let aclDataset;
  if (hasResourceAcl(datasetWithAcl)) {
    aclDataset = getResourceAcl(datasetWithAcl);
  } else if (hasFallbackAcl(datasetWithAcl)) {
    aclDataset = createAclFromFallbackAcl(datasetWithAcl);
  } else {
    return [null, error("Unable to access default ACL")];
  }

  if (!aclDataset) return [null, error("aclDataset is empty")];

  const updatedAcl = chain(
    setAgentResourceAccess(aclDataset, webId, access),
    (acl) =>
      datasetIsContainer(datasetWithAcl)
        ? setAgentDefaultAccess(acl, webId, access) // will only apply default permissions if dataset is a container
        : acl
  );
  if (!updatedAcl) return [null, error("updatedAcl is empty")];

  const response = await saveAclFor(datasetWithAcl, updatedAcl, { fetch });
  if (!response) return [null, error("response is empty")];

  // TODO: Can optimize once saveAclFor returns the original dataset
  const dataset = await getSolidDataset(getSourceUrl(datasetWithAcl), {
    fetch,
  });
  if (!dataset) return [null, error("dataset is empty")];

  return [respond(dataset), null];
}

// export async function saveSpecificPermissions({ iri, webId, access, fetch }) {
//   const { respond, error } = createResponder();
//   const dataset = await getSolidDatasetWithAcl(iri, { fetch });
//
//   if (!dataset) return [null, error("dataset is empty")];
//
//   if (!hasAccessibleAcl(dataset)) {
//     return [null, error("dataset does not have accessible ACL")];
//   }
//
//   let aclDataset;
//   if (hasResourceAcl(dataset)) {
//     aclDataset = getResourceAcl(dataset);
//   } else if (hasFallbackAcl(dataset)) {
//     aclDataset = createAclFromFallbackAcl(dataset);
//   } else {
//     return [null, error("Unable to access default ACL")];
//   }
//
//   if (!aclDataset) return [null, error("aclDataset is empty")];
//
//   const updatedAcl = setAgentResourceAccess(aclDataset, webId, access);
//   if (!updatedAcl) return [null, error("updatedAcl is empty")];
//
//   const response = await saveAclFor(dataset, updatedAcl, { fetch });
//   if (!response) return [null, error("response is empty")];
//
//   return [respond(response), null];
// }
//
// export async function saveDefaultPermissions({ iri, webId, access, fetch }) {
//   const { respond, error } = createResponder();
//   const dataset = await getSolidDatasetWithAcl(iri, { fetch });
//   if (!dataset) return [null, error("dataset is empty")];
//
//   if (!hasResourceAcl(dataset)) {
//     return [null, error("dataset does not have resource ACL")];
//   }
//
//   if (!hasAccessibleAcl(dataset)) {
//     return [null, error("dataset does not have accessible ACL")];
//   }
//
//   const aclDataset = getResourceAcl(dataset);
//   if (!aclDataset) return [null, error("aclDataset is empty")];
//
//   const updatedAcl = setAgentDefaultAccess(aclDataset, webId, access);
//
//   if (!updatedAcl) return [null, error("updatedAcl is empty")];
//
//   const response = await saveAclFor(dataset, updatedAcl, { fetch });
//   if (!response) return [null, error("response is empty")];
//
//   return [respond(response), null];
// }

export async function normalizePermissions(
  permissions,
  fetch,
  fetchProfileFn = fetchProfile
) {
  return Promise.all(
    Object.keys(permissions)
      .filter(isUrl)
      .map(async (webId) => {
        const access = permissions[webId];
        const profile = await fetchProfileFn(webId, fetch);

        return {
          acl: access,
          profile,
          alias: displayPermissions(access),
          webId,
        };
      })
  );
}

export async function getPermissions(dataset, fetch) {
  const datasetWithAcl = await getSolidDatasetWithAcl(getSourceUrl(dataset), {
    fetch,
  });

  if (hasResourceAcl(datasetWithAcl)) {
    const accessModeList = getAgentAccessAll(datasetWithAcl);
    return normalizePermissions(accessModeList, fetch);
    // const resourceAcl = getResourceAcl(dataset);
    // const defaultAccessModeList = getAgentDefaultAccessAll(resourceAcl);
    // defaultPermissions = await normalizePermissions(
    //   defaultAccessModeList,
    //   fetch
    // );
    // return permissions;
  }
  if (hasAccessibleAcl(datasetWithAcl)) {
    const fallbackAcl = getFallbackAcl(datasetWithAcl);
    const accessModeList = getAgentDefaultAccessAll(fallbackAcl);
    return normalizePermissions(accessModeList, fetch);
  }
  throw new Error(`No access to ACL for ${getSourceUrl(dataset)}`);
}

export function createAccessMap(
  read = false,
  write = false,
  append = false,
  control = false
) {
  return {
    [ACL.READ.key]: read,
    [ACL.WRITE.key]: write,
    [ACL.APPEND.key]: append,
    [ACL.CONTROL.key]: control,
  };
}

export function isEmptyAccess(accessMap) {
  return Object.values(accessMap).reduce(
    (memo, access) => memo && !access,
    true
  );
}
