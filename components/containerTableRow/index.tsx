/* eslint-disable camelcase */
import { ReactElement, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { TableCell, TableRow } from "@material-ui/core";
import Link from "next/link";
import Details from "../details";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";

import { NormalizedResource } from "../../src/lit-solid-helpers";

import styles from "./styles";


export interface ResourceDetails extends NormalizedResource {
  name: string | undefined;
}

export function resourceHref(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
}


interface TableRowClickHandlerParams {
  classes: Record<string, string>;
  setMenuOpen: (open: boolean) => void;
  setMenuContents: (contents: ReactElement) => void;
  resource: ResourceDetails | undefined;
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

    if (!resource) {
      return;
    }

    setMenuContents(
      <Details
        iri={resource.iri}
        types={resource.types}
        name={resource.name}
        permissions={resource.permissions}
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
    classes,
    setMenuOpen,
    setMenuContents,
    resource,
  });

  const { name, iri, types, permissions } = resource || {};

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

      {resource && permissions && permissions.length ? (
        <TableCell key={`${iri}-permissions`}>{permissions[0].alias}</TableCell>
      ) : null}
    </TableRow>
  );
}
