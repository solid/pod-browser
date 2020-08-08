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
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import ShareIcon from "@material-ui/icons/Share";
import DeleteIcon from "@material-ui/icons/Delete";
import Skeleton from "@material-ui/lab/Skeleton";
import { PrismTheme } from "@solid/lit-prism-patterns";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { deleteFile } from "@inrupt/solid-client";

import { DETAILS_CONTEXT_ACTIONS } from "../../../src/contexts/detailsMenuContext";
import SessionContext from "../../../src/contexts/sessionContext";
import ResourceLink from "../../resourceLink";
import styles from "./styles";

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

interface Props {
  name?: string | null;
  iri?: string | null;
  onDelete: void;
}

/* eslint react/jsx-props-no-spreading: 0 */
const SharingLink = React.forwardRef((linkProps, ref) => (
  <ResourceLink
    {...linkProps}
    action={DETAILS_CONTEXT_ACTIONS.SHARING}
    ref={ref}
  />
));

/* eslint react/jsx-props-no-spreading: 0 */
/* eslint react/prop-types: 0 */
const DeleteLink = React.forwardRef(
  ({ resourceIri, onDelete, ...linkProps }, ref) => {
    const { session } = useContext(SessionContext);

    async function deleteResource() {
      await deleteFile(resourceIri, { fetch: session.fetch });
      onDelete();
    }

    /* eslint jsx-a11y/anchor-has-content: 0 */
    return (
      <a href="#delete" {...linkProps} ref={ref} onClick={deleteResource} />
    );
  }
);

function DetailsLoading({ name, iri, onDelete }: Props): ReactElement {
  const classes = useStyles();

  return (
    <>
      <section className={classes.centeredSection}>
        <h3 className={classes["content-h3"]} title={iri || ""}>
          {name || <Skeleton width={100} />}
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
            onDelete={onDelete}
          >
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete File" />
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
            <Skeleton width={150} />
          </ListItem>
        </List>
      </section>

      <Divider />
    </>
  );
}

DetailsLoading.defaultProps = {
  name: null,
  iri: null,
};

export default DetailsLoading;
