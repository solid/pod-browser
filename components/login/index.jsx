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

/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useState, useEffect } from "react";
import { createStyles, makeStyles } from "@material-ui/styles";
import { Button, Message } from "@inrupt/prism-react-components";
import { useSession } from "@inrupt/solid-ui-react";
import { useBem } from "@solid/lit-prism-patterns";
import InfoTooltip from "../infoTooltip";
import ProviderLogin from "./provider";
import styles from "./styles";

import { getClientOptions } from "../../constants/app";

import useReturnUrl from "../../src/authentication/useReturnUrl";
import useIdpFromQuery from "../../src/hooks/useIdpFromQuery";

export const TESTCAFE_ID_LOGIN_BUTTON = "login-button";
export const TESTCAFE_ID_LOGIN_TITLE = "login-title";
export const TESTCAFE_ID_OTHER_PROVIDERS_BUTTON = "other-providers-button";

const DEFAULT_PROVIDER_IRI = "https://login.inrupt.com";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function LoginForm() {
  const bem = useBem(useStyles());
  // FIXME: remove after pod migration is completed
  const [shouldDisplayWarning, setShouldDisplayWarning] = useState(false);

  const { persist } = useReturnUrl();
  const { login: sessionLogin } = useSession();

  const login = useCallback(
    (oidcIssuer) => {
      if (
        oidcIssuer.includes("login.inrupt.com") ||
        oidcIssuer.includes("broker.pod.inrupt.com")
      ) {
        setShouldDisplayWarning(true);
        return;
      }
      persist();
      sessionLogin({
        oidcIssuer,
        ...getClientOptions(),
      });
    },
    [sessionLogin, persist]
  );

  // useIdpFromQuery requires several re-renders due to using useEffect & useState:
  const idp = useIdpFromQuery();
  // hence we don't use it directly here for setting the initial state:
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpenDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (idp && idp.iri) {
      setIsOpen(true);
    }
  }, [idp]);

  const handleDefaultLogin = (ev) => {
    ev.preventDefault();
    login(DEFAULT_PROVIDER_IRI);
  };

  return (
    <div className={bem("login-form")}>
      {/* FIXME: remove after pod migration is completed */}
      {shouldDisplayWarning && (
        <Message variant="warning" prominent hasIcon>
          Sorry, we cannot log you in at the moment due to planned system
          maintenance. Please see our
          <a href="https://inrupt.com/blog/pod-spaces-upgrade"> blog post </a>
          for more information.
        </Message>
      )}
      <h3 data-testid={TESTCAFE_ID_LOGIN_TITLE}>Sign in with</h3>
      <img
        width={160}
        src="/pod-spaces-logo.svg"
        alt="Inrupt PodBrowser"
        className={bem("login-form__logo")}
      />
      <form>
        <Button
          variant="primary"
          data-testid={TESTCAFE_ID_LOGIN_BUTTON}
          onClick={handleDefaultLogin}
          className={bem("login-form__button")}
        >
          Sign In
        </Button>
      </form>
      <div className={bem("separator__wrap")}>
        <h2 className={bem("separator__centre-line")}>
          <span>Or</span>
        </h2>
      </div>
      <Button
        variant="secondary"
        iconAfter={isOpen ? "caret-up" : "caret-down"}
        onClick={toggleOpenDropdown}
        data-testid={TESTCAFE_ID_OTHER_PROVIDERS_BUTTON}
      >
        Sign in with other provider
      </Button>
      {isOpen && (
        <div className={bem("provider-login-container", "visible")}>
          <InfoTooltip
            label="Where is your Pod hosted?"
            tooltipText="This is where you signed up for a Solid Pod"
            className={bem("info-button")}
          />
          <ProviderLogin provider={idp} handleLogin={login} />
        </div>
      )}
    </div>
  );
}
