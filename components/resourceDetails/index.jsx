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

import React, { useContext, useEffect } from "react";
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
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getContentType, getSourceUrl } from "@inrupt/solid-client";
import styles from "./styles";
import DeleteResourceButton from "../deleteResourceButton";
import DownloadLink from "../downloadLink";
import ResourceSharing from "./resourceSharing";
import { getIriPath } from "../../src/solidClientHelpers/utils";
import { getResourceName } from "../../src/solidClientHelpers/resource";
import AccessControlContext from "../../src/contexts/accessControlContext";
import SharingAccordion from "./resourceSharing/sharingAccordion";
import useLocalStorage from "../../src/hooks/useLocalStorage";
import { isAcp, isWac } from "../../src/accessControl";
import { PermissionsContextProvider } from "../../src/contexts/permissionsContext";
import useAllPermissions from "../../src/hooks/useAllPermissions";

const TESTCAFE_ID_DOWNLOAD_BUTTON = "download-resource-button";
const TESTCAFE_ID_DELETE_BUTTON = "delete-resource-button";
const TESTCAFE_ID_ACCORDION_ACTIONS = "accordion-resource-actions-trigger";
export const TESTCAFE_ID_ACCORDION_DETAILS =
  "accordion-resource-details-trigger";
export const TESTCAFE_ID_ACCORDION_PERMISSIONS =
  "accordion-resource-permissions";
export const TESTCAFE_ID_ACCORDION_SHARING = "accordion-resource-sharing";
const TESTCAFE_ID_TITLE = "resource-title";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

function getAccordionKey(dataset, name) {
  return `${getSourceUrl(dataset)}-${name}`;
}

export default function ResourceDetails({
  onDelete,
  onDeleteCurrentContainer,
}) {
  const { solidDataset: dataset } = useContext(DatasetContext);
  const datasetUrl = getSourceUrl(dataset);
  const classes = useStyles();
  const name = getIriPath(datasetUrl);
  const displayName = getResourceName(name);
  const type = getContentType(dataset);
  const actionMenuBem = ActionMenu.useBem();
  const { permissions, getPermissions } = useAllPermissions();
  const { accessControl, accessControlType } = useContext(AccessControlContext);
  const resourceIri = getSourceUrl(dataset);
  const { session } = useSession();

  const [actionsAccordion, setActionsAccordion] = useLocalStorage(
    getAccordionKey(dataset, "actions"),
    true
  );
  const [detailsAccordion, setDetailsAccordion] = useLocalStorage(
    getAccordionKey(dataset, "details"),
    false
  );
  const [permissionsAccordion, setPermissionsAccordion] = useLocalStorage(
    getAccordionKey(dataset, "permissions"),
    false
  );
  const [sharingAccordion, setSharingAccordion] = useLocalStorage(
    getAccordionKey(dataset, "sharing"),
    false
  );

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

      <Accordion
        expanded={actionsAccordion}
        onChange={() => setActionsAccordion(!actionsAccordion)}
      >
        <AccordionSummary
          expandIcon={expandIcon}
          data-testid={TESTCAFE_ID_ACCORDION_ACTIONS}
        >
          Actions
        </AccordionSummary>
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
              <DeleteResourceButton
                className={actionMenuBem("action-menu__trigger", "danger")}
                resourceIri={datasetUrl}
                name={displayName}
                onDelete={onDelete}
                onDeleteCurrentContainer={onDeleteCurrentContainer}
                data-testid={TESTCAFE_ID_DELETE_BUTTON}
              />
            </ActionMenuItem>
          </ActionMenu>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={detailsAccordion}
        onChange={() => setDetailsAccordion(!detailsAccordion)}
      >
        <AccordionSummary
          expandIcon={expandIcon}
          data-testid={TESTCAFE_ID_ACCORDION_DETAILS}
        >
          Details
        </AccordionSummary>
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

      {accessControl && ( // only show when we know user has control access
        <>
          {isWac(accessControlType) && (
            <Accordion
              expanded={permissionsAccordion}
              onChange={() => setPermissionsAccordion(!permissionsAccordion)}
            >
              <AccordionSummary
                expandIcon={expandIcon}
                data-testid={TESTCAFE_ID_ACCORDION_PERMISSIONS}
              >
                Permissions
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                <ResourceSharing />
              </AccordionDetails>
            </Accordion>
          )}
          {/* are there permissions? */}
          {isAcp(accessControlType) && (
            <Accordion
              expanded={sharingAccordion}
              onChange={() => setSharingAccordion(!sharingAccordion)}
            >
              <AccordionSummary
                expandIcon={expandIcon}
                data-testid={TESTCAFE_ID_ACCORDION_SHARING}
              >
                Sharing
              </AccordionSummary>
              <AccordionDetails className={classes.accordionDetails}>
                {/* <PermissionsContextProvider> */}
                <SharingAccordion />
                {/* </PermissionsContextProvider> */}
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
    </>
  );
}

ResourceDetails.propTypes = {
  onDelete: T.func,
  onDeleteCurrentContainer: T.func,
};

ResourceDetails.defaultProps = {
  onDelete: () => {},
  onDeleteCurrentContainer: () => {},
};
