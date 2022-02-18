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
  FormControl,
  FormHelperText,
  TextField,
  useTheme,
} from "@material-ui/core";

import { makeStyles, createStyles } from "@material-ui/styles";
import { Autocomplete } from "@material-ui/lab";
import { useBem } from "@solid/lit-prism-patterns";
import { LoginButton, useSession } from "@inrupt/solid-ui-react";

import { Button } from "@inrupt/prism-react-components";

import {
  generateRedirectUrl,
  getCurrentHostname,
  getCurrentOrigin,
} from "../../../src/windowHelpers";

import { isLocalhost } from "../../../src/stringHelpers";
import getIdentityProviders from "../../../constants/provider";
import { ERROR_REGEXES, hasError } from "../../../src/error";
import styles from "./styles";
import { CLIENT_NAME } from "../../../constants/app";

export const TESTCAFE_ID_LOGIN_FIELD = "login-field";
export const TESTCAFE_ID_GO_BUTTON = "go-button";

const providers = getIdentityProviders();
const hostname = getCurrentHostname();

const CLIENT_APP_WEBID = `${getCurrentOrigin()}/api/app`;

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export function setupOnProviderChange(setProviderIri, setLoginError) {
  return (e, newValue) => {
    e.preventDefault();
    setLoginError(null);

    if (typeof newValue === "string") {
      if (newValue.startsWith("https://") || newValue.startsWith("http://")) {
        setProviderIri(newValue);
      } else {
        setProviderIri(`https://${newValue}`);
      }
    } else {
      setProviderIri(newValue?.iri || null);
    }
  };
}

export function setupLoginHandler(login, setLoginError) {
  return async (e, providerIri) => {
    e.preventDefault();

    try {
      await login({ oidcIssuer: providerIri });
      setLoginError(null);
    } catch (error) {
      if (!e.target.value && !providerIri) {
        return;
      }

      setLoginError(error);
    }
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
    return "This URL is not a Solid Identity Provider.";
  }

  if (hasError(error, ERROR_REGEXES.HANDLER_NOT_FOUND)) {
    return "Please fill out a valid Solid Identity Provider.";
  }

  return `We were unable to log in with this URL.${postFix}`;
}

export const AUTH_OPTIONS = {
  clientName: CLIENT_NAME,
};

if (!isLocalhost(hostname)) {
  AUTH_OPTIONS.clientId = CLIENT_APP_WEBID;
}

export default function Provider({ defaultError, provider }) {
  const bem = useBem(useStyles());
  const classes = useStyles();
  const { login } = useSession();
  const [loginError, setLoginError] = useState(defaultError);
  const theme = useTheme();
  const [providerIri, setProviderIri] = useState(provider?.iri || "");

  const loginFieldRef = createRef();

  useEffect(() => {
    if (!provider) return;

    loginFieldRef.current?.querySelector("input").focus();
  }, [provider, loginFieldRef]);

  const onProviderChange = setupOnProviderChange(setProviderIri, setLoginError);
  const handleLogin = setupLoginHandler(login, setLoginError);
  const onError = setupErrorHandler(setLoginError);
  const providersWithIdp = provider ? [provider, ...providers] : providers;
  const [inputValue, setInputValue] = useState(provider?.label || "");

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <form
      onSubmit={(e) => handleLogin(e, providerIri)}
      className={bem("provider-login__form")}
    >
      <div className={bem("provider-login__wrapper")}>
        <FormControl
          classes={{ root: classes.selectionBox }}
          error={!!loginError}
        >
          <Autocomplete
            onChange={onProviderChange}
            id="provider-select"
            freeSolo
            options={providersWithIdp}
            getOptionLabel={(option) => option.label ?? option}
            value={provider?.iri || providerIri}
            autoSelect
            renderOption={(option) => {
              return (
                <>
                  {option.logo ? (
                    <img
                      src={`../${option.logo}`}
                      width={20}
                      style={{ margin: "1rem" }}
                      alt={option.label}
                    />
                  ) : (
                    <div style={{ minWidth: "20px", padding: "1.6rem" }} />
                  )}
                  {option.label}
                </>
              );
            }}
            renderInput={(params) => {
              return (
                <TextField
                  onChange={handleChange}
                  {...params}
                  error={!!loginError}
                  margin="none"
                  variant="outlined"
                  type="url"
                  aria-describedby={loginError ? "login-error-text" : null}
                  data-testid={TESTCAFE_ID_LOGIN_FIELD}
                  ref={loginFieldRef}
                  value={inputValue}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleLogin(e, providerIri);
                    }
                  }}
                />
              );
            }}
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
          authOptions={AUTH_OPTIONS}
          onError={onError}
        >
          <Button
            variant="primary"
            data-testid={TESTCAFE_ID_GO_BUTTON}
            type="submit"
            className={bem("provider-login__button")}
            onClick={() => setProviderIri(inputValue)}
          >
            Go
          </Button>
        </LoginButton>
      </div>
    </form>
  );
}

Provider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  defaultError: T.object,
  provider: T.shape({
    iri: T.string,
    label: T.string,
  }),
};

Provider.defaultProps = {
  defaultError: null,
  provider: null,
};
