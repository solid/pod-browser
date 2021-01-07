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

import { isContainer } from "@inrupt/solid-client";

export function parseUrl(url) {
  const a = document.createElement("a");
  a.href = url;

  return {
    hash: a.hash,
    host: a.host,
    hostname: a.hostname,
    origin: a.origin,
    pathname: a.pathname,
    port: a.port,
    protocol: a.protocol,
    search: a.search,
  };
}

export function stripQueryParams(path) {
  return path.replace(/\?.+$/, "");
}

export function isUrl(string) {
  try {
    const url = new URL(string);
    return ["https:", "http:"].includes(url.protocol);
  } catch (_) {
    return false;
  }
}

export function joinPath(root, ...paths) {
  return [root.replace(/\/$/, ""), ...paths].join("/");
}

export function normalizeContainerUrl(url) {
  return joinPath(url, "");
}

export function getContainerUrl(url) {
  return url?.substring(0, url.lastIndexOf("/") + 1);
}

export function getParentContainerUrl(url) {
  const parts = url.split("/");
  return isContainer(url)
    ? parts.slice(0, -2).join("/").concat("/")
    : parts.slice(0, -1).join("/").concat("/");
}
