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
import { makeStyles, createStyles, StyleRules } from "@material-ui/styles";
import Skeleton from "@material-ui/lab/Skeleton";
import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import Link from "next/link";
import clsx from "clsx";

import DetailsLoading from "../detailsLoading";
import Details from "../resourceDetails";
import { useFetchResourceDetails } from "../../src/hooks/litPod";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import { ResourceDetails } from "../../src/lit-solid-helpers";

import styles from "./styles";

export function resourceHref(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
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

    const { types, name, iri } = resource;

    setMenuOpen(true);
    setMenuContents(<DetailsLoading resource={resource} />);
    setMenuContents(<Details iri={iri} types={types} name={name} />);
  };
}

interface IResourceIcon {
  types?: string[];
  bem: any;
}

function ResourceIcon(props: IResourceIcon): ReactElement | null {
  const { types, bem } = props;

  if (!types) {
    return null;
  }

  // keeping it very simple for now (either folder or file), and then we can expand upon it later
  const icon = types.indexOf("Container") !== -1 ? "icon-folder" : "icon-file";

  return <i className={clsx(bem(icon), bem("resource-icon"))} />;
}

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme) as StyleRules)
);

interface Props {
  resource: ResourceDetails;
}

export default function ContainerTableRow({ resource }: Props): ReactElement {
  const { setMenuOpen, setMenuContents } = useContext(DetailsMenuContext);

  const classes = useStyles();
  const bem = useBem(classes);

  const { name, iri } = resource;
  const { data } = useFetchResourceDetails(iri);
  const isLoading = !data;
  const loadedResource = data || resource;

  const onClick = handleTableRowClick({
    setMenuOpen,
    setMenuContents,
    resource: loadedResource,
  });

  const { types } = loadedResource;

  return (
    <tr
      className={clsx(bem("table__body-row"), bem("tableRow"))}
      onClick={onClick}
    >
      <td className={bem("table__body-cell", "align-center", "width-preview")}>
        {types && types.length ? (
          <ResourceIcon types={types} bem={bem} />
        ) : null}
      </td>

      <td className={bem("table__body-cell")}>
        <Link href="/resource/[iri]" as={resourceHref(iri)}>
          <a>{name}</a>
        </Link>
      </td>

      {isLoading ? (
        <td key={`${iri}-type`} className={bem("table__body-cell")}>
          <Skeleton variant="text" width={100} />
        </td>
      ) : (
        <td key={`${iri}-type`} className={bem("table__body-cell")}>
          {types[0] || "Resource"}
        </td>
      )}
    </tr>
  );
}
