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
  unstable_fetchLitDatasetWithAcl,
  unstable_getResourceAcl,
  unstable_hasAccessibleAcl,
  unstable_hasResourceAcl,
  unstable_saveAclFor,
  unstable_setAgentDefaultAccess,
  unstable_setAgentResourceAccess,
} from "@inrupt/solid-client";
import { isUrl } from "../stringHelpers";
import { createResponder, chain } from "./utils";
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
    (a) => unstable_setAgentResourceAccess(a, webId, access),
    (a) => unstable_setAgentDefaultAccess(a, webId, access)
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

export async function savePermissions({ iri, webId, access, fetch }) {
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

export async function saveDefaultPermissions({ iri, webId, access, fetch }) {
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
