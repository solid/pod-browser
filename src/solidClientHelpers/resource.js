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
  getSolidDataset,
  saveSolidDatasetAt,
  getFile,
  getSolidDatasetWithAcl,
  getAgentAccessAll,
} from "@inrupt/solid-client";
import camelCase from "camelcase";
import { parseUrl, isUrl, hasHash, stripHash } from "../stringHelpers";
import { createResponder, isContainerIri, normalizeDataset } from "./utils";
import { displayPermissions } from "./permissions";

export function labelOrUrl(url) {
  if (hasHash(url)) {
    const { hash } = parseUrl(url);
    const label = camelCase(stripHash(hash));
    return label === "this" ? "root" : label;
  }
  return url;
}

export function getResourceName(iri) {
  let { pathname } = parseUrl(iri);
  if (isContainerIri(pathname)) {
    pathname = pathname.substring(0, pathname.length - 1);
  }
  const encodedURISegment =
    pathname.match(/(?!\/)(?:.(?!\/))+$/)?.toString() || "";
  return decodeURIComponent(encodedURISegment);
}

export function normalizePermissions(permissions) {
  if (!permissions) return [];

  return Object.keys(permissions)
    .filter(isUrl)
    .map((webId) => {
      const acl = permissions[webId];
      const alias = displayPermissions(acl);

      return { acl, alias, webId };
    });
}

export async function getResource(iri, fetch) {
  const { respond, error } = createResponder();

  try {
    const dataset = await getSolidDataset(iri, { fetch });
    const resource = { dataset, iri };

    return respond(resource);
  } catch (e) {
    return error(e.message);
  }
}

export async function getResourceWithPermissions(iri, fetch) {
  const { respond, error } = createResponder();

  try {
    const dataset = await getSolidDatasetWithAcl(iri, { fetch });
    const access = getAgentAccessAll(dataset);
    const permissions = normalizePermissions(access);

    return respond({ dataset, iri, permissions });
  } catch (e) {
    return error(e.message);
  }
}

export async function fetchFileWithAcl(iri, fetch) {
  const file = await getFile(iri, { fetch });
  const {
    internal_resourceInfo: { permissions: filePermissions, contentType: type },
  } = file;

  const permissions = filePermissions
    ? [
        {
          webId: "user",
          alias: displayPermissions(filePermissions.user),
          profile: { webId: "user" },
          acl: filePermissions?.user,
        },
        {
          webId: "public",
          alias: displayPermissions(filePermissions.public),
          profile: { webId: "public" },
          acl: filePermissions?.public,
        },
      ]
    : [];
  const types = type ? [type] : [];

  return {
    iri,
    permissions,
    types,
    file,
  };
}

export async function fetchResourceWithAcl(
  iri,
  fetch,
  normalizePermissionsFn = normalizePermissions
) {
  const dataset = await getSolidDatasetWithAcl(iri, { fetch });
  const access = getAgentAccessAll(dataset);
  const permissions = access
    ? await normalizePermissionsFn(access, fetch)
    : undefined;

  return {
    permissions,
    ...normalizeDataset(dataset, iri),
  };
}

export async function saveResource({ dataset, iri }, fetch) {
  const { respond, error } = createResponder();
  try {
    const response = await saveSolidDatasetAt(iri, dataset, { fetch });
    return respond(response);
  } catch (e) {
    return error(e.message);
  }
}
