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

import React from "react";
import { useRouter } from "next/router";
import { DetailsMenuProvider } from "../../../src/contexts/detailsMenuContext";
import {
  useRedirectIfLoggedOut,
  useRedirectIfNoControlAccessToOwnPod,
} from "../../../src/effects/auth";
import ContainerView from "../../container";
import { PodLocationProvider } from "../../../src/contexts/podLocationContext";

export default function Resource() {
  useRedirectIfLoggedOut();
  const router = useRouter();
  useRedirectIfNoControlAccessToOwnPod(router.query.iri);
  const decodedIri = decodeURIComponent(router.query.iri);

  return (
    <PodLocationProvider currentUri={decodedIri}>
      <DetailsMenuProvider>
        <ContainerView iri={decodedIri} />
      </DetailsMenuProvider>
    </PodLocationProvider>
  );
}
