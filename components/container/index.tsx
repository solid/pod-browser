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

// @ts-nocheck
// react-table is super broken with sorting, so temporarily disable ts checking.

import { ReactElement, useEffect, useState, useContext, useMemo } from "react";
import { fetchLitDataset, getThingOne, getIriAll } from "@solid/lit-pod";
import { useTable, useSortBy, UseSortByOptions } from "react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";

import DetailsContextMenu from "../detailsContextMenu";
import ContainerTableRow from "../containerTableRow";
import UserContext from "../../src/contexts/userContext";
import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import {
  getIriPath,
  namespace,
  ResourceDetails,
} from "../../src/lit-solid-helpers";
import ContainerTableLoading from "../containerTableLoading";

export async function getPartialResources(
  containerIri: string
): Partial<ResourceDetails>[] {
  const litDataset = await fetchLitDataset(containerIri);
  const container = getThingOne(litDataset, containerIri);
  const iris = getIriAll(container, namespace.contains);
  const partialResources = iris.map((iri) => ({ iri, name: getIriPath(iri) }));
  return partialResources;
}

interface IPodList {
  iri: string;
}

export default function Container(props: IPodList): ReactElement {
  useRedirectIfLoggedOut();

  const { iri } = props;

  const { session, isLoadingSession } = useContext(UserContext);
  const [resources, setResources] = useState<Partial<ResourceDetails>[]>([]);
  const [isLoading, setIsLoading] = useState(
    isLoadingSession || !resources || !resources.length
  );

  const columns = useMemo(
    () => [
      {
        Header: "File",
        accessor: "name",
      },
      {
        Header: "Type",
        accessor: "types[0]",
      },
    ],
    []
  );

  const data = useMemo(() => resources || [], [resources]);

  // TODO fix typescript errors below.
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<UseSortByOptions<ResourceDetails>>(
    {
      columns,
      data,
    },
    useSortBy
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    getPartialResources(iri).then((partialResources) => {
      setIsLoading(false);
      setResources(partialResources);
    });
  }, [session, iri]);

  if (isLoading) {
    return <ContainerTableLoading />;
  }

  // react-table works through spreads.
  /* eslint react/jsx-props-no-spreading: 0 */
  return (
    <>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted && column.isSortedDesc ? "v" : ""}
                    {column.isSorted && !column.isSortedDesc ? "^" : ""}
                  </span>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody {...getTableBodyProps()}>
          {!resources || !resources.length ? (
            <TableRow key="no-resources-found">
              <TableCell rowSpan={3}>
                No resources were found within this container.
              </TableCell>
            </TableRow>
          ) : null}

          {rows.map((row) => {
            prepareRow(row);
            const details = row.original as ResourceDetails;
            return <ContainerTableRow key={details.iri} resource={details} />;
          })}
        </TableBody>
      </Table>
      <DetailsContextMenu />
    </>
  );
}
