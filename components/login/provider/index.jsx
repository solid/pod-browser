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

/* eslint react/jsx-props-no-spreading: 0 */

import React, { createRef, useEffect, useState } from "react";
import T from "prop-types";
import {
  Box,
  FormControl,
  FormHelperText,
  TextField,
  useTheme,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

import { LoginButton, useSession } from "@inrupt/solid-ui-react";

import { Button } from "@inrupt/prism-react-components";
import { generateRedirectUrl } from "../../../src/windowHelpers";
import getIdentityProviders from "../../../constants/provider";
import { ERROR_REGEXES, hasError } from "../../../src/error";
import useIdpFromQuery from "../../../src/hooks/useIdpFromQuery";

const providers = getIdentityProviders();
const TESTCAFE_ID_LOGIN_TITLE = "login-title";
export const TESTCAFE_ID_LOGIN_FIELD = "login-field";
const TESTCAFE_ID_LOGIN_BUTTON = "login-button";

export function setupOnProviderChange(setProviderIri) {
  return (e, newValue) => {
    setProviderIri(newValue);
  };
}

export function setupLoginHandler(login) {
  return async (event) => {
    event.preventDefault();
    login();
  };
}

export function setupErrorHandler(setLoginError) {
  return (error) => {
    setLoginError(error);
  };
}

export function getErrorMessage(error) {
  const postFix = " Please fill out a valid Solid Identity Provider.";
  if (hasError(error, ERROR_REGEXES.INVALID_IDP)) {
    return `This URL is not a Solid Identity Provider.`;
  }
  if (hasError(error, ERROR_REGEXES.INVALID_URL)) {
    return `This value is not a URL.${postFix}`;
  }
  if (hasError(error, ERROR_REGEXES.HANDLER_NOT_FOUND)) {
    return `Please provide a URL.${postFix}`;
  }
  return `We were unable to log in with this URL.${postFix}`;
}

export default function Provider({ defaultError }) {
  const buttonBem = Button.useBem();
  const { login } = useSession();
  const [loginError, setLoginError] = useState(defaultError);
  const theme = useTheme();
  const idp = useIdpFromQuery();
  const [providerIri, setProviderIri] = useState(
    Object.values(providers)[0]?.iri
  );
  const loginFieldRef = createRef();

  useEffect(() => {
    if (idp) {
      setProviderIri(idp.iri);
      loginFieldRef.current?.querySelector("input")?.focus();
    }
  }, [idp, loginFieldRef]);

  const authOptions = {
    clientName: "Inrupt PodBrowser",
  };

  const onProviderChange = setupOnProviderChange(setProviderIri);
  const handleLogin = setupLoginHandler(login);
  const onError = setupErrorHandler(setLoginError);

  const providersWithIdp = idp ? { [idp.label]: idp, ...providers } : providers;

  return (
    <form onSubmit={handleLogin}>
      <Box my={2}>
        <Box mt={2}>
          <h3 data-testid={TESTCAFE_ID_LOGIN_TITLE}>Log In</h3>

          <FormControl
            error={!!loginError}
            style={{ maxWidth: 320, width: "100%" }}
          >
            <Autocomplete
              onChange={onProviderChange}
              onInputChange={onProviderChange}
              id="provider-select"
              freeSolo
              options={Object.values(providersWithIdp).map(
                (provider) => provider.iri
              )}
              value={idp ? providerIri : null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  error={!!loginError}
                  label="Select ID provider"
                  margin="normal"
                  variant="outlined"
                  type="url"
                  aria-describedby={loginError ? "login-error-text" : null}
                  data-testid={TESTCAFE_ID_LOGIN_FIELD}
                  ref={loginFieldRef}
                />
              )}
            />
            {loginError ? (
              <FormHelperText
                id="login-error-text"
                style={{ marginBottom: theme.spacing(1) }}
              >
                {getErrorMessage(loginError)}
              </FormHelperText>
            ) : null}
          </FormControl>

          <LoginButton
            oidcIssuer={providerIri}
            redirectUrl={generateRedirectUrl("")}
            authOptions={authOptions}
            onError={onError}
          >
            <button
              data-testid={TESTCAFE_ID_LOGIN_BUTTON}
              type="submit"
              className={buttonBem("button", "primary")}
            >
              Log In
            </button>
          </LoginButton>
        </Box>
      </Box>
    </form>
  );
}

Provider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  defaultError: T.object,
};

Provider.defaultProps = {
  defaultError: null,
};
