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

import React, { useContext, useEffect, useState } from "react";
import { Button } from "@inrupt/prism-react-components";
import { getStringNoLocale } from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import { makeStyles } from "@material-ui/styles";
import { createStyles, Typography } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import ConsentRequestContext from "../../src/contexts/consentRequestContext";
import InfoTooltip from "../infoTooltip";
import RequestSection from "./requestSection";
import styles from "./styles";
import { mockApp } from "../../__testUtils/mockApp";
import {
  getPurposeString,
  getPurposeUrl,
  getRequestedAccesses,
} from "../../src/models/consent/request";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import ConfirmationDialog from "../confirmationDialog";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const NO_ACCESS_DIALOG_TITLE = "Your haven't selected any access";
export const CONSENT_REQUEST_NO_ACCESS_DIALOG =
  "consent-request-no-access-dialog";
export const TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON =
  "consent-request-submit-button";
export const TESTCAFE_ID_CONSENT_REQUEST_DENY_BUTTON =
  "consent-request-deny-button";
const CONFIRM_TEXT = "Continue with no access";

export default function ConsentRequestFrom() {
  const classes = useStyles();
  const bem = useBem(classes);
  const { consentRequest } = useContext(ConsentRequestContext);
  const [selectedAccess, setSelectedAccess] = useState([]);
  // FIXME: using a mock for the app profile - we will fetch profile later
  const agentProfile = mockApp();
  const agentName = getStringNoLocale(agentProfile, foaf.name);
  const purposeUrl = getPurposeUrl(consentRequest);
  // FIXME: we will later fetch the description from the purpose Url
  const purposeDescription = getPurposeString();
  const {
    confirmed,
    open,
    setContent,
    setOpen,
    setTitle,
    closeDialog,
    setConfirmText,
  } = useContext(ConfirmationDialogContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);

  const DIALOG_CONTENT = `${agentName} will not have access to anything in your Pod.`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedAccess.length) {
      setConfirmationSetup(false);
      return;
    }
    setConfirmationSetup(true);
    setOpen(CONSENT_REQUEST_NO_ACCESS_DIALOG);
    setTitle(NO_ACCESS_DIALOG_TITLE);
    setConfirmText(CONFIRM_TEXT);
    setContent(DIALOG_CONTENT);
  };

  useEffect(() => {
    if (
      confirmationSetup &&
      confirmed === null &&
      open === CONSENT_REQUEST_NO_ACCESS_DIALOG
    )
      return;

    if (
      confirmationSetup &&
      confirmed &&
      open === CONSENT_REQUEST_NO_ACCESS_DIALOG
    ) {
      closeDialog(); // FIXME: do something with the access request
    }

    if (confirmed !== null) {
      closeDialog();
      setConfirmationSetup(false);
    }
  }, [confirmationSetup, confirmed, closeDialog, open]);

  const requestedAccesses = getRequestedAccesses(consentRequest);

  return (
    <>
      <form
        className={bem("request-container__content", "main")}
        onSubmit={handleSubmit}
      >
        <Typography component="h2" align="center" variant="h1">
          <span className={bem("agent-name")}>Allow {agentName} access?</span>
        </Typography>
        <span className={bem("purpose")}>
          {purposeDescription}{" "}
          <InfoTooltip tooltipText={purposeUrl || "Purpose"} />
        </span>
        {/* FIXME: place this in a loop when we know the data structure */}
        {requestedAccesses &&
          agentName &&
          requestedAccesses.map((consent, index) => {
            return (
              <RequestSection
                // eslint-disable-next-line react/no-array-index-key
                key={`consent-request-section-${index}`}
                agentName={agentName}
                sectionDetails={consent}
                selectedAccess={selectedAccess}
                setSelectedAccess={setSelectedAccess}
              />
            );
          })}
        <div className={bem("form__controls")}>
          <Button
            variant="secondary"
            className={bem("request-container__button")}
          >
            Deny all access
          </Button>
          <Button
            data-testid={TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON}
            type="submit"
            className={bem("request-container__button")}
          >
            Confirm Access
          </Button>
        </div>
      </form>
      <ConfirmationDialog />
    </>
  );
}
