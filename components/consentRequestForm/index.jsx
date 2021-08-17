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
import { Button, Icons } from "@inrupt/prism-react-components";
import { getStringNoLocale } from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import { format } from "date-fns";
import { DatePicker } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/styles";
import {
  createStyles,
  Typography,
  IconButton,
  InputBase,
} from "@material-ui/core";
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
const DENY_ACCESS_DIALOG_TITLE = "Deny all access?";
export const CONSENT_REQUEST_NO_ACCESS_DIALOG =
  "consent-request-no-access-dialog";
export const TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON =
  "consent-request-submit-button";
export const TESTCAFE_ID_CONSENT_REQUEST_DENY_BUTTON =
  "consent-request-deny-button";
const CONFIRM_TEXT = "Continue with no access";
const DENY_TEXT = "Deny All Access";

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

  const handleDenyAccess = () => {
    setConfirmationSetup(true);
    setTitle(DENY_ACCESS_DIALOG_TITLE);
    setConfirmText(DENY_TEXT);
    setContent(DIALOG_CONTENT);
    setOpen(CONSENT_REQUEST_NO_ACCESS_DIALOG);
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
  const expirationDate = consentRequest?.expirationDate;
  // FIXME: we will later fetch the expiry date from the consent details
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [datepickerOpen, setDatepickerOpen] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDatepickerOpen(false);
  };

  const setDateForever = () => {
    setSelectedDate(null);
    setDatepickerOpen(false);
  };

  useEffect(() => {
    if (expirationDate) {
      setSelectedDate(new Date(expirationDate));
    }
  }, [expirationDate]);

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
        <span className={bem("request-container__header-text", "small")}>
          {`${agentName} will have access until`}
        </span>
        <div className={bem("date-container")}>
          <InputBase
            classes={{ root: bem("date-input") }}
            placeholder="Consent expiry date"
            value={
              selectedDate ? format(selectedDate, "MMMM' 'd', 'Y") : "Forever"
            }
            inputProps={{
              // "data-testid": TESTCAFE_ID_SEARCH_INPUT,
              "aria-label": "Consent expiry date",
              readOnly: "readonly",
            }}
          />
          <IconButton
            type="button"
            aria-label="Set expiry date"
            edge="end"
            onClick={() => setDatepickerOpen(!datepickerOpen)}
          >
            <Icons name="calendar" className={bem("icon-small--primary")} />
          </IconButton>
          {datepickerOpen && (
            <div className={bem("date-picker")}>
              <DatePicker
                orientation="portrait"
                clearLabel="forever"
                variant="static"
                disablePast
                format="MM/dd/yyyy"
                margin="normal"
                value={selectedDate}
                onChange={handleDateChange}
              />
              <Button
                type="button"
                variant="small"
                onClick={() => setDateForever()}
                className={bem("request-container__button", "full-width")}
              >
                Forever
              </Button>
            </div>
          )}
        </div>
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
            data-testid={TESTCAFE_ID_CONSENT_REQUEST_DENY_BUTTON}
            variant="secondary"
            type="button"
            className={bem("request-container__button")}
            onClick={handleDenyAccess}
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
