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

import {
  AUTHENTICATED_AGENT_PREDICATE,
  AUTHENTICATED_AGENT_TYPE,
} from "../../src/models/contact/authenticated";
import {
  PUBLIC_AGENT_PREDICATE,
  PUBLIC_AGENT_TYPE,
} from "../../src/models/contact/public";

export function filterAgentPermissions(permissions) {
  return permissions.filter((p) => p.type === "agent");
}

export function filterPermissionsByAlias(permissions, alias) {
  return permissions?.filter((permission) => permission.alias === alias) || [];
}

export function filterPermissionsByType(permissions, type) {
  return permissions?.filter((permission) => permission.type === type) || [];
}

export function isPublicAgentorAuthenticatedAgentType(type) {
  return type === PUBLIC_AGENT_TYPE || type === AUTHENTICATED_AGENT_TYPE;
}

export function filterPublicPermissions(permissions) {
  return permissions.filter((p) =>
    isPublicAgentorAuthenticatedAgentType(p.type)
  );
}

export function isPublicAgentorAuthenticatedAgentWebId(webId) {
  return (
    webId === PUBLIC_AGENT_PREDICATE || webId === AUTHENTICATED_AGENT_PREDICATE
  );
}

export function sortByAgentName(permissions) {
  return permissions.sort((a, b) => {
    return a.profile?.name?.localeCompare(b.profile?.name);
  });
}

export function preparePermissionsDataForTable(data) {
  const publicAndAuthPermissions = data?.filter((p) =>
    isPublicAgentorAuthenticatedAgentType(p.type)
  );
  const permissionsFilteredByType = filterPermissionsByType(data, "agent");
  const permissionsSortedByName = sortByAgentName(permissionsFilteredByType);
  return publicAndAuthPermissions.concat(permissionsSortedByName);
}
