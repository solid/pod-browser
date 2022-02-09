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

import { useEffect, useState } from "react";
import { getPodOwner } from "@inrupt/solid-client";
import { joinPath } from "../../stringHelpers";
import usePodRootUri from "../usePodRootUri";
import { isHTTPError } from "../../error";
import useResourceInfo from "../useResourceInfo";

function hackProfileUri(podRoot) {
  return podRoot ? joinPath(podRoot, "profile/card#me") : null;
}

export default function usePodOwner(resourceIri) {
  const [podOwnerWebId, setPodOwnerWebId] = useState(null);
  const [error, setError] = useState(null);
  const podRoot = usePodRootUri(resourceIri);
  const { data: resourceInfo, error: resourceError } =
    useResourceInfo(resourceIri);

  useEffect(() => {
    if (resourceIri && isHTTPError(resourceError, 403)) {
      setPodOwnerWebId(hackProfileUri(podRoot));
      setError(resourceError);
      return;
    }
    if (!resourceIri || resourceError) {
      setPodOwnerWebId(null);
      setError(resourceError);
      return;
    }
    setPodOwnerWebId(getPodOwner(resourceInfo) || hackProfileUri(podRoot));
    setError(null);
  }, [resourceIri, podRoot, resourceError, resourceInfo]);
  return { podOwnerWebId, error };
}
