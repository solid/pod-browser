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
import { createStyles, ListItem, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { getResourceName } from "../../../../../../src/solidClientHelpers/resource";
import ConfirmationDialogContext from "../../../../../../src/contexts/confirmationDialogContext";
import ConsentDetailsModalContent from "./consentDetailsModalContent";
import styles from "./styles";

export const TESTCAFE_ID_VIEW_DETAILS_BUTTON = "view-details-button";

export const VIEW_DETAILS_CONFIRMATION_DIALOG =
  "view-details-confirmation-dialog";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentDetailsButton({ agentWebId, resourceIri }) {
  const classes = useStyles();
  const {
    setContent,
    setOpen,
    setTitle,
    setConfirmText,
    setCancelText,
    setIsDangerousAction,
    closeDialog,
  } = useContext(ConfirmationDialogContext);
  const resourceName = getResourceName(resourceIri);

  const openModal = () => {
    setIsDangerousAction(true);
    setOpen(VIEW_DETAILS_CONFIRMATION_DIALOG);
    setTitle(``);
    setCancelText("Done");
    setConfirmText(`Revoke Access to ${resourceName}`);
    setContent(
      <ConsentDetailsModalContent
        agentWebId={agentWebId}
        resourceIri={resourceIri}
        closeDialog={closeDialog}
      />
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
  agentWebId: T.string.isRequired,
  resourceIri: T.string,
};

ConsentDetailsButton.defaultProps = {
  resourceIri: null,
};
