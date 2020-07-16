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

import { ReactElement, useContext, useEffect } from "react";
import { createStyles, makeStyles, StyleRules } from "@material-ui/styles";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import styles from "./styles";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import PodLocationContext from "../../src/contexts/podLocationContext";
import { useFetchResourceDetails } from "../../src/hooks/litPod";
import DetailsLoading from "../detailsLoading";
import Details from "../resourceDetails";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

export default function ContainerToolbar(): ReactElement | null {
  const { menuOpen, setMenuOpen, setMenuContents } = useContext(
    DetailsMenuContext
  );
  const { baseUri, currentUri } = useContext(PodLocationContext);
  const { data } = useFetchResourceDetails(currentUri) || {};
  const bem = useBem(useStyles());

  useEffect(() => {
    function getPathName(): string {
      const path = baseUri ? currentUri.substr(baseUri.length) : null;
      return path === "" ? "All files" : path || "Unnamed";
    }

    if (!!menuOpen && menuOpen === currentUri && data) {
      const { types, name, iri, permissions } = data;
      setMenuContents(<DetailsLoading resource={data} />);
      setMenuContents(
        <Details
          iri={iri}
          types={types}
          name={name || getPathName()}
          permissions={permissions}
        />
      );
    } else if (!!menuOpen && menuOpen === currentUri) {
      setMenuContents(
        <DetailsLoading
          resource={{
            iri: currentUri,
            name: getPathName(),
            types: ["Container"],
          }}
        />
      );
    }
  }, [menuOpen, data, currentUri, baseUri, setMenuContents]);

  return (
    <div className={bem("container-toolbar")}>
      <button
        className={bem("icon-button")}
        onClick={() => setMenuOpen(currentUri)}
        type="button"
      >
        <i className={bem("icon-info")} aria-label="View details" />
      </button>
    </div>
  );
}
