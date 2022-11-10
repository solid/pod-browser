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
  GRANT_VC_URL_PARAM_NAME,
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
} from "../../src/models/access/request";
import ConfirmationDialogContext from "../../src/contexts/confirmationDialogContext";
import ConfirmationDialog from "../confirmationDialog";
import AlertContext from "../../src/contexts/alertContext";
import PurposeCheckbox from "./purposeCheckBox";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const NO_ACCESS_DIALOG_TITLE = "You haven't selected any access";
export const DENY_ACCESS_DIALOG_TITLE = "Deny all access?";
export const ACCESS_REQUEST_NO_ACCESS_DIALOG =
  "access-request-no-access-dialog";
export const TESTCAFE_ID_ACCESS_REQUEST_SUBMIT_BUTTON =
  "access-request-submit-button";
export const TESTCAFE_ID_ACCESS_REQUEST_DENY_BUTTON =
  "access-request-deny-button";
export const CONFIRM_TEXT = "Continue with no access";
export const DENY_TEXT = "Deny All Access";
export const NO_PURPOSE_TITLE = "Select a purpose";

export default function AccessRequestForm({
  agentDetails,
  agentWebId,
  accessRequest,
}) {
  const classes = useStyles();
  const bem = useBem(classes);
  const router = useRouter();
  const { session } = useSession();
  const { redirectUrl } = router.query;
  // values from request needed for UI
  const requestedAccesses = getRequestedAccesses(accessRequest);
  const expirationDate = getExpiryDate(accessRequest);
  const purposes = getPurposeUrls(accessRequest);
  const resourceOwnerWebId = getDataSubjectWebId(accessRequest);

  // local state based on request values
  const [selectedDate, setSelectedDate] = useState(expirationDate);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedPurposes, setSelectedPurposes] = useState(() => {
    if (Array.isArray(purposes) && purposes.length === 1) {
      return purposes[0];
    }
    if (!Array.isArray(purposes)) {
      return purposes;
    }
    return [];
  });
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

  const { alertError } = useContext(AlertContext);
  const DIALOG_CONTENT = `${
    agentName || agentWebId
  } will not have access to anything in your Pod.`;
  const NO_PURPOSE_CONTENT = `At least one purpose needs to be selected to approve access for ${agentName}`;
  const requestor = getRequestorWebId(accessRequest);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      selectedAccess.length &&
      ((purposes && selectedPurposes.length) || !purposes)
    ) {
      const expirationDate = selectedDate ? new Date(selectedDate) : null;
      const signedVc = await approveAccessRequest(
        accessRequest,
        {
          requestor,
          access: selectedAccess.accessModes,
          resources: selectedResources,
          expirationDate,
          resourceOwner: session.info.webId,
          purpose: selectedPurposes,
        },
        {
          fetch: session.fetch,
        }
      );
      if (signedVc) {
        await router.push(
          `${redirectUrl}?${GRANT_VC_URL_PARAM_NAME}=${getVcId(signedVc)}`
        );
      }
    }
    /* istanbul ignore next */
    if (purposes && !selectedPurposes.length) {
      setOpen(ACCESS_REQUEST_NO_ACCESS_DIALOG);
      setTitle(NO_PURPOSE_TITLE);
      setCancelText("Ok");
      setOmitConfirmButton(true);
      setContent(NO_PURPOSE_CONTENT);
    } else if (!selectedAccess.length) {
      setOmitCancelButton(false);
      setOmitConfirmButton(false);
      setOpen(ACCESS_REQUEST_NO_ACCESS_DIALOG);
      setTitle(NO_ACCESS_DIALOG_TITLE);
      setConfirmText(CONFIRM_TEXT);
      setContent(DIALOG_CONTENT);
    }
  };

  const handleDenyAccess = () => {
    setOmitCancelButton(false);
    setTitle(DENY_ACCESS_DIALOG_TITLE);
    setConfirmText(DENY_TEXT);
    setContent(DIALOG_CONTENT);
    setOpen(ACCESS_REQUEST_NO_ACCESS_DIALOG);
  };

  useEffect(() => {
    const handleDenyAccessRequest = async () => {
      const signedVc = await denyAccessRequest(accessRequest, {
        fetch: session.fetch,
      });
      if (signedVc) {
        await router.push(
          `${redirectUrl}?${GRANT_VC_URL_PARAM_NAME}=${getVcId(signedVc)}`
        );
      }
    };
    if (confirmed === null && open === ACCESS_REQUEST_NO_ACCESS_DIALOG) return;

    if (confirmed && open === ACCESS_REQUEST_NO_ACCESS_DIALOG) {
      handleDenyAccessRequest();
      closeDialog();
    }

    if (confirmed !== null) {
      closeDialog();
    }
  }, [
    confirmed,
    closeDialog,
    open,
    accessRequest,
    selectedAccess,
    selectedPurposes,
    selectedResources,
    redirectUrl,
    session,
    router,
  ]);

  const handleDateChange = (date) => {
    setSelectedDate(date ? new Date(date) : null);
  };

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
          requestedAccesses.map((access, index) => {
            return (
              <RequestSection
                // eslint-disable-next-line react/no-array-index-key
                key={`access-request-section-${index}`}
                agentName={agentName || agentWebId}
                sectionDetails={access}
                selectedAccess={selectedAccess}
                setSelectedAccess={setSelectedAccess}
              />
            );
          })}
        <div className={bem("form__controls")}>
          <Button
            data-testid={TESTCAFE_ID_ACCESS_REQUEST_DENY_BUTTON}
            variant="secondary"
            type="button"
            className={bem("request-container__button")}
            onClick={handleDenyAccess}
          >
            Deny all access
          </Button>
          <Button
            data-testid={TESTCAFE_ID_ACCESS_REQUEST_SUBMIT_BUTTON}
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

AccessRequestForm.propTypes = {
  accessRequest: T.shape({
    credentialSubject: T.shape({
      hasConsent: T.oneOfType([
        T.arrayOf(
          T.shape({
            forPurpose: T.arrayOf(T.string) || T.string,
          })
        ),
        T.shape({
          forPurpose: T.arrayOf(T.string) || T.string,
        }),
      ]),
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

AccessRequestForm.defaultProps = {
  agentDetails: {},
};
