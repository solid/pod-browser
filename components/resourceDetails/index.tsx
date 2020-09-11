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
// material-ui is broken and doesn't allow `ListItem` to accept `component`

import React, { ReactElement, useContext } from "react";
import {
  Button,
  createStyles,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import ShareIcon from "@material-ui/icons/Share";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/styles";
import { PrismTheme } from "@solid/lit-prism-patterns";
import ResourceLink from "../resourceLink";
import styles from "./styles";
import { IResourceDetails } from "../../src/solidClientHelpers";
import { parseUrl } from "../../src/stringHelpers";
import SessionContext from "../../src/contexts/sessionContext";
import { DETAILS_CONTEXT_ACTIONS } from "../../src/contexts/detailsMenuContext";
import DeleteLink from "./deleteLink";

interface IDownloadLink {
  type: string;
  iri: string;
  className: string;
}

export function displayType(types: string[] | undefined): string {
  if (!types || types.length === 0) return "Resource";
  const [type] = types;
  return type;
}

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export function forceDownload(name: string, file: Blob): void {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = window.URL.createObjectURL(file);
  a.setAttribute("download", name);

  document.body.appendChild(a);

  a.click();

  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

export function downloadResource(iri: string, fetch: typeof window.fetch) {
  return (): void => {
    const { pathname } = parseUrl(iri);
    const name = pathname.replace(/\//g, "");

    fetch(iri)
      .then((response) => response.blob())
      .then((file) => forceDownload(name, file))
      .catch((e) => e);
  };
}

export function DownloadLink(props: IDownloadLink): ReactElement | null {
  const { session } = useContext(SessionContext);
  const { type, iri, className } = props;

  if (type.match(/container/i)) return null;

  return (
    <Button
      variant="contained"
      onClick={downloadResource(iri, session.fetch)}
      className={className}
    >
      Download
    </Button>
  );
}

/* eslint react/jsx-props-no-spreading: 0 */
const SharingLink = React.forwardRef((linkProps, ref) => (
  <ResourceLink
    {...linkProps}
    action={DETAILS_CONTEXT_ACTIONS.SHARING}
    ref={ref}
  />
));

interface IDetailsProps {
  resource: IResourceDetails;
  onDelete: void;
  onDeleteError: (Error) => void;
}

export default function ResourceDetails({
  resource,
  onDelete,
  onDeleteError,
}: IDetailsProps): ReactElement {
  const classes = useStyles();
  const { iri, name, types } = resource;
  const type = displayType(types);

  return (
    <>
      <section className={classes.headerSection}>
        <h3 className={classes["content-h3"]} title={iri}>
          {name}
        </h3>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>Actions</h5>
        <List>
          <ListItem button component={SharingLink} resourceIri={iri}>
            <ListItemIcon>
              <ShareIcon />
            </ListItemIcon>
            <ListItemText primary="Sharing &amp; App Permissions" />
          </ListItem>

          <ListItem
            button
            component={DeleteLink}
            resourceIri={iri}
            name={name}
            onDelete={onDelete}
            onDeleteError={onDeleteError}
          >
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </ListItem>
        </List>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <h5 className={classes["content-h5"]}>Details</h5>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <List>
          <ListItem className={classes.listItem}>
            <Typography className={classes.detailText}>Thing Type:</Typography>
            <Typography
              className={`${classes.typeValue} ${classes.detailText}`}
            >
              {type}
            </Typography>
          </ListItem>
        </List>
      </section>

      <Divider />

      <section className={classes.centeredSection}>
        <DownloadLink
          type={type}
          iri={iri}
          className={classes.downloadButton}
        />
      </section>
    </>
  );
}
