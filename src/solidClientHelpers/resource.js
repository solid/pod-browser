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
  createContainerAt,
  createSolidDataset,
  createThing,
  deleteFile,
  getSolidDataset,
  getThing,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { parseUrl } from "../stringHelpers";
import { getPolicyUrl } from "./policies";
import { createResponder, isContainerIri, isHTTPError } from "./utils";

export function getResourceName(iri) {
  let { pathname } = parseUrl(iri);
  if (isContainerIri(pathname)) {
    pathname = pathname.substring(0, pathname.length - 1);
  }
  const encodedURISegment =
    pathname.match(/(?!\/)(?:.(?!\/))+$/)?.toString() || "";
  return decodeURIComponent(encodedURISegment);
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

export async function getOrCreateContainer(iri, fetch) {
  const { respond, error } = createResponder();
  const { response, error: getError } = await getResource(iri, fetch);
  if (response) return respond(response.dataset);
  if (getError && isHTTPError(getError, 404)) {
    try {
      return respond(await createContainerAt(iri, { fetch }));
    } catch (err) {
      return error(err.message);
    }
  }
  return error(getError);
}

export async function getOrCreateDataset(iri, fetch) {
  const { respond, error } = createResponder();
  const { response, error: getError } = await getResource(iri, fetch);
  if (response) return respond(response.dataset);
  if (getError && isHTTPError(getError, 404)) {
    try {
      return respond(
        await saveSolidDatasetAt(iri, createSolidDataset(), { fetch })
      );
    } catch (saveError) {
      return error(saveError.message);
    }
  }
  return error(getError);
}

export function getOrCreateThing(dataset, iri) {
  const existing = getThing(dataset, iri);
  if (existing) {
    return { thing: existing, dataset };
  }
  const created = createThing({ url: iri });
  const updatedDataset = setThing(dataset, created);
  return { thing: created, dataset: updatedDataset };
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

export async function deleteResource(resource, policiesContainer, fetch) {
  const { dataset, iri } = resource;
  await deleteFile(iri, {
    fetch,
  });
  if (!policiesContainer) return;
  const policyUrl = getPolicyUrl(dataset, policiesContainer);
  try {
    if (!policyUrl) return;
    await deleteFile(policyUrl, { fetch });
  } catch (err) {
    if (!isHTTPError(err.message, 404) && !isHTTPError(err.message, 403)) {
      throw err;
    }
  }
}
