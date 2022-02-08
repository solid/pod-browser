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

import React, { useContext } from "react";
import T from "prop-types";
import {
  Icons,
  ModalBody,
  ModalContainer,
} from "@inrupt/prism-react-components";
import {
  Button,
  createStyles,
  Icon,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@material-ui/core";
import { useRouter } from "next/router";

import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { CombinedDataProvider, Text, useSession } from "@inrupt/solid-ui-react";
import { format } from "date-fns";
import { foaf, vcard } from "rdf-namespaces";
import Avatar from "../../../../../../avatar";
import ConsentRequestContext from "../../../../../../../src/contexts/consentRequestContext";
import { getAcpAccessDetails } from "../../../../../../../src/accessControl/acp";
import InfoTooltip from "../../../../../../infoTooltip";
import {
  getExpiryDate,
  getIssuanceDate,
} from "../../../../../../../src/models/consent/request";
import { getPurposeUrlsFromSignedVc } from "../../../../../../../src/models/consent/signedVc";
import styles from "./styles";
import AgentName from "../agentName";
import { getAccessControl } from "../../../../../../../src/accessControl";
import usePodRootUri from "../../../../../../../src/hooks/usePodRootUri";
import { getPoliciesContainerUrl } from "../../../../../../../src/models/policy";
import AlertContext from "../../../../../../../src/contexts/alertContext";
import { revokeResourceAccess } from "../../../../helperFunctions";
import ModalAvatar from "../consentDetailsModalAvatar";
import Link from "next/link";
// import { buildProfileLink } from "../../profileLink";

export const TESTCAFE_ID_CONSENT_DETAILS_CONTENT = "consent-details-content";
export const TESTCAFE_ID_CONSENT_DETAILS_MODAL = "consent-details-modal";
export const TESTCAFE_ID_RESOURCE_DETAILS_REVOKE_ACCESS_LINK =
  "resource-details-revoke";
export const TESTCAFE_ID_RESOURCE_DETAILS_DONE_BUTTON = "resource-details-done";
export function setupErrorComponent(bem) {
  return () => (
    <Avatar className={bem("avatar")} alt="Contact photo placeholder" />
  );
}
const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentDetailsModal({ resourceIri }) {
  const classes = useStyles();
  const bem = useBem(classes);
  const router = useRouter();
  const { session } = useSession();
  const { alertError, alertSuccess } = useContext(AlertContext);
  const {
    openConsentDetailsModal,
    setOpenConsentDetailsModal,
    permission,
    setPermission,
    resourceName,
    setResourceName,
    accessList,
    resources,
  } = useContext(ConsentRequestContext);
  const errorComponent = setupErrorComponent(bem);
  const { vc, webId: agentWebId } = permission;
  const allowModes = vc?.credentialSubject?.providedConsent?.mode;
  const modes = allowModes?.map((mode) => {
    return {
      read: !!mode.includes("Read"),
      write: !!mode.includes("Write"),
      append: !!mode.includes("Append"),
      control: !!mode.includes("Control"),
    };
  });

  const accessDetails = modes?.map((mode) => {
    return getAcpAccessDetails(mode);
  });
  const order = ["View", "Edit", "Add", "Share", "View Sharing"];
  const sortedAccessDetails = accessDetails?.sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });
  const expirationDate = getExpiryDate(vc)
    ? format(new Date(getExpiryDate(vc)), "MMMM' 'd', 'Y")
    : false;
  const issuanceDate = format(new Date(getIssuanceDate(vc)), "M/dd/Y");
  const purposes = getPurposeUrlsFromSignedVc(vc);
  const podRoot = usePodRootUri(session.info.webId);
  const policiesContainer = podRoot && getPoliciesContainerUrl(podRoot);

  const handleRevoke = () => {
    revokeResourceAccess(
      resources,
      accessList,
      policiesContainer,
      agentWebId,
      alertError,
      alertSuccess
    );
    setOpenConsentDetailsModal(false);
    router.push("/privacy");
  };

  const handleClose = () => {
    setOpenConsentDetailsModal(false);
  };

  return (
    <ModalContainer
      className={classes.paper}
      data-testid={TESTCAFE_ID_CONSENT_DETAILS_MODAL}
      // ref={ref}
    >
      <ModalBody
        style={{
          wordBreak: "break-word",
        }}
      >
        <Grid
          container
          className={bem("access-details", "title")}
          style={{ alignItems: "center", justifyContent: "flex-start" }}
        >
          <CombinedDataProvider datasetUrl={agentWebId} thingUrl={agentWebId}>
            <Grid item xs={12} sm={1} style={{ flexShrink: 1 }}>
              <Avatar profileIri={agentWebId} />
              {/* <ModalAvatar profileIri={agentWebId} /> */}
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* <Link href={buildProfileLink(profileIri, "/privacy", path)}> */}

              <Text property={foaf.name || vcard.fn || vcard.webId} />
              {/* </Link> */}
            </Grid>
          </CombinedDataProvider>
        </Grid>

        <Grid
          container
          className={bem("access-details", "section")}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Grid
            item
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              height: "2rem",
              alignItems: "center",
            }}
            className={bem("access-details", "section")}
          >
            <h3 className={bem("access-details", "section-header")}>Access</h3>
            <Button
              classes={{ root: classes.editButton }}
              onClick={() => console.log("Edit access")}
              variant="outlined"
              color="secondary"
              style={{
                padding: "0px",
                height: "fit-content",
                color: "#7C4DFF",
                backgroundColor: "#FAFAFA",
                border: "#7C4DFF",
              }}
            >
              <Icons name="edit" style={{ color: "#7C4DFF" }} />
              {`Edit`.toUpperCase()}
            </Button>
          </Grid>
          <hr className={bem("access-details", "separator")} />
          <Divider />
          <Grid item className={bem("access-details", "section")}>
            <List dense style={{ overflow: "visable" }}>
              {sortedAccessDetails?.map(({ name, icon, description }) => {
                return (
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
                );
              })}
            </List>
          </Grid>
          <Grid item className={bem("access-details", "section")}>
            <h3 className={bem("access-details", "section-header")}>
              Approved On
            </h3>
            {/* <hr className={bem("access-details", "separator")} /> */}
            <Divider />
            <p>{issuanceDate}</p>
          </Grid>
          <Grid item className={bem("access-details", "section")}>
            <h3 className={bem("access-details", "section-header")}>Purpose</h3>
            <Divider />

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
          <Grid item className={bem("access-details", "section")}>
            {expirationDate && (
              <Grid container className={bem("access-details", "section")}>
                <h3 className={bem("access-details", "section-header")}>
                  Access Duration
                </h3>
                <Button
                  onClick={() => console.log("Edit access")}
                  variant="contained"
                >
                  <Icon />

                  {`Edit`.toUpperCase()}
                </Button>
                <hr className={bem("access-details", "separator")} />
                <span>
                  <AgentName agentWebId={agentWebId} />
                  has access until <strong>{expirationDate}</strong>.
                </span>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid container justifyContent="space-between">
          <Grid item xs={12} sm={6}>
            <Button
              variant="all-access"
              style={{ color: "red", textTransform: "none" }}
              /* istanbul ignore next */
              onClose={handleRevoke}
              accessList={accessList}
              resources={[resourceIri]}
            >
              {`Revoke access to ${resourceName}`}
            </Button>
          </Grid>

          <Grid item xs={12} sm={2} style={{ width: "50%" }}>
            <Button
              data-testid={TESTCAFE_ID_RESOURCE_DETAILS_DONE_BUTTON}
              type="submit"
              onClick={handleClose}
              variant="contained"
              fullWidth
            >
              Done
            </Button>
          </Grid>
        </Grid>
      </ModalBody>
    </ModalContainer>
  );
}
ConsentDetailsModal.propTypes = {
  resourceIri: T.string.isRequired,
};
