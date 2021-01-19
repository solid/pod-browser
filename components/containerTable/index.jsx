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

/* eslint react/jsx-props-no-spreading:off */

import React, { useMemo } from "react";
import T from "prop-types";
import { useSortBy, useTable } from "react-table";
import clsx from "clsx";
import { isContainer } from "@inrupt/solid-client";
import { Table } from "@inrupt/prism-react-components";
import ContainerTableRow from "../containerTableRow";
import SortedTableCarat from "../sortedTableCarat";

export default function ContainerTable({ containerPath, data, resourcePath }) {
  const bem = Table.useBem();

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

  return (
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
  );
}

ContainerTable.propTypes = {
  containerPath: T.string.isRequired,
  data: T.arrayOf(T.object).isRequired,
  resourcePath: T.string.isRequired,
};
