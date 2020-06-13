/* eslint-disable camelcase */
import { ReactElement } from "react";
import { unstable_AgentAccess } from "lit-solid";
import { makeStyles } from "@material-ui/core/styles";
import ContainerDetails from "../containerDetails";
import ResourceDetails from "../resourceDetails";
import styles from "./styles";

const CONTAINER_TYPES: string[] = ["BasicContainer", "Container"];
const useStyles = makeStyles(styles);

export function isContainerType(types: string[]): boolean {
  return types.reduce((acc: boolean, type: string): boolean => {
    return (
      acc || CONTAINER_TYPES.some((containerType) => containerType === type)
    );
  }, false);
}

export function isUnkownType(types: string[]): boolean {
  return types.includes("Unknown");
}

export interface ResourceProps {
  iri: string;
  name?: string;
  types?: string[];
  acl?: unstable_AgentAccess;
}

export function getDetailsComponent(
  { iri, types, name, acl }: ResourceProps,
  classes: Record<string, unknown>
): ReactElement {
  if (isUnkownType(types)) {
    return <p>Not a resource</p>;
  }

  if (isContainerType(types)) {
    return (
      <ContainerDetails iri={iri} name={name} acl={acl} classes={classes} />
    );
  }

  return <ResourceDetails iri={iri} name={name} acl={acl} classes={classes} />;
}

export default function Details(props: ResourceProps): ReactElement {
  const classes = useStyles();
  return getDetailsComponent(props, classes);
}
