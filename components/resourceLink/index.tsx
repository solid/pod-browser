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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactNode, ReactElement, useContext } from "react";
import { NextRouter } from "next/router";
import Link from "next/link";
import PodLocationContext from "../../src/contexts/podLocationContext";

export function resourceHref(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
}

// TODO make typescript happy someday

export const urlForResourceAction = (
  action: string | undefined,
  resourceIri: string,
  containerIri: string | undefined
): any => ({
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
  action: string,
  resourceIri: string,
  containerIri: string,
  router: NextRouter
): Promise<boolean> {
  return router.replace(
    urlForResourceAction(action, resourceIri, undefined),
    urlForResourceAction(action, resourceIri, containerIri)
  );
}

/* eslint react/require-default-props: 0 */
interface IResourceLink {
  children?: ReactNode;
  action?: string;
  resourceIri?: string;
  containerIri?: string;
  ref?: any; // TODO no idea
}

/* eslint react/jsx-props-no-spreading: 0 */
export default function ResourceLink(
  props: IResourceLink
): ReactElement | null {
  const { children, action, resourceIri, containerIri, ...linkProps } = props;

  // If resource and container aren't passed in, create a link to show <action> for the current uri.
  const { currentUri } = useContext(PodLocationContext);
  const resourceIriToDisplay = resourceIri || currentUri;
  const containerIriToUseAsBase = containerIri || currentUri;

  return (
    <Link
      href={urlForResourceAction(action, resourceIriToDisplay, undefined)}
      as={urlForResourceAction(
        action,
        resourceIriToDisplay,
        containerIriToUseAsBase
      )}
      replace
    >
      <a {...linkProps}>{children}</a>
    </Link>
  );
}
