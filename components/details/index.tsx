/* eslint-disable camelcase */
import { ReactElement } from "react";
import { unstable_AgentAccess } from "lit-solid";
import { makeStyles } from "@material-ui/core/styles";
import ContainerDetails from "../containerDetails";
import ResourceDetails from "../resourceDetails";
import styles from "./styles";

const CONTAINER_TYPES = ["BasicContainer", "Container"];
const useStyles = makeStyles(styles);

export interface ResourceProps {
  iri: string;
  name?: string;
  type?: string;
  acl?: unstable_AgentAccess;
}

export function getDetailsComponent(
  { iri, type, name, acl }: ResourceProps,
  classes: Record<string, unknown>
): ReactElement {
  if (CONTAINER_TYPES.includes(type as string)) {
    return (
      <ContainerDetails
        iri={iri}
        name={name}
        type={type}
        acl={acl}
        classes={classes}
      />
    );
  }

  return (
    <ResourceDetails
      iri={iri}
      name={name}
      type={type}
      acl={acl}
      classes={classes}
    />
  );
}

export default function Details(props: ResourceProps): ReactElement {
  const classes = useStyles();
  return getDetailsComponent(props, classes);
}
