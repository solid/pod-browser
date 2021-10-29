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

import React from "react";
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
import { format } from "date-fns";
import { getAcpAccessDetails } from "../../../../../../../src/accessControl/acp";
import { permission as permissionPropType } from "../../../../../../../constants/propTypes";
import ModalAvatar from "../consentDetailsModalAvatar";
import InfoTooltip from "../../../../../../infoTooltip";
import {
  getExpiryDate,
  getIssuanceDate,
} from "../../../../../../../src/models/consent/request";
import { getPurposeUrlsFromSignedVc } from "../../../../../../../src/models/consent/signedVc";
import styles from "./styles";

export const TESTCAFE_ID_CONSENT_DETAILS_CONTENT = "consent-details-content";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentDetailsModalContent({
  permission,
  closeDialog,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
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

  return (
    <div
      className={bem("access-details", "wrapper")}
      data-testid={TESTCAFE_ID_CONSENT_DETAILS_CONTENT}
    >
      <span className={bem("access-details", "title")}>
        <h2>
          <CombinedDataProvider datasetUrl={agentWebId} thingUrl={agentWebId}>
            <ModalAvatar profileIri={agentWebId} closeDialog={closeDialog} />
          </CombinedDataProvider>
        </h2>
      </span>
      <section className={bem("access-details", "section")}>
        <h3 className={bem("access-details", "section-header")}>Access</h3>
        <hr className={bem("access-details", "separator")} />
        <List>
          {sortedAccessDetails?.map(({ name, icon, description }) => {
            return (
              <ListItem key={name}>
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
      </section>
      <section className={bem("access-details", "section")}>
        <h3 className={bem("access-details", "section-header")}>Approved On</h3>
        <hr className={bem("access-details", "separator")} />
        <p>{issuanceDate}</p>
      </section>
      <section className={bem("access-details", "section")}>
        <h3 className={bem("access-details", "section-header")}>Purpose</h3>
        <hr className={bem("access-details", "separator")} />
        <div className={bem("purposes-container")}>
          {Array.isArray(purposes) ? (
            <List>
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
      </section>
      {expirationDate && (
        <section className={bem("access-details", "section")}>
          <h3 className={bem("access-details", "section-header")}>
            Access Duration
          </h3>
          <hr className={bem("access-details", "separator")} />
          <p>
            <Text className={classes.avatarText} property={foaf.name} /> has
            access until <strong>{expirationDate}</strong>.
          </p>
        </section>
      )}
    </div>
  );
}

ConsentDetailsModalContent.propTypes = {
  permission: permissionPropType.isRequired,
  closeDialog: T.func.isRequired,
};
