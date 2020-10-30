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

import React, { useContext } from "react";
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
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ActionMenu, ActionMenuItem } from "@inrupt/prism-react-components";
import { DatasetContext } from "@inrupt/solid-ui-react";
import { getContentType, getSourceUrl } from "@inrupt/solid-client";
import styles from "./styles";
import DeleteResourceLink from "../deleteResourceLink";
import DownloadLink from "../downloadLink";
import ResourceSharing from "./resourceSharing";
import { getIriPath } from "../../src/solidClientHelpers/utils";
import { getResourceName } from "../../src/solidClientHelpers/resource";

const TESTCAFE_ID_DOWNLOAD_BUTTON = "download-resource-button";
const TESTCAFE_ID_TITLE = "resource-title";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ResourceDetails({ onDelete }) {
  const { dataset } = useContext(DatasetContext);
  const datasetUrl = getSourceUrl(dataset);
  const classes = useStyles();
  const name = getIriPath(datasetUrl);
  const displayName = getResourceName(name);
  const type = getContentType(dataset);
  const actionMenuBem = ActionMenu.useBem();

  const expandIcon = <ExpandMoreIcon />;
  return (
    <>
      <section className={classes.headerSection}>
        <h3
          data-testid={TESTCAFE_ID_TITLE}
          className={classes["content-h3"]}
          title={datasetUrl}
        >
          {displayName}
        </h3>
      </section>

      <Divider />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={expandIcon}>Actions</AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <ActionMenu>
            <ActionMenuItem>
              <DownloadLink
                className={actionMenuBem("action-menu__trigger")}
                data-testid={TESTCAFE_ID_DOWNLOAD_BUTTON}
                iri={datasetUrl}
              >
                Download
              </DownloadLink>
            </ActionMenuItem>
            <ActionMenuItem>
              <DeleteResourceLink
                className={actionMenuBem("action-menu__trigger", "danger")}
                resourceIri={datasetUrl}
                name={displayName}
                onDelete={onDelete}
                data-testid={TESTCAFE_ID_DOWNLOAD_BUTTON}
              />
            </ActionMenuItem>
          </ActionMenu>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={expandIcon}>Details</AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
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

      <Accordion>
        <AccordionSummary expandIcon={expandIcon}>Permissions</AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <ResourceSharing />
        </AccordionDetails>
      </Accordion>
    </>
  );
}

ResourceDetails.propTypes = {
  onDelete: T.func,
};

ResourceDetails.defaultProps = {
  onDelete: () => {},
};
