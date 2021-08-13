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

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentRequestFrom() {
  const classes = useStyles();
  const bem = useBem(classes);
  const { consentRequest } = useContext(ConsentRequestContext);
  // FIXME: When we hook up the API, request the profile and get the agent name
  const agentWebId = consentRequest?.credentialSubject?.id;

  // FIXME: using a mock for the app profile - we will fetch profile later
  const agentProfile = mockApp();
  const agentName = getStringNoLocale(agentProfile, foaf.name);
  const purposeUrl =
    consentRequest?.credentialSubject?.hasConsent[0].forPurpose; // getting the first in this array for now
  // FIXME: we will later fetch the description from the purpose Url
  const purposeDescription = "Some Specific Purpose";

  return (
    <>
      <form className={bem("request-container__content", "main")}>
        <Typography component="h2" align="center" variant="h1">
          <span className={bem("agent-name")}>
            Allow {agentName}
            <InfoTooltip tooltipText={`WebID: ${agentWebId}`} />
            access?
          </span>
        </Typography>
        <span className={bem("purpose")}>
          {purposeDescription} <InfoTooltip tooltipText={purposeUrl} />
        </span>
        {/* FIXME: place this in a loop when we know the data structure */}
        {consentRequest?.credentialSubject?.hasConsent &&
          agentName &&
          consentRequest.credentialSubject.hasConsent.map((consent) => {
            return (
              <RequestSection agentName={agentName} sectionDetails={consent} />
            );
          })}
        <div className={bem("form__controls")}>
          <Button
            variant="secondary"
            className={bem("request-container__button")}
          >
            Deny all access
          </Button>
          <Button type="submit" className={bem("request-container__button")}>
            Confirm Access
          </Button>
        </div>
      </form>
    </>
  );
}
