/* eslint-disable camelcase */
import { ReactElement } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ContainerDetails from "../containerDetails";
import ResourceDetails from "../resourceDetails";
import styles from "./styles";
import { NormalizedPermission } from "../../src/lit-solid-helpers";

const CONTAINER_TYPES: string[] = ["BasicContainer", "Container"];
const useStyles = makeStyles(styles);

export function isContainerType(types: string[]): boolean {
  return types.reduce((acc: boolean, type: string): boolean => {
    return (
      acc || CONTAINER_TYPES.some((containerType) => containerType === type)
    );
  }, false);
}

export function isUnknownType(types: string[]): boolean {
  return types.includes("Unknown");
}

export interface ResourceProps {
  iri: string;
  name?: string;
  types: string[];
  permissions?: NormalizedPermission[];
}

export default function Details({
  iri,
  types,
  name,
  permissions,
}: ResourceProps): ReactElement {
  const classes = useStyles();
  if (isUnknownType(types)) return <p>Unknown resource</p>;
  const DetailsComponent = isContainerType(types)
    ? ContainerDetails
    : ResourceDetails;

  return (
    <DetailsComponent
      iri={iri}
      name={name}
      permissions={permissions}
      classes={classes}
    />
  );
}
