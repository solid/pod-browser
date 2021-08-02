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

import { useEffect } from "react";
import { useRouter } from "next/router";

import { useSession } from "@inrupt/solid-ui-react";
import { useRedirectIfLoggedOut } from "../../../src/effects/auth";

import { resourceHref } from "../../../src/navigator";
import usePodIrisFromWebId from "../../../src/hooks/usePodIrisFromWebId";
import usePreviousPage from "../../../src/hooks/usePreviousPage";

export default function Home() {
  const router = useRouter();
  const previousPage = usePreviousPage();
  useRedirectIfLoggedOut(previousPage);

  const { session } = useSession();
  const { webId = "" } = session.info;
  const { data: podIris = [] } = usePodIrisFromWebId(webId);
  const [podIri] = podIris;

  useEffect(() => {
    if (previousPage) {
      router.push(previousPage);
    } else if (podIri) {
      router.replace("/resource/[iri]", resourceHref(podIri)).catch((e) => {
        throw e;
      });
    }
  }, [podIri, router, previousPage]);

  return null;
}
