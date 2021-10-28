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

import React, { useContext, useEffect } from "react";
import { revokeAccess } from "@inrupt/solid-client-access-grants";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import { createStyles, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { getResourceName } from "../../../../../../src/solidClientHelpers/resource";
import { permission as permissionPropType } from "../../../../../../constants/propTypes";
import ConfirmationDialogContext from "../../../../../../src/contexts/confirmationDialogContext";
import ConsentDetailsModalContent from "./consentDetailsModalContent";
import styles from "./styles";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";

export const VIEW_DETAILS_CONFIRMATION_DIALOG =
  "view-details-confirmation-dialog";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentDetailsButton({ resourceIri, permission }) {
  const { vc } = permission;
  const { fetch } = useSession();
  const classes = useStyles();
  const {
    confirmed,
    setContent,
    setCustomContentWrapper,
    setOpen,
    setTitle,
    setConfirmText,
    setCancelText,
    setIsDangerousAction,
    closeDialog,
  } = useContext(ConfirmationDialogContext);
  const resourceName = getResourceName(resourceIri);

  useEffect(() => {
    if (confirmed) {
      revokeAccess(vc, { fetch });
    }
  }, [confirmed, fetch, vc]);

  const openModal = () => {
    setIsDangerousAction(true);
    setCustomContentWrapper(true);
    setOpen(VIEW_DETAILS_CONFIRMATION_DIALOG);
    setTitle(``);
    setCancelText("Done");
    setConfirmText(`Revoke Access to ${resourceName}`);
    setContent(
      <div>
        <ConsentDetailsModalContent
          permission={permission}
          closeDialog={closeDialog}
        />
      </div>
    );
  };

  return (
    <ListItem
      data-testid={TESTCAFE_ID_VIEW_DETAILS_BUTTON}
      button
      onClick={openModal}
    >
      <ListItemText
        disableTypography
        classes={{ primary: classes.listItemText }}
      >
        View Details
      </ListItemText>
    </ListItem>
  );
}

ConsentDetailsButton.propTypes = {
  resourceIri: T.string,
  permission: permissionPropType.isRequired,
};

ConsentDetailsButton.defaultProps = {
  resourceIri: null,
};
