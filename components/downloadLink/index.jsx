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

/* eslint-disable react/jsx-props-no-spreading */

import React from "react";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import { parseUrl } from "../../src/stringHelpers";
import { isContainerIri } from "../../src/solidClientHelpers/utils";

export function forceDownload(name, file) {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = window.URL.createObjectURL(file);
  a.setAttribute("download", name);

  document.body.appendChild(a);

  a.click();

  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

export function downloadResource(iri, fetch) {
  return () => {
    const { pathname } = parseUrl(iri);
    const name = pathname.replace(/\//g, "");

    fetch(iri)
      .then((response) => response.blob())
      .then((file) => forceDownload(name, file))
      .catch((e) => e);
  };
}

export default function DownloadLink({ iri, ...props }) {
  const { fetch } = useSession();

  if (isContainerIri(iri)) return null;

  return (
    <button {...props} onClick={downloadResource(iri, fetch)} type="button" />
  );
}

DownloadLink.propTypes = {
  iri: T.string.isRequired,
  className: T.string,
};

DownloadLink.defaultProps = {
  className: null,
};
