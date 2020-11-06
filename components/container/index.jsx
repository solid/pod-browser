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

import React, { useEffect, useMemo, useState } from "react";
import T from "prop-types";
import { useTable, useSortBy } from "react-table";
import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";

import { isContainer } from "@inrupt/solid-client";
import ContainerTableRow, { renderResourceType } from "../containerTableRow";
import SortedTableCarat from "../sortedTableCarat";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import { getResourceName } from "../../src/solidClientHelpers/resource";

import Spinner from "../spinner";
import styles from "./styles";
import Breadcrumbs from "../breadcrumbs";
import PageHeader from "../containerPageHeader";
import ContainerDetails from "../containerDetails";
import { BookmarksContextProvider } from "../../src/contexts/bookmarksContext";
import { isHTTPError } from "../../src/solidClientHelpers/utils";
import AccessForbidden from "../accessForbidden";
import ResourceNotFound from "../resourceNotFound";
import useDataset from "../../src/hooks/useDataset";
import NotSupported from "../notSupported";
import useContainerResourceIris from "../../src/hooks/useContainerResourceIris";
import { getContainerUrl } from "../../src/stringHelpers";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function Container({ iri }) {
  useRedirectIfLoggedOut();
  const encodedIri = encodeURI(iri);
  const encodedContainerPathIri = getContainerUrl(iri);
  const [containerPath, setContainerPath] = useState(encodedContainerPathIri);
  const [resourcePath, setResourcePath] = useState(encodedIri);

  useEffect(() => {
    setResourcePath(encodedIri);
    const path = getContainerUrl(iri);
    setContainerPath(path);
  }, [encodedIri, iri]);

  const { data: container, error } = useDataset(containerPath);

  const { data: resourceIris, mutate } = useContainerResourceIris(
    containerPath
  );

  const loading = !resourceIris || !container;

  const bem = useBem(useStyles());

  const columns = useMemo(
    () => [
      {
        header: "Icon",
        accessor: "icon",
        disableSortBy: true,
        modifiers: ["align-center", "width-preview"],
      },
      {
        header: "BookmarkIcon",
        accessor: "bookmark-icon",
        disableSortBy: true,
        modifiers: ["align-center", "width-preview"],
      },
      {
        Header: "File",
        accessor: "filename",
      },
      {
        Header: "Type",
        accessor: "type",
      },
    ],
    []
  );

  const data = useMemo(() => {
    if (!resourceIris) {
      return [];
    }

    return resourceIris.map((rIri) => ({
      iri: rIri,
      name: getResourceName(rIri),
      filename: getResourceName(rIri)?.toLowerCase(),
      type: renderResourceType(rIri),
    }));
  }, [resourceIris]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultCanSort: true,
    },
    useSortBy
  );

  if (error && isHTTPError(error.message, 401)) return <AccessForbidden />;
  if (error && isHTTPError(error.message, 403)) return <AccessForbidden />;
  if (error && isHTTPError(error.message, 404)) return <ResourceNotFound />;
  if (error) return <NotSupported />;

  if (loading) {
    return <Spinner />;
  }

  if (!isContainer(container)) return <NotSupported />;

  // react-table works through spreads.
  /* eslint react/jsx-props-no-spreading: 0 */
  return (
    <>
      <BookmarksContextProvider>
        <PageHeader mutate={mutate} resourceList={data} />
        <ContainerDetails mutate={mutate}>
          <Breadcrumbs />
          <table className={clsx(bem("table"))} {...getTableProps()}>
            <thead className={bem("table__header")}>
              {headerGroups.map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className={bem("table__header-row")}
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map((column) => (
                    <td
                      key={column.id}
                      className={bem(
                        "table__header-cell",
                        ...(column.modifiers || [])
                      )}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      {` `}
                      <SortedTableCarat
                        sorted={column.isSorted}
                        sortedDesc={column.isSortedDesc}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={bem("table__body")} {...getTableBodyProps()}>
              {!data || !data.length ? (
                <tr key="no-resources-found" className={bem("table__body-row")}>
                  <td rowSpan={3} className={bem("table__body-cell")}>
                    No resources were found within this container.
                  </td>
                </tr>
              ) : null}

              {rows.map((row) => {
                prepareRow(row);
                const details = row.original;
                return (
                  <ContainerTableRow
                    key={details.iri}
                    resource={details}
                    container={containerPath}
                    preselected={
                      details.iri === resourcePath && !isContainer(resourcePath)
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </ContainerDetails>
      </BookmarksContextProvider>
    </>
  );
}

Container.propTypes = {
  iri: T.string.isRequired,
};
