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
  ACL,
  aclToString,
  createAccessMap,
  displayPermissions,
  isEmptyAccess,
  isEqualACL,
} from "./permissions";

describe("aclToString", () => {
  test("it converts the acl to a standardized string", () => {
    const access = createAccessMap(true, true, true, true);

    expect(aclToString(access)).toEqual(
      "read:true,write:true,append:true,control:true"
    );
  });
});

describe("isEqualACL", () => {
  test("it returns true when acls are identical", () => {
    const access = createAccessMap(true, true, true, true);

    expect(isEqualACL(access, access)).toEqual(true);
  });

  test("it returns false when acls are NOT identical", () => {
    const aclA = createAccessMap(true, true, true, true);
    const aclB = createAccessMap(true, true, true, false);

    expect(isEqualACL(aclA, aclB)).toEqual(false);
  });
});

describe("displayPermissions", () => {
  test("it returns the CONTROL alias when all options are true", () => {
    const perms = displayPermissions(createAccessMap(true, true, true, true));

    expect(perms).toEqual(ACL.CONTROL.alias);
  });

  test("it returns the NONE alias when all options are false", () => {
    const perms = displayPermissions(
      createAccessMap(false, false, false, false)
    );

    expect(perms).toEqual(ACL.NONE.alias);
  });

  test("it returns the APPEND alias when append permissions are true and edit is false", () => {
    const perms = displayPermissions(createAccessMap(true, false, true, false));

    expect(perms).toEqual(ACL.APPEND.alias);
  });

  test("it returns the WRITE alias when write permissions are true", () => {
    const perms = displayPermissions(createAccessMap(true, true, true, false));

    expect(perms).toEqual(ACL.WRITE.alias);
  });

  test("it returns the READ alias when read permissions are true", () => {
    const perms = displayPermissions(
      createAccessMap(true, false, false, false)
    );

    expect(perms).toEqual(ACL.READ.alias);
  });

  test("it returns 'Custom' when the permissions don't follow a template", () => {
    const perms = displayPermissions(
      createAccessMap(false, true, false, false)
    );

    expect(perms).toEqual("Custom");
  });
});

describe("createAccessMap", () => {
  it("returns an object with all permissions set to false by default", () =>
    expect(createAccessMap()).toEqual({
      [ACL.READ.key]: false,
      [ACL.WRITE.key]: false,
      [ACL.APPEND.key]: false,
      [ACL.CONTROL.key]: false,
    }));

  it("sets read key first", () =>
    expect(createAccessMap(true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: false,
      [ACL.APPEND.key]: false,
      [ACL.CONTROL.key]: false,
    }));

  it("sets write key second", () =>
    expect(createAccessMap(true, true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: true,
      [ACL.APPEND.key]: false,
      [ACL.CONTROL.key]: false,
    }));

  it("sets append key second", () =>
    expect(createAccessMap(true, true, true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: true,
      [ACL.APPEND.key]: true,
      [ACL.CONTROL.key]: false,
    }));

  it("sets control key second", () =>
    expect(createAccessMap(true, true, true, true)).toEqual({
      [ACL.READ.key]: true,
      [ACL.WRITE.key]: true,
      [ACL.APPEND.key]: true,
      [ACL.CONTROL.key]: true,
    }));
});

describe("isEmptyAccess", () => {
  it("returns true on empty access maps", () => {
    expect(isEmptyAccess(createAccessMap())).toBe(true);
    expect(isEmptyAccess(createAccessMap(true))).toBe(false);
    expect(isEmptyAccess(createAccessMap(false, true))).toBe(false);
    expect(isEmptyAccess(createAccessMap(false, false, true))).toBe(false);
    expect(isEmptyAccess(createAccessMap(false, false, false, true))).toBe(
      false
    );
  });
});
