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

import { createRef, ReactElement, useContext, useLayoutEffect } from "react";
import { StyleRules, createStyles, makeStyles } from "@material-ui/styles";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import Link from "next/link";
import PodLocationContext from "../../src/contexts/podLocationContext";
import Spinner from "../spinner";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

export default function Breadcrumbs(): ReactElement {
  const bem = useBem(useStyles());
  const podLocation = useContext(PodLocationContext);
  const breadcrumbsList = createRef<HTMLUListElement>();

  useLayoutEffect(() => {
    if (!breadcrumbsList.current) {
      return;
    }

    breadcrumbsList.current.scrollTo(breadcrumbsList.current.scrollWidth, 0);
  });

  if (!podLocation.baseUri) return <Spinner />;

  const { baseUri, currentUri } = podLocation;
  const crumbs = currentUri
    .substr(baseUri.length)
    .split("/")
    .filter((crumb) => !!crumb);

  const resourceHref = (index = -1): string =>
    `/resource/${encodeURIComponent(
      baseUri + crumbs.slice(0, index + 1).join("/")
    )}`;

  const breadcrumbLink = (crumb: string): ReactElement => (
    <a className={bem("breadcrumb__link")}>{crumb}</a>
  );

  const activeBreadcrumbLink = (crumb: string): ReactElement => (
    <a className={bem("breadcrumb__link", "active")}>{crumb}</a>
  );

  return (
    <nav aria-label="Breadcrumbs">
      <ul className={bem("breadcrumb")} ref={breadcrumbsList}>
        <li className={bem("breadcrumb__crumb")}>
          <Link href="/">
            <a className={bem("breadcrumb__link")}>All files</a>
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={`crumb-${crumb}`} className={bem("breadcrumb__crumb")}>
            <i className={bem("icon-caret-right")} />
            &nbsp;
            <Link href="/resource/[iri]" as={resourceHref(index)}>
              {crumbs.length - 1 === index
                ? activeBreadcrumbLink(crumb)
                : breadcrumbLink(crumb)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
