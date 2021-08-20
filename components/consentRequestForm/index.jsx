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
import {
  createStyles,
  ListItem,
  Typography,
  List,
  FormControlLabel,
} from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import ConsentRequestContext from "../../src/contexts/consentRequestContext";
import InfoTooltip from "../infoTooltip";
import RequestSection from "./requestSection";
import DateInput from "./dateInput";
import styles from "./styles";
import { mockApp } from "../../__testUtils/mockApp";
import {
  getPurposes,
  getRequestedAccesses,
} from "../../src/models/consent/request";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import ConfirmationDialog from "../confirmationDialog";
import PurposeCheckbox from "./purposeCheckBox";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const NO_ACCESS_DIALOG_TITLE = "Your haven't selected any access";
export const DENY_ACCESS_DIALOG_TITLE = "Deny all access?";
export const CONSENT_REQUEST_NO_ACCESS_DIALOG =
  "consent-request-no-access-dialog";
export const TESTCAFE_ID_CONSENT_REQUEST_SUBMIT_BUTTON =
  "consent-request-submit-button";
export const TESTCAFE_ID_CONSENT_REQUEST_DENY_BUTTON =
  "consent-request-deny-button";
export const CONFIRM_TEXT = "Continue with no access";
export const DENY_TEXT = "Deny All Access";
export const NO_PURPOSE_TITLE = "Select a purpose";

export default function ConsentRequestFrom() {
  const classes = useStyles();
  const bem = useBem(classes);
  const { consentRequest } = useContext(ConsentRequestContext);
  const [selectedAccess, setSelectedAccess] = useState([]);
  // FIXME: using a mock for the app profile - we will fetch profile later
  const agentProfile = mockApp();
  const agentName = getStringNoLocale(agentProfile, foaf.name);
  const purposes = getPurposes(consentRequest);
  const [selectedPurposes, setSelectedPurposes] = useState([]);

  // FIXME: we will later fetch the description from the purpose Url
  const {
    confirmed,
    open,
    setContent,
    setOpen,
    setTitle,
    closeDialog,
    setConfirmText,
    setOmitCancelButton,
  } = useContext(ConfirmationDialogContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);

  const DIALOG_CONTENT = `${agentName} will not have access to anything in your Pod.`;
  const NO_PURPOSE_CONTENT = `At least one purpose needs to be selected to approve access for ${agentName}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedAccess.length && selectedPurposes.length) {
      setConfirmationSetup(false);
      return;
    }
    if (!selectedPurposes.length) {
      setConfirmationSetup(true);
      setOpen(CONSENT_REQUEST_NO_ACCESS_DIALOG);
      setTitle(NO_PURPOSE_TITLE);
      setConfirmText("Ok");
      setOmitCancelButton(true);
      setContent(NO_PURPOSE_CONTENT);
    } else if (!selectedAccess.length) {
      setConfirmationSetup(true);
      setOmitCancelButton(false);
      setOpen(CONSENT_REQUEST_NO_ACCESS_DIALOG);
      setTitle(NO_ACCESS_DIALOG_TITLE);
      setConfirmText(CONFIRM_TEXT);
      setContent(DIALOG_CONTENT);
    }
  };

  const handleDenyAccess = () => {
    setConfirmationSetup(true);
    setOmitCancelButton(false);
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
  const handleSelectPurpose = (e) => {
    if (e.target.checked) {
      setSelectedPurposes((prevState) => [...prevState, e.target.value]);
    } else {
      setSelectedPurposes((prevState) =>
        prevState.filter((value) => value !== e.target.value)
      );
    }
  };

  return (
    <>
      <form
        className={bem("request-container__content", "main")}
        onSubmit={handleSubmit}
      >
        <Typography component="h2" align="center" variant="h1">
          <span className={bem("agent-name")}>Allow {agentName} access?</span>
        </Typography>
        {purposes?.length === 1 ? (
          <span className={bem("purpose")}>
            {purposes[0].description}{" "}
            <InfoTooltip tooltipText={purposes[0].url || "Purpose"} />
          </span>
        ) : (
          <div className={bem("purposes-container")}>
            Select the purposes you wish to allow:
            <List>
              {purposes?.map(({ url, description }) => (
                <ListItem key={url} className={bem("list-item")}>
                  <FormControlLabel
                    classes={{ label: classes.purposeLabel }}
                    label={description}
                    control={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <PurposeCheckbox
                        classes={classes}
                        url={url}
                        description={description}
                        handleSelectPurpose={handleSelectPurpose}
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>
          </div>
        )}
        <span className={bem("request-container__header-text", "small")}>
          {`${agentName} will have access until`}
        </span>
        <DateInput
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          datepickerOpen={datepickerOpen}
          setDatepickerOpen={setDatepickerOpen}
          handleDateChange={handleDateChange}
          setDateForever={setDateForever}
        />
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
