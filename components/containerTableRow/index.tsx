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
import { ReactElement, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TableCell, TableRow } from "@material-ui/core";
import Link from "next/link";
import DetailsLoading from "../detailsLoading";
import DetailsError from "../detailsError";
import Details from "../resourceDetails";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";

import { fetchResourceWithAcl, NormalizedResource } from "../../src/lit-solid-helpers";

import styles from "./styles";

export function resourceHref(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
}

export interface ResourceDetails extends NormalizedResource {
  name: string;
}

interface TableRowClickHandlerParams {
  setMenuOpen: (open: boolean) => void;
  setMenuContents: (contents: ReactElement) => void;
  resource: ResourceDetails;
}

export function handleTableRowClick({
  setMenuOpen,
  setMenuContents,
  resource,
}: TableRowClickHandlerParams) {
  return async (evnt: Partial<React.MouseEvent>): Promise<void> => {
    const element = evnt.target as HTMLElement;
    if (element && element.tagName === "A") return;

    setMenuOpen(true);
    setMenuContents(<DetailsLoading resource={resource} />);

    const { iri } = resource;
    const details = resource;

    if (!resource.permissions) {
      try {
        const { permissions } = await fetchResourceWithAcl(iri);
        details.permissions = permissions;
      } catch(e) {
        setMenuContents(<DetailsError />);
      }
    }

    const { types, name, permissions } = details;

    setMenuContents(
      <Details
        iri={iri}
        types={types}
        name={name}
        permissions={permissions}
      />
    );
  };
}

const useStyles = makeStyles(styles);

interface Props {
  resource: ResourceDetails;
}

export default function ContainerTableRow({ resource }: Props): ReactElement {
  const { setMenuOpen, setMenuContents } = useContext(DetailsMenuContext);

  const classes = useStyles();
  const onClick = handleTableRowClick({
    setMenuOpen,
    setMenuContents,
    resource,
  });

  const { name, iri, types } = resource || {};

  return (
    <TableRow className={classes.tableRow} onClick={onClick}>
      <TableCell>
        <Link href={resourceHref(iri)}>
          <a>{name}</a>
        </Link>
      </TableCell>

      {/* prettier and eslint rules were fighting */}
      {/* eslint prettier/prettier: 0 */}
      {resource ? (
        <TableCell key={`${iri}-type`}>{types[0] || "Resource"}</TableCell>
      ) : null }
    </TableRow>
  );
}
