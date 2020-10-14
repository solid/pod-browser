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
