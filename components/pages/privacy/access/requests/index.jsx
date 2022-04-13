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

import React, { useState, useEffect } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { getAccessRequestFromRedirectUrl } from "@inrupt/solid-client-access-grants";
import { Container, Icons } from "@inrupt/prism-react-components";
import {
  getProfileAll,
  getStringNoLocale,
  getThing,
  getUrl,
} from "@inrupt/solid-client";
import { foaf, vcard } from "rdf-namespaces";
import { makeStyles } from "@material-ui/styles";
import { createStyles, Typography, Link } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import styles from "./styles";
import ConsentRequestForm from "../../../../consentRequestForm";
import {
  CONTACTS_PREDICATE,
  POLICY_PREDICATE,
  TOS_PREDICATE,
} from "../../../../../__testUtils/mockApp";
import { getRequestorWebId } from "../../../../../src/models/consent/request";
import Spinner from "../../../../spinner";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function ConsentShow() {
  const { session } = useSession();
  const { fetch } = session;
  const redirectUrl = window.location.href;
  const bem = useBem(useStyles());
  const [consentRequest, setConsentRequest] = useState(null);
  const agentWebId = getRequestorWebId(consentRequest);
  const [agentDetails, setAgentDetails] = useState({});
  const { agentName, agentUrl, agentPolicy, agentTOS } = agentDetails || null;

  useEffect(() => {
    (async () => {
      if (!redirectUrl) return;
      const { accessRequest } = await getAccessRequestFromRedirectUrl(
        redirectUrl,
        { fetch }
      );
      setConsentRequest(accessRequest);
    })();
  }, [redirectUrl, fetch]);

  useEffect(() => {
    if (!consentRequest) return;
    (async () => {
      const profiles = await getProfileAll(agentWebId);
      const profileDataset = profiles.webIdProfile || profiles.altProfileAll[0]; // getting the first profile for now
      const agentProfile =
        profileDataset && getThing(profileDataset, agentWebId);
      const agentContactsUrl =
        agentProfile && getUrl(agentProfile, CONTACTS_PREDICATE);
      const agentContacts = agentContactsUrl
        ? getThing(profileDataset, agentContactsUrl)
        : null;
      setAgentDetails({
        agentName: agentProfile && getStringNoLocale(agentProfile, foaf.name),
        agentUrl: agentContacts ? getUrl(agentContacts, vcard.url) : null,
        agentTOS: agentProfile && getUrl(agentProfile, TOS_PREDICATE),
        agentPolicy: agentProfile && getUrl(agentProfile, POLICY_PREDICATE),
      });
    })();
  }, [agentWebId, fetch, consentRequest]);

  if (!consentRequest) return <Spinner />;

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Container className={bem("request-container")}>
        <ConsentRequestForm
          consentRequest={consentRequest}
          agentDetails={agentDetails}
          agentWebId={agentWebId}
        />
        <div className={bem("request-container__content")}>
          <Typography
            component="h3"
            align="center"
            variant="h3"
            className={bem("heading__uppercase")}
          >
            About this application
          </Typography>
          <div className={bem("app-name")}>
            <Icons className={bem("avatar")} name="project-diagram" />
            <Typography align="center" variant="body2">
              <span className={bem("footer__link")}>
                <Link href={agentWebId} variant="body2">
                  {agentName || agentWebId}
                </Link>
              </span>
            </Typography>
          </div>
          <Typography className={bem("footer__links")}>
            {agentUrl && (
              <span className={bem("footer__link")}>
                <Link href={agentUrl} variant="body2">
                  <Icons
                    name="globe"
                    className={bem("icon-small", "primary")}
                  />
                  Website
                </Link>
              </span>
            )}
            {agentPolicy && (
              <span className={bem("footer__link")}>
                <Link href={agentPolicy} variant="body2">
                  <Icons
                    name="webid"
                    className={bem("icon-small", "primary")}
                  />
                  Privacy Policy
                </Link>
              </span>
            )}
            {agentTOS && (
              <span className={bem("footer__link")}>
                <Link href={agentTOS} variant="body2">
                  <Icons name="doc" className={bem("icon-small", "primary")} />
                  Terms of Service
                </Link>
              </span>
            )}
          </Typography>
        </div>
      </Container>
    </MuiPickersUtilsProvider>
  );
}
