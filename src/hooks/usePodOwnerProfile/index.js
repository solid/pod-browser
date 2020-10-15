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

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { joinPath } from "../../stringHelpers";
import useAuthenticatedProfile from "../useAuthenticatedProfile";
import usePodRootUri from "../usePodRootUri";
import useFetchProfile from "../useFetchProfile";

export default function usePodOwnerProfile() {
  const [profile, setProfile] = useState();
  const [error, setError] = useState();
  const router = useRouter();
  const decodedResourceUri = decodeURIComponent(router.query.iri);
  const podRoot = usePodRootUri(decodedResourceUri, null);
  const profileIri = podRoot && joinPath(podRoot, "profile/card#me"); // we won't need to do this once ownership is available
  const { data: authProfile, error: authError } = useAuthenticatedProfile();
  const { data: ownerProfile, error: ownerError } = useFetchProfile(profileIri);

  useEffect(() => {
    if (!router.query.iri && authProfile) {
      // we're not using the Navigator, so we'll use the authenticated user's profile
      setProfile(authProfile);
      setError(authError);
      return;
    }
    if (!router.query.iri) {
      // we haven't loaded the authenticated profile yet
      setProfile(null);
      setError(null);
      return;
    }
    const resourceIri = decodeURIComponent(router.query.iri);
    if (
      router.query.iri &&
      authProfile &&
      authProfile.pods.find((storage) => resourceIri.startsWith(storage))
    ) {
      // the authenticated user has noted the storage as theirs, so we assume we can list them as Pod owner
      setProfile(authProfile);
      setError(authError);
      return;
    }
    setProfile(ownerProfile);
    setError(ownerError);
  }, [router.query.iri, authProfile, authError, ownerProfile, ownerError]);

  return { profile, error };
}
