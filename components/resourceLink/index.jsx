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

import React, { useContext } from "react";
import Link from "next/link";
import T from "prop-types";
import PodLocationContext from "../../src/contexts/podLocationContext";
import { urlForResourceAction } from "../../src/navigator";

/* eslint react/jsx-props-no-spreading: 0 */
export default function ResourceLink(props) {
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

ResourceLink.propTypes = {
  action: T.string,
  children: T.node,
  className: T.string,
  resourceIri: T.string,
  containerIri: T.string,
  ref: T.node,
};

ResourceLink.defaultProps = {
  action: null,
  children: null,
  className: null,
  resourceIri: null,
  containerIri: null,
  ref: null,
};
