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
  createSolidDataset,
  getSolidDataset,
  saveSolidDatasetAt,
  solidDatasetAsMarkdown,
} from "@inrupt/solid-client";
import { ERROR_CODES, isHTTPError } from "../../error";
import { chain } from "../../solidClientHelpers/utils";

/*
 * Datasets refer to SolidDataset from @inrupt/solid-client.
 * This module adds some extra custom, handy functions.
 */

/* Model functions */
export async function getOrCreateDataset(url, fetch) {
  try {
    return await getSolidDataset(url, { fetch });
  } catch (error) {
    if (isHTTPError(error, ERROR_CODES.NOT_FOUND)) return createSolidDataset();
    throw error;
  }
}

export async function updateOrCreateDataset(url, fetch, ...operations) {
  const dataset = await getOrCreateDataset(url, fetch);
  return saveSolidDatasetAt(url, chain(dataset, ...operations), { fetch });
}

export function compareDataset(a, b) {
  // TODO: Write away after datasets can be compared "out of the box"
  if (typeof a === "undefined") {
    return typeof b === "undefined";
  }
  if (typeof b === "undefined") {
    return typeof a === "undefined";
  }
  if (a === null || b === null) {
    return a === b;
  }
  return solidDatasetAsMarkdown(a) === solidDatasetAsMarkdown(b);
}
