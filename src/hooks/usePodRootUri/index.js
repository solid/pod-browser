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
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import useResourceInfo from "../useResourceInfo";
import useDataset from "../useDataset";

function normalizeBaseUri(baseUri) {
  return baseUri[baseUri.length - 1] === "/" ? baseUri : `${baseUri}/`;
}

export default function usePodRootUri(location) {
  const [rootUri, setRootUri] = useState(null);
  const profile = useAuthenticatedProfile();
  const { data: resourceInfo } = useResourceInfo(location, {
    errorRetryCount: 0, // This usually returns a 403 when visiting someone else's Pod, so we don't want to retry that call
  });
  const [podOwnerUri] = useState(null);
  const { data: podOwnerDataset, error: podOwnerError } =
    useDataset(podOwnerUri);

  useEffect(() => {
    if (!location || location === "undefined" || !profile) {
      setRootUri(null);
      return;
    }
    // defaulting to first pod until we have UI for multiple pods

    if (profile.pods[0]) {
      setRootUri(normalizeBaseUri(profile.pods[0]));
    }
  }, [location, podOwnerDataset, podOwnerError, profile, resourceInfo]);

  return rootUri;
}
