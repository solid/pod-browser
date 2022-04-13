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
import T from "prop-types";
import {
  approveAccessRequest,
  denyAccessRequest,
} from "@inrupt/solid-client-access-grants";
import { Button } from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import { useRouter } from "next/router";
import {
  createStyles,
  ListItem,
  Typography,
  List,
  FormControlLabel,
} from "@material-ui/core";
import { useSession } from "@inrupt/solid-ui-react";
import { useBem } from "@solid/lit-prism-patterns";
import InfoTooltip from "../infoTooltip";
import RequestSection from "./requestSection";
import DateInput from "./dateInput";
import styles from "./styles";
import {
  getDataSubjectWebId,
  getExpiryDate,
  getPurposeUrls,
  getRequestedAccesses,
  getRequestorWebId,
  getVcId,
} from "../../src/models/consent/request";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import ConfirmationDialog from "../confirmationDialog";
import AlertContext from "../../src/contexts/alertContext";
import PurposeCheckbox from "./purposeCheckBox";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const NO_ACCESS_DIALOG_TITLE = "You haven't selected any access";
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

export default function ConsentRequestForm({
  consentRequest,
  agentDetails,
  agentWebId,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  const router = useRouter();
  const { session } = useSession();
  const { redirectUrl } = router.query;
  // values from request needed for UI
  const requestedAccesses = getRequestedAccesses(consentRequest);
  const expirationDate = getExpiryDate(consentRequest);
  const purposes = getPurposeUrls(consentRequest);
  const resourceOwnerWebId = getDataSubjectWebId(consentRequest);

  // local state based on request values
  const [selectedDate, setSelectedDate] = useState(expirationDate);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedPurposes, setSelectedPurposes] = useState([]);
  const selectedResources = selectedAccess.map(
    ({ resourceIri }) => resourceIri
  );
  // other state
  const { agentName } = agentDetails || null;

  const {
    confirmed,
    open,
    setContent,
    setOpen,
    setTitle,
    closeDialog,
    setConfirmText,
    setCancelText,
    setOmitConfirmButton,
    setOmitCancelButton,
  } = useContext(ConfirmationDialogContext);
  const [confirmationSetup, setConfirmationSetup] = useState(false);

  const { alertError } = useContext(AlertContext);

  const DIALOG_CONTENT = `${
    agentName || agentWebId
  } will not have access to anything in your Pod.`;
  const NO_PURPOSE_CONTENT = `At least one purpose needs to be selected to approve access for ${agentName}`;
  const requestor = getRequestorWebId(consentRequest);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAccess.length && selectedPurposes.length) {
      const signedVc = await approveAccessRequest(
        session.info.webId,
        consentRequest,
        {
          requestor,
          access: selectedAccess.accessModes,
          resources: selectedResources,
          expirationDate: selectedDate ? new Date(selectedDate) : null,
          resourceOwner: session.info.webId,
        },
        {
          fetch: session.fetch,
        }
      );
      if (signedVc) {
        await router.push(`${redirectUrl}?signedVcUrl=${getVcId(signedVc)}`);
      }
    }
    /* istanbul ignore next */
    if (!selectedPurposes.length) {
      setConfirmationSetup(true);
      setOpen(CONSENT_REQUEST_NO_ACCESS_DIALOG);
      setTitle(NO_PURPOSE_TITLE);
      setCancelText("Ok");
      setOmitConfirmButton(true);
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
    const handleDenyAccessRequest = async () => {
      const signedVc = await denyAccessRequest(
        session.info.webId,
        consentRequest
      );
      if (signedVc) {
        await router.push(`${redirectUrl}?signedVcUrl=${getVcId(signedVc)}`);
      }
    };
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
      handleDenyAccessRequest();
      closeDialog();
    }

    if (confirmed !== null) {
      closeDialog();
      setConfirmationSetup(false);
    }
  }, [
    confirmationSetup,
    confirmed,
    closeDialog,
    open,
    consentRequest,
    selectedAccess,
    selectedPurposes,
    selectedResources,
    redirectUrl,
    session,
    router,
  ]);

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.toISOString() : null);
  };

  useEffect(() => {
    if (!purposes) return;
    if (Array.isArray(purposes) && purposes.length === 1) {
      setSelectedPurposes(purposes[0]);
    }
    if (!Array.isArray(purposes)) {
      setSelectedPurposes(purposes);
    }
  }, [purposes]);

  useEffect(() => {
    if (!expirationDate) return;
    setSelectedDate(new Date(expirationDate));
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

  if (resourceOwnerWebId && resourceOwnerWebId !== session.info.webId) {
    alertError("You don't have access to that");
    router.push("/");
  }

  return (
    <>
      <form
        className={bem("request-container__content", "main")}
        onSubmit={handleSubmit}
      >
        <Typography component="h2" align="center" variant="h1">
          <span className={bem("agent-name")}>
            Allow {agentName || agentWebId} access?
          </span>
        </Typography>
        {Array.isArray(purposes) && purposes.length === 1 ? (
          <span className={bem("purpose")}>
            {purposes[0].description || purposes[0]}
            <InfoTooltip
              tooltipText={purposes[0].url || purposes[0] || "Purpose"}
            />
          </span>
        ) : (
          <div className={bem("purposes-container")}>
            {Array.isArray(purposes) ? (
              <>
                Select the purposes you wish to allow:
                <List>
                  {purposes?.map((url) => (
                    <ListItem key={url} className={bem("list-item")}>
                      <FormControlLabel
                        classes={{ label: classes.purposeLabel }}
                        label={url}
                        control={
                          // eslint-disable-next-line react/jsx-wrap-multilines
                          <PurposeCheckbox
                            classes={classes}
                            url={url}
                            description={url}
                            handleSelectPurpose={handleSelectPurpose}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              purposes
            )}
          </div>
        )}
        <span className={bem("request-container__header-text", "small")}>
          {`${agentName || agentWebId} will have access until`}
        </span>
        <DateInput
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
        />
        {/* FIXME: place this in a loop when we know the data structure */}
        {requestedAccesses &&
          requestedAccesses.map((consent, index) => {
            return (
              <RequestSection
                // eslint-disable-next-line react/no-array-index-key
                key={`consent-request-section-${index}`}
                agentName={agentName || agentWebId}
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

ConsentRequestForm.propTypes = {
  consentRequest: T.shape({
    credentialSubject: T.shape({
      hasConsent:
        T.arrayOf(
          T.shape({
            forPurpose: T.arrayOf(T.string) || T.string,
          })
        ) ||
        T.shape({
          forPurpose: T.arrayOf(T.string) || T.string,
        }),
      id: T.string,
      expirationDate: T.string,
    }),
  }).isRequired,
  agentDetails: T.shape({
    agentName: T.string,
    agentUrl: T.string,
    agentTOS: T.string,
    agentPolicy: T.string,
  }),
  agentWebId: T.string.isRequired,
};

ConsentRequestForm.defaultProps = {
  agentDetails: {},
};
