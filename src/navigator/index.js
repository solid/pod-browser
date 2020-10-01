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

import { getResourceInfo, getSourceUrl } from "@inrupt/solid-client";
import { isContainerIri } from "../solidClientHelpers/utils";
import { DETAILS_CONTEXT_ACTIONS } from "../contexts/detailsMenuContext";

export function resourceHref(iri) {
  return `/resource/${encodeURIComponent(iri)}`;
}

export const urlForResourceAction = (action, resourceIri, containerIri) => ({
  pathname: containerIri ? resourceHref(containerIri) : "/resource/[iri]",
  ...(action
    ? {
        query: {
          action,
          resourceIri,
        },
      }
    : {}),
});

export function resourceContextRedirect(
  action,
  resourceIri,
  containerIri,
  router
) {
  return router.replace(
    urlForResourceAction(action, resourceIri, undefined),
    urlForResourceAction(action, resourceIri, containerIri)
  );
}

export async function urlRedirect(url, router, { fetch }) {
  try {
    const resourceInfo = await getResourceInfo(url, { fetch });
    const resourceSourceUrl = getSourceUrl(resourceInfo);
    if (isContainerIri(resourceSourceUrl)) {
      await router.replace("/resource/[iri]", resourceHref(resourceSourceUrl));
      return true;
    }
    const parentUrlParts = resourceSourceUrl.split("/");
    const parentUrl = `${parentUrlParts
      .slice(0, parentUrlParts.length - 1)
      .join("/")}/`;
    const parentResourceInfo = await getResourceInfo(parentUrl, { fetch });
    const parentSourceUrl = getSourceUrl(parentResourceInfo);
    await router.replace(
      {
        pathname: "/resource/[iri]",
        query: {
          action: DETAILS_CONTEXT_ACTIONS.DETAILS,
          resourceIri: resourceSourceUrl,
        },
      },
      resourceHref(parentSourceUrl)
    );
    return true;
  } catch (err) {
    await router.replace("/access-required");
  }
  return false;
}
