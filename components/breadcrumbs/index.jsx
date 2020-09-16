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

import { createRef, useContext } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import PodLocationContext from "../../src/contexts/podLocationContext";
import Spinner from "../spinner";
import styles from "./styles";
import Crumb from "./crumb";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const TESTCAFE_ID_BREADCRUMBS = "breadcrumbs";

export default function Breadcrumbs() {
  const bem = useBem(useStyles());
  const podLocation = useContext(PodLocationContext);
  const breadcrumbsList = createRef();

  if (!podLocation.baseUri) return <Spinner />;

  const { baseUri, currentUri } = podLocation;
  const uriParts = currentUri
    .substr(baseUri.length)
    .split("/")
    .filter((crumb) => !!crumb);
  const resourceHref = (index) => {
    return `/resource/${encodeURIComponent(
      `${baseUri + uriParts.slice(0, index + 1).join("/")}/`
    )}`;
  };
  const crumbs = [
    { uri: `/resource/${encodeURIComponent(baseUri)}`, label: "All files" },
  ].concat(
    uriParts.map((part, index) => ({ uri: resourceHref(index), label: part }))
  );

  return (
    <nav aria-label="Breadcrumbs">
      <ul
        data-testid={TESTCAFE_ID_BREADCRUMBS}
        className={bem("breadcrumb")}
        ref={breadcrumbsList}
      >
        {crumbs.map((crumb, index) => (
          <Crumb
            crumb={crumb}
            key={crumb.uri}
            isLink={index !== crumbs.length - 1}
          />
        ))}
      </ul>
    </nav>
  );
}
