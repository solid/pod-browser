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

import React from "react";
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
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import ResourceLink from "../resourceLink";
import styles from "./styles";
import { parseUrl } from "../../src/stringHelpers";
import { DETAILS_CONTEXT_ACTIONS } from "../../src/contexts/detailsMenuContext";
import DeleteLink from "./deleteLink";

const TESTCAFE_ID_SHARE_PERMISSIONS_BUTTON = "share-permissions-button";
const TESTCAFE_ID_DOWNLOAD_BUTTON = "download-resource-button";
const TESTCAFE_ID_TITLE = "resource-title";

export function displayType(types) {
  if (!types || types.length === 0) return "Resource";
  const [type] = types;
  return type;
}

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function forceDownload(name, file) {
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = window.URL.createObjectURL(file);
  a.setAttribute("download", name);

  document.body.appendChild(a);

  a.click();

  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

export function downloadResource(iri, fetch) {
  return () => {
    const { pathname } = parseUrl(iri);
    const name = pathname.replace(/\//g, "");

    fetch(iri)
      .then((response) => response.blob())
      .then((file) => forceDownload(name, file))
      .catch((e) => e);
  };
}

export function DownloadLink(props) {
  const { session } = useSession();
  const { type, iri, className } = props;

  if (type.match(/container/i)) return null;

  return (
    <Button
      data-testid={TESTCAFE_ID_DOWNLOAD_BUTTON}
      variant="contained"
      onClick={downloadResource(iri, session.fetch)}
      className={className}
    >
      Download
    </Button>
  );
}

DownloadLink.propTypes = {
  type: T.string.isRequired,
  iri: T.string.isRequired,
  className: T.string,
};

DownloadLink.defaultProps = {
  className: null,
};

/* eslint react/jsx-props-no-spreading: 0 */
const SharingLink = React.forwardRef((linkProps, ref) => (
  <ResourceLink
    {...linkProps}
    data-testid={TESTCAFE_ID_SHARE_PERMISSIONS_BUTTON}
    action={DETAILS_CONTEXT_ACTIONS.SHARING}
    ref={ref}
  />
));

export default function ResourceDetails({ resource, onDelete, onDeleteError }) {
  const classes = useStyles();
  const { iri, name, types } = resource;
  const type = displayType(types);

  return (
    <>
      <section className={classes.headerSection}>
        <h3
          data-testid={TESTCAFE_ID_TITLE}
          className={classes["content-h3"]}
          title={iri}
        >
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

ResourceDetails.propTypes = {
  resource: T.shape({
    iri: T.string.isRequired,
    name: T.string.isRequired,
    types: T.arrayOf(T.string).isRequired,
  }),
  onDelete: T.func,
  onDeleteError: T.func,
};

ResourceDetails.defaultProps = {
  resource: {
    iri: "",
    name: "",
    types: [],
  },
  onDelete: () => {},
  onDeleteError: () => {},
};
