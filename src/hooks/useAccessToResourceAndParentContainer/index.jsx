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

import { getEffectiveAccess, getResourceInfo } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { isContainerIri } from "../../solidClientHelpers/utils";
import { getParentContainerUrl } from "../../stringHelpers";

export default function useAccessToResourceAndParentContainer(iri) {
  const { sessionRequestInProgress, session } = useSession();
  const [accessToParentContainer, setAccessToParentContainer] = useState(null);
  const [accessToResource, setAccessToResource] = useState(null);

  useEffect(() => {
    if (sessionRequestInProgress || isContainerIri(iri)) return;
    (async () => {
      const parentContainerUrl = getParentContainerUrl(iri);
      try {
        const resourceInfoParentContainer = await getResourceInfo(
          parentContainerUrl,
          {
            fetch: session.fetch,
          }
        );
        const { user } = getEffectiveAccess(resourceInfoParentContainer);
        setAccessToParentContainer(user);
      } catch (e) {
        setAccessToParentContainer(null);
      }

      try {
        const resourceInfo = await getResourceInfo(iri, {
          fetch: session.fetch,
        });

        const { user } = getEffectiveAccess(resourceInfo);
        setAccessToResource(user);
      } catch (e) {
        setAccessToResource(null);
      }
    })();
  }, [iri, session, sessionRequestInProgress]);

  return { accessToParentContainer, accessToResource };
}
