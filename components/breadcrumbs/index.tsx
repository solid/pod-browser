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

import { ReactElement, useContext } from "react";
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";
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

  return (
    <nav aria-label="Breadcrumbs">
      <ul className={bem("breadcrumb")}>
        <li className={bem("breadcrumb__crumb")}>
          <Link href={resourceHref()}>
            <a className={bem("breadcrumb__link")}>All files</a>
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key="crumb" className={bem("breadcrumb__crumb")}>
            <i className={bem("icon-caret-right")} />
            &nbsp;
            <Link href={resourceHref(index)}>
              <a
                className={bem(
                  "breadcrumb__link",
                  index === crumbs.length - 1 ? "active" : null
                )}
              >
                {crumb}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
