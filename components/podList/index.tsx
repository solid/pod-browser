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

import React, { ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Link from "next/link";
import DetailsContextMenu from "../detailsContextMenu";
import { resourceHref } from "../containerTableRow";
import Container from "../container";
import { PodLocationProvider } from "../../src/contexts/podLocationContext";

interface IPodList {
  podIris: string[] | undefined;
}

export default function PodList(props: IPodList): ReactElement | null {
  const { podIris } = props;

  // If there's only a single pod in podIris, display its contents.
  // Otherwise, display a table of pods that the user can select to view.

  if (!podIris || !podIris.length) {
    return null;
  }

  if (podIris.length === 1) {
    return (
      <PodLocationProvider currentUri={podIris[0]}>
        <Container iri={podIris[0]} />
      </PodLocationProvider>
    );
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Pod IRI</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {podIris.map((iri: string) => (
            <TableRow key={iri}>
              <TableCell>
                <Link href={resourceHref(iri)}>
                  <a>{iri}</a>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DetailsContextMenu />
    </>
  );
}
