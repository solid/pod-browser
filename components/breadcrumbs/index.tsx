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
import clsx from "clsx";
import PodLocationContext from "../../src/contexts/podLocationContext";
import Spinner from "../spinner";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface Crumb {
  uri: string;
  label: string;
}

interface CrumbProps {
  crumb: Crumb;
}

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
  const uriParts: string[] = currentUri
    .substr(baseUri.length)
    .split("/")
    .filter((crumb) => !!crumb);
  const resourceHref = (index = -1): string => {
    return `/resource/${encodeURIComponent(
      baseUri + uriParts.slice(0, index + 1).join("/")
    )}`;
  };
  const crumbs: Array<Crumb> = [
    { uri: `/resource/${encodeURIComponent(baseUri)}`, label: "All files" },
  ].concat(
    uriParts.map((part, index) => ({ uri: resourceHref(index), label: part }))
  );

  const Crumb = ({ crumb }: CrumbProps): ReactElement => (
    <li key={crumb.uri} className={bem("breadcrumb__crumb")}>
      <i
        className={clsx(
          bem("icon-caret-left"),
          bem("breadcrumb__caret", "small")
        )}
      />
      <Link href="/resource/[iri]" as={crumb.uri}>
        <a className={bem("breadcrumb__link")}>
          <span className={bem("breadcrumb__prefix")}>Back to </span>
          {crumb.label}
        </a>
      </Link>
      <i
        className={clsx(
          bem("icon-caret-right"),
          bem("breadcrumb__caret", "large")
        )}
      />
    </li>
  );

  return (
    <nav aria-label="Breadcrumbs">
      <ul className={bem("breadcrumb")} ref={breadcrumbsList}>
        {crumbs.slice(0, crumbs.length - 1).map((crumb) => (
          <Crumb crumb={crumb} />
        ))}
      </ul>
    </nav>
  );
}
