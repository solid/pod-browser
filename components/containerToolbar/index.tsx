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
import { useRouter, NextRouter } from "next/router";
import styles from "./styles";
import PodLocationContext from "../../src/contexts/podLocationContext";
import { stripQueryParams } from "../../src/stringHelpers";
import { DETAILS_CONTEXT_ACTIONS } from "../../src/contexts/detailsMenuContext";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

export function openContextMenu(
  iri: string,
  router: NextRouter,
  pathname: string
): () => void {
  return async () => {
    await router.replace({
      pathname,
      query: { action: DETAILS_CONTEXT_ACTIONS.DETAILS, iri },
    });
  };
}

export default function ContainerToolbar(): ReactElement | null {
  const { currentUri } = useContext(PodLocationContext);
  const bem = useBem(useStyles());
  const router = useRouter();
  const { asPath } = router;
  const pathname = asPath ? stripQueryParams(asPath) : "/";

  return (
    <div className={bem("container-toolbar")}>
      <button
        className={bem("icon-button")}
        onClick={openContextMenu(currentUri, router, pathname)}
        type="button"
      >
        <i className={bem("icon-info")} aria-label="View details" />
      </button>
    </div>
  );
}
