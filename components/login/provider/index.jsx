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

import React, { createRef, useEffect, useState, useCallback } from "react";
import T from "prop-types";
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
  useTheme,
} from "@mui/core";

import { makeStyles, createStyles } from "@mui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Button } from "@inrupt/prism-react-components";

import { defaultIdentityProviders } from "../../../constants/provider";
import { validateProviderIri } from "./validateProviderIri";

import styles from "./styles";

export const TESTCAFE_ID_LOGIN_FIELD = "login-field";
export const TESTCAFE_ID_GO_BUTTON = "go-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

const errors = {
  invalid_url: "Please enter a valid URL",
  bad_request: "This URL is not a Solid Identity Provider.",
  network_error:
    "We were unable to log in with this URL. Please fill out a valid Solid Identity Provider.",
  unavailable:
    "We were unable to log in at this time, it seems your provider is unavailable.",
};

export function translateError(error) {
  if (typeof errors[error] === "string") {
    return errors[error];
  }

  return null;
}

export default function Provider({ provider, handleLogin }) {
  const theme = useTheme();
  const bem = useBem(useStyles());

  const [loginError, setLoginError] = useState(null);
  const [providerIri, setProviderIri] = useState(provider?.iri || "");
  const [inputValue, setInputValue] = useState(provider?.label || "");

  const loginFieldRef = createRef();

  useEffect(() => {
    loginFieldRef.current?.querySelector("input")?.focus();
  }, [loginFieldRef]);

  const handleSubmit = useCallback(
    async (ev) => {
      // null if called from "create-option":
      ev?.preventDefault();

      const { error, issuer } = await validateProviderIri(providerIri);
      if (error) {
        setLoginError(translateError(error));
      } else {
        handleLogin(issuer);
      }
    },
    [setLoginError, handleLogin, providerIri]
  );

  const handleInputChange = useCallback(
    (_ev, newValue, reason) => {
      setLoginError(null);

      if (!newValue || reason === "clear") {
        setInputValue("");
        setProviderIri("");
        return;
      }

      let issuer = newValue;
      if (!issuer.startsWith("http://") && !issuer.startsWith("https://")) {
        issuer = `https://${issuer}`;
      }

      setInputValue(newValue);
      setProviderIri(issuer);
    },
    [setLoginError, setInputValue, setProviderIri]
  );

  const handleProviderChange = useCallback(
    (_ev, newValue, reason) => {
      setLoginError(null);

      // For some reason "clear" doesn't actually fire here in the tests:
      // if (reason === "clear") {
      //   setInputValue("");
      //   setProviderIri("");
      // }

      // For some reason in testing, the reason "select-option" never gets
      // emitted despite it working as expected:
      if (reason === "select-option") {
        setInputValue(newValue.label);
        setProviderIri(newValue.iri);
      }

      // User has typed their own URL in, and when they select that, we want to trigger the login:
      if (reason === "create-option") {
        handleSubmit();
      }
    },
    [setLoginError, setInputValue, setProviderIri, handleSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className={bem("provider-login__form")}>
      <div className={bem("provider-login__wrapper")}>
        <FormControl
          classes={{ root: bem("provider-login__formcontrol") }}
          error={!!loginError}
        >
          <Autocomplete
            onChange={handleProviderChange}
            onInputChange={handleInputChange}
            id="provider-select"
            freeSolo
            options={defaultIdentityProviders}
            getOptionLabel={(option) => option.label ?? option}
            defaultValue={provider?.iri}
            autoSelect
            renderOption={(option) => {
              return (
                <>
                  {option.logo && (
                    <img
                      src={`../${option.logo}`}
                      width={20}
                      alt={option.label}
                    />
                  )}
                  <div
                    style={{
                      padding: "0.5rem 1rem",
                    }}
                  >
                    {option.label}
                  </div>
                </>
              );
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps,
                    autoComplete: "off",
                    inputMode: "url",
                    "data-testid": TESTCAFE_ID_LOGIN_FIELD,
                  }}
                  error={!!loginError}
                  margin="none"
                  variant="outlined"
                  aria-describedby={loginError ? "login-error-text" : null}
                  ref={loginFieldRef}
                  value={inputValue}
                />
              );
            }}
          />
          {loginError ? (
            <FormHelperText id="login-error-text" style={{ marginBottom: 0 }}>
              {loginError}
            </FormHelperText>
          ) : (
            <p style={{ margin: 0 }}>&nbsp;</p>
          )}
        </FormControl>
        <Button
          type="submit"
          variant="primary"
          className={bem("provider-login__button")}
          data-testid={TESTCAFE_ID_GO_BUTTON}
        >
          Go
        </Button>
      </div>
    </form>
  );
}

Provider.propTypes = {
  provider: T.shape({
    iri: T.string,
    label: T.string,
  }),
  handleLogin: T.func.isRequired,
};

Provider.defaultProps = {
  provider: null,
};
