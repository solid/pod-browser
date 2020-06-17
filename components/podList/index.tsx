import { ReactElement } from "react";
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
    return <Container iri={podIris[0]} />;
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
            <TableRow>
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
