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

import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  createStyles,
  Divider,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ActionMenu, ActionMenuItem } from "@inrupt/prism-react-components";
import ResourceLink from "../resourceLink";
import styles from "./styles";
import DeleteLink from "../deleteLink";
import DownloadLink from "../downloadLink";
import ResourceSharing from "./resourceSharing";

const TESTCAFE_ID_DOWNLOAD_BUTTON = "download-resource-button";
const TESTCAFE_ID_SHARE_PERMISSIONS_BUTTON = "share-permissions-button";
const TESTCAFE_ID_TITLE = "resource-title";

export function displayType(types) {
  if (!types || types.length === 0) return "Resource";
  const [type] = types;
  return type;
}

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ResourceDetails({ resource, onDelete, onDeleteError }) {
  const [sharingExpanded, setSharingExpanded] = useState(false);
  const classes = useStyles();
  const {
    iri,
    name,
    types,
    permissions,
    defaultPermissions,
    dataset,
  } = resource;
  const type = displayType(types);
  const actionMenuBem = ActionMenu.useBem();

  const expandIcon = <ExpandMoreIcon />;
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

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={expandIcon}>Actions</AccordionSummary>
        <AccordionDetails>
          <ActionMenu>
            <ActionMenuItem>
              <DownloadLink
                className={actionMenuBem("action-menu__trigger")}
                data-testid={TESTCAFE_ID_DOWNLOAD_BUTTON}
                iri={iri}
                type={type}
              >
                Download
              </DownloadLink>
            </ActionMenuItem>
            <ActionMenuItem>
              <button
                className={actionMenuBem("action-menu__trigger")}
                data-testid={TESTCAFE_ID_SHARE_PERMISSIONS_BUTTON}
                type="button"
                onClick={() => setSharingExpanded(true)}
              >
                Sharing & App Permissions
              </button>
            </ActionMenuItem>
            <ActionMenuItem>
              <DeleteLink
                className={actionMenuBem("action-menu__trigger", "danger")}
                resourceIri={iri}
                name={name}
                onDelete={onDelete}
                onDeleteError={onDeleteError}
                data-testid={TESTCAFE_ID_DOWNLOAD_BUTTON}
              >
                Delete
              </DeleteLink>
            </ActionMenuItem>
          </ActionMenu>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={expandIcon}>Details</AccordionSummary>
        <AccordionDetails>
          <section className={classes.centeredSection}>
            <List>
              <ListItem className={classes.listItem}>
                <Typography className={classes.detailText}>
                  Thing Type:
                </Typography>
                <Typography
                  className={`${classes.typeValue} ${classes.detailText}`}
                >
                  {type}
                </Typography>
              </ListItem>
            </List>
          </section>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={sharingExpanded}
        onChange={() => setSharingExpanded(!sharingExpanded)}
      >
        <AccordionSummary expandIcon={expandIcon}>Permissions</AccordionSummary>
        <AccordionDetails>
          <div>
            <ResourceSharing
              iri={iri}
              permissions={permissions}
              defaultPermissions={defaultPermissions}
              dataset={dataset}
            />
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

ResourceDetails.propTypes = {
  resource: T.shape({
    iri: T.string.isRequired,
    name: T.string.isRequired,
    types: T.arrayOf(T.string).isRequired,
    permissions: T.arrayOf(T.object).isRequired,
    defaultPermissions: T.arrayOf(T.object).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    dataset: T.object.isRequired,
  }),
  onDelete: T.func,
  onDeleteError: T.func,
};

ResourceDetails.defaultProps = {
  resource: {
    iri: "",
    name: "",
    types: [],
    permissions: [],
    defaultPermissions: [],
    dataset: null,
  },
  onDelete: () => {},
  onDeleteError: () => {},
};
