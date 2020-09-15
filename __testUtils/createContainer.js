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
  addUrl,
  createSolidDataset,
  createThing,
  addDatetime,
  addDecimal,
  addInteger,
  setThing,
} from "@inrupt/solid-client";
import { rdf, ldp } from "rdf-namespaces";

export const TIMESTAMP = new Date(Date.UTC(2020, 5, 2, 15, 59, 21));

export default function createContainer(
  url = "https://user.dev.inrupt.net/",
  type = ldp.BasicContainer
) {
  const thing = createThing({ url });
  const publicContainer = [
    (t) => addUrl(t, rdf.type, type),
    (t) => addUrl(t, rdf.type, ldp.Container),
    (t) => addDatetime(t, "http://purl.org/dc/terms/modified", TIMESTAMP),
    (t) =>
      addDecimal(t, "http://www.w3.org/ns/posix/stat#mtime", 1591131561.195),
    (t) => addInteger(t, "http://www.w3.org/ns/posix/stat#size", 4096),
    (t) => addUrl(t, ldp.contains, "https://user.dev.inrupt.net/public/games/"),
  ].reduce((acc, fn) => fn(acc), thing);

  return setThing(createSolidDataset(), publicContainer);
}
