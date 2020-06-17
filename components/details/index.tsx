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
      types={types}
    />
  );
}
