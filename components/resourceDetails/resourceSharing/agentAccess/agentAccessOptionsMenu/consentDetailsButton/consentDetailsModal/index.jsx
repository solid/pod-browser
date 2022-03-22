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
import T from "prop-types";
import {
  Icons,
  ModalBody,
  ModalContainer,
  Button,
  Modal,
  LinkButton,
} from "@inrupt/prism-react-components";
import { revokeAccessGrant } from "@inrupt/solid-client-access-grants";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import {
  CombinedDataProvider,
  Image,
  useSession,
} from "@inrupt/solid-ui-react";
import { format } from "date-fns";
import { vcard } from "rdf-namespaces";
import {
  createStyles,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@material-ui/core";
import { permission as permissionPropType } from "../../../../../../../constants/propTypes";
import { getAcpAccessDetails } from "../../../../../../../src/accessControl/acp";
import InfoTooltip from "../../../../../../infoTooltip";
import {
  getExpiryDate,
  getIssuanceDate,
} from "../../../../../../../src/models/consent/request";
import { getPurposeUrlsFromSignedVc } from "../../../../../../../src/models/consent/signedVc";
import styles from "./styles";
import AgentName from "../agentName";
import { getResourceName } from "../../../../../../../src/solidClientHelpers/resource";

// export const TESTCAFE_ID_CONSENT_DETAILS_CONTENT = "consent-details-modal";
export const TESTCAFE_ID_CONSENT_DETAILS_MODAL = "consent-details-modal";
export const TESTCAFE_ID_RESOURCE_DETAILS_REVOKE_ACCESS_LINK =
  "resource-details-revoke";
export const TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON = "consent-details-done";
export const TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON =
  "consent-details-revoke";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
export function setupErrorComponent(bem) {
  return () => (
    <Avatar className={bem("avatar")} alt="Contact photo placeholder" />
  );
}
export default function ConsentDetailsModal({
  resourceIri,
  vc,
  webId,
  agentPermissionInfo,
  handleCloseModal,
  openModal,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  // const { vc, webId: agentWebId } = permission;
  const errorComponent = setupErrorComponent(bem);
  const allowModes = vc?.credentialSubject?.providedConsent?.mode; // this will always be false in current implementation
  const modes = allowModes?.map((mode) => ({
    read: !!mode.includes("Read"),
    write: !!mode.includes("Write"),
    append: !!mode.includes("Append"),
    control: !!mode.includes("Control"),
  }));
  const resourceName = getResourceName(resourceIri);
  const accessDetails = modes?.map((mode) => getAcpAccessDetails(mode));
  const viewOrder = ["View", "Edit", "Add", "Share", "View Sharing"];
  const sortedAccessDetails = accessDetails?.sort(
    (a, b) => viewOrder.indexOf(a.name) - viewOrder.indexOf(b.name)
  );
  const expirationDate = getExpiryDate(vc)
    ? format(new Date(getExpiryDate(vc)), "MMMM' 'd', 'Y")
    : false;
  const issuanceDate = format(new Date(getIssuanceDate(vc)), "M/dd/Y");
  const purposes = getPurposeUrlsFromSignedVc(vc);
  const { fetch } = useSession();

  const handleRevoke = () => {
    revokeAccessGrant(vc, { fetch });
    handleCloseModal();
  };
  return (
    <Modal
      open={openModal}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClose={handleCloseModal}
      aria-labelledby={`${resourceIri} Modal`}
      aria-describedby={`${resourceIri} for this resource`}
    >
      <ModalContainer
        className={classes.paper}
        data-testid={TESTCAFE_ID_CONSENT_DETAILS_MODAL}
      >
        <ModalBody className={bem("access-details", "wrapper")}>
          <Grid container>
            <Grid className={bem("access-details", "title")} container>
              <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
                <Grid
                  className={bem("access-details", "avatar-container")}
                  container
                  item
                  xs={12}
                  sm={2}
                >
                  <Image
                    profileIri={webId}
                    property={vcard.hasPhoto}
                    errorComponent={errorComponent}
                  />
                </Grid>
                <Grid item xs={12} sm={10}>
                  <AgentName
                    className={bem("access-details", "agent-name")}
                    agentWebId={webId}
                    link
                  />
                </Grid>
              </CombinedDataProvider>
            </Grid>

            <Grid className={bem("access-details", "section")} container>
              <Grid justify="space-between" container item>
                <h3 className={bem("access-details", "section-header")}>
                  Access
                </h3>
                {/* <Button variant="outlined">
                <Icons
                  className={bem("access-details", "edit-icon")}
                  name="edit"
                />
                {`Edit`.toUpperCase()}
              </Button> */}
              </Grid>

              <Grid item>
                <hr className={bem("access-details", "separator")} />
                <List dense style={{ overflow: "visable" }}>
                  {sortedAccessDetails?.map(({ name, icon, description }) => (
                    <ListItem key={name} style={{ padding: "0px" }}>
                      <ListItemIcon classes={{ root: classes.listItemIcon }}>
                        <Icons
                          name={icon}
                          className={bem("access-details", "section-icon")}
                        />
                      </ListItemIcon>
                      <ListItemText
                        classes={{
                          root: classes.listItemText,
                          primary: classes.listItemTitleText,
                          secondary: classes.listItemSecondaryText,
                        }}
                        key={name}
                        primary={name}
                        secondary={description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item>
                <h3 className={bem("access-details", "section-header")}>
                  Approved On
                </h3>
                <hr className={bem("access-details", "separator")} />
                <p>{issuanceDate}</p>
              </Grid>
              <Grid item>
                <h3 className={bem("access-details", "section-header")}>
                  Purpose
                </h3>
                <hr className={bem("access-details", "separator")} />
                <div className={bem("purposes-container")}>
                  {Array.isArray(purposes) ? (
                    <List dense style={{ overflow: "visable" }}>
                      {purposes?.map((purpose) => (
                        <ListItem key={purpose} className={bem("list-item")}>
                          <span className={bem("purpose")}>
                            {purpose} <InfoTooltip tooltipText={purpose} />
                          </span>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <span className={bem("purpose")}>
                      {purposes} <InfoTooltip tooltipText={purposes} />
                    </span>
                  )}
                </div>
              </Grid>
              <Grid item>
                {expirationDate && (
                  <Grid container>
                    <h3 className={bem("access-details", "section-header")}>
                      Access Duration
                    </h3>
                    {/* <Button variant="outlined">
                <Icons
                  className={bem("access-details", "edit-icon")}
                  name="edit"
                />
                {`Edit`.toUpperCase()}
              </Button> */}
                    <hr className={bem("access-details", "separator")} />
                    <span>
                      <AgentName agentWebId={webId} />
                      has access until <strong>{expirationDate}</strong>.
                    </span>
                  </Grid>
                )}
              </Grid>
            </Grid>

            <Grid
              container
              className={bem("access-details", "action-container")}
            >
              <Grid item xs={12} sm={6}>
                <LinkButton
                  className={bem("access-details", "revoke-text")}
                  variant="secondary"
                  onClick={handleRevoke}
                  data-testid={TESTCAFE_ID_CONSENT_DETAILS_REVOKE_BUTTON}
                >
                  {`Revoke access to ${resourceName}`}
                </LinkButton>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Button
                  type="submit"
                  onClick={handleCloseModal}
                  data-testid={TESTCAFE_ID_CONSENT_DETAILS_DONE_BUTTON}
                >
                  Done
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </ModalBody>
      </ModalContainer>
    </Modal>
  );
}
ConsentDetailsModal.propTypes = {
  resourceIri: T.string.isRequired,
  permission: permissionPropType.isRequired,
  handleCloseModal: T.func.isRequired,
  openModal: T.bool.isRequired,
};
