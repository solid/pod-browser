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

/* eslint-disable react/jsx-one-expression-per-line */

import React, { useState } from "react";
import T from "prop-types";
import { Icons } from "@inrupt/prism-react-components";
import {
  createStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { foaf } from "rdf-namespaces";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { CombinedDataProvider, Text } from "@inrupt/solid-ui-react";
import { Alert } from "@material-ui/lab";
import { isHTTPError } from "../../../../../../../src/error";
import styles from "./styles";
import ModalAvatar from "../consentDetailsModalAvatar";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentDetailsModalContent({
  agentWebId,
  resourceIri,
  closeDialog,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  const [error, setError] = useState(null);

  // TODO replace with toast error or something?
  if (error) {
    if (isHTTPError(error, 404)) {
      return (
        <Alert severity="error">
          {`Cannot fetch avatar for this WebID: ${agentWebId}`}
        </Alert>
      );
    }
    return error.toString();
  }

  return (
    <CombinedDataProvider
      datasetUrl={agentWebId}
      thingUrl={agentWebId}
      onError={setError}
    >
      <div className={bem("access-details", "wrapper")}>
        <span className={bem("access-details", "title")}>
          <h2>
            <ModalAvatar profileIri={agentWebId} closeDialog={closeDialog} />
          </h2>
        </span>
        {/* FIXME: display all below details based on retrieved VC */}
        <section className={bem("access-details", "section")}>
          <h3 className={bem("access-details", "section-header")}>Access</h3>
          <hr className={bem("access-details", "separator")} />
          <List>
            <ListItem>
              <ListItemIcon classes={{ root: classes.listItemIcon }}>
                <Icons
                  name="view"
                  className={bem("access-details", "section-icon")}
                />
              </ListItemIcon>
              <ListItemText
                classes={{
                  root: classes.listItemText,
                  primary: classes.listItemTitleText,
                  secondary: classes.listItemSecondaryText,
                }}
                primary="View"
                secondary="can see this resource"
              />
            </ListItem>
          </List>
        </section>
        <section className={bem("access-details", "section")}>
          <h3 className={bem("access-details", "section-header")}>
            Approved On
          </h3>
          <hr className={bem("access-details", "separator")} />
          <p>3/12/2020</p>
        </section>
        <section className={bem("access-details", "section")}>
          <h3 className={bem("access-details", "section-header")}>Purpose</h3>
          <hr className={bem("access-details", "separator")} />
          <p>Commercial Interest</p>
        </section>
        <section className={bem("access-details", "section")}>
          <h3 className={bem("access-details", "section-header")}>
            Access Duration
          </h3>
          <hr className={bem("access-details", "separator")} />
          <p>
            <Text className={classes.avatarText} property={foaf.name} /> has
            access until <strong>May 20, 2022</strong>
          </p>
        </section>
      </div>
    </CombinedDataProvider>
  );
}

ConsentDetailsModalContent.propTypes = {
  agentWebId: T.string.isRequired,
  resourceIri: T.string,
  closeDialog: T.func.isRequired,
};

ConsentDetailsModalContent.defaultProps = {
  resourceIri: null,
};
