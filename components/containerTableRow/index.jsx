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

/* eslint-disable camelcase */
import React, { useContext } from "react";
import { makeStyles, createStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { useRouter } from "next/router";
import clsx from "clsx";
import T from "prop-types";
import { DETAILS_CONTEXT_ACTIONS } from "../../src/contexts/detailsMenuContext";
import { isContainerIri } from "../../src/solidClientHelpers/utils";
import PodLocationContext from "../../src/contexts/podLocationContext";
import ResourceLink from "../resourceLink";
import Bookmark from "../bookmark";
import styles from "./styles";
import { resourceContextRedirect } from "../../src/navigator";

export function ResourceIcon({ iri, bem }) {
  // keeping it very simple for now (either folder or file), and then we can expand upon it later
  const icon = isContainerIri(iri) ? "icon-folder" : "icon-file";

  return <i className={clsx(bem(icon), bem("resource-icon"))} />;
}

ResourceIcon.propTypes = {
  iri: T.string.isRequired,
  bem: T.func.isRequired,
};

export function renderResourceType(iri) {
  return isContainerIri(iri) ? "Container" : "Resource";
}

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function handleAction(resourceIri, containerIri, router) {
  const action = DETAILS_CONTEXT_ACTIONS.DETAILS;

  return async (event) => {
    if (event.type === "keydown" && event.key !== "Enter") return;
    const element = event.target;
    if (element && element.tagName === "A") return;
    if (element && element.tagName === "I") return;
    await resourceContextRedirect(action, resourceIri, containerIri, router);
  };
}

export default function ContainerTableRow({ resource }) {
  const classes = useStyles();
  const bem = useBem(classes);
  const { name, iri } = resource;
  const router = useRouter();
  const { currentUri } = useContext(PodLocationContext);
  const isActive = router.query.resourceIri === iri;

  return (
    <tr
      tabIndex="0"
      className={clsx(
        bem("table__body-row", "selectable", isActive ? "selected" : null)
      )}
      onClick={handleAction(iri, currentUri, router)}
      onKeyDown={handleAction(iri, currentUri, router)}
    >
      <td className={bem("table__body-cell", "align-center", "width-preview")}>
        <Bookmark iri={iri} />
      </td>
      <td className={bem("table__body-cell", "align-center", "width-preview")}>
        <ResourceIcon iri={iri} bem={bem} />
      </td>
      <td className={bem("table__body-cell")}>
        {isContainerIri(iri) ? (
          <ResourceLink
            containerIri={iri}
            resourceIri={iri}
            className={bem("table__link")}
          >
            {name}
          </ResourceLink>
        ) : (
          name
        )}
      </td>
      <td key={`${iri}-type`} className={bem("table__body-cell")}>
        {renderResourceType(iri)}
      </td>
    </tr>
  );
}

ContainerTableRow.propTypes = {
  resource: T.shape({
    name: T.string.isRequired,
    iri: T.string.isRequired,
  }),
};

ContainerTableRow.defaultProps = {
  resource: {
    name: "",
    iri: "",
  },
};
