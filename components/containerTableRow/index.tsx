import { ReactElement, useContext } from "react";
import { fetchLitDataset } from "lit-solid";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, TableCell, TableRow } from "@material-ui/core";
import Link from "next/link";
import ContainerDetails from "../containerDetails";
import DetailsMenuContext from "../../src/contexts/detailsMenuContext";
import {
  normalizeDataset,
  NormalizedDataset,
} from "../../src/litDatasetHelpers";
import styles from "./styles";
import { parseUrl } from "../../src/stringHelpers";

const useStyles = makeStyles(styles);

interface ContainerDetails extends NormalizedDataset {
  name: string | undefined;
}

export function getIriPath(iri: string): string | undefined {
  const { pathname } = parseUrl(iri);
  return pathname.replace(/\/?$/, "");
}

export async function fetchContainerDetails(
  iri: string
): Promise<ContainerDetails> {
  const nonRdfIri = iri.match(/(ico|txt)$/);
  const name = getIriPath(iri);
  if (nonRdfIri) return { iri, name: nonRdfIri[1], type: nonRdfIri[1] };
  const litDataset = await fetchLitDataset(iri);

  return {
    name,
    ...normalizeDataset(litDataset, iri),
  };
}

export function resourceLink(iri: string): string {
  return `/resource/${encodeURIComponent(iri)}`;
}

export function handleTableRowClick({
  classes,
  iri,
  setMenuOpen,
  setMenuContents,
}: {
  classes: Record<string, string>;
  iri: string;
  setMenuOpen: (open: boolean) => void;
  setMenuContents: (contents: ReactElement) => void;
}) {
  return async (evnt: Partial<React.MouseEvent>): Promise<void> => {
    const element = evnt.target as HTMLElement;
    if (element && element.tagName === "A") return;

    setMenuOpen(true);
    setMenuContents(
      <div className={classes.spinnerContainer}>
        <CircularProgress />
      </div>
    );

    const { type, name } = await fetchContainerDetails(iri);

    setMenuContents(<ContainerDetails iri={iri} type={type} name={name} />);
  };
}

interface Props {
  iri: string;
}

export default function ContainerTableRow({ iri }: Props): ReactElement {
  const { setMenuOpen, setMenuContents } = useContext(DetailsMenuContext);
  const classes = useStyles();
  const onClick = handleTableRowClick({
    classes,
    iri,
    setMenuOpen,
    setMenuContents,
  });

  return (
    <TableRow className={classes.tableRow} onClick={onClick}>
      <TableCell>
        <Link href={resourceLink(iri)}>
          <a>{getIriPath(iri)}</a>
        </Link>
      </TableCell>
      <TableCell>Folder</TableCell>
      <TableCell>Full</TableCell>
      <TableCell>Today :)</TableCell>
    </TableRow>
  );
}
