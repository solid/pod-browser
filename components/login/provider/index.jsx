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

import React, { useState, useContext } from "react";
import { Box, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

import { createStyles, makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";

import {
  clearLocalstorage,
  generateRedirectUrl,
} from "../../../src/windowHelpers";

import getIdentityProviders from "../../../constants/provider";
import SessionContext from "../../../src/contexts/sessionContext";
import styles from "./styles";

const providers = getIdentityProviders();
const TESTCAFE_ID_LOGIN_TITLE = "login-title";
const TESTCAFE_ID_LOGIN_BUTTON = "login-button";

export async function loginWithProvider(providerIri, session) {
  clearLocalstorage();

  await session.login({
    oidcIssuer: providerIri,
    redirectUrl: generateRedirectUrl(""),
  });
}

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function Provider() {
  const { session } = useContext(SessionContext);
  const bem = useBem(useStyles());
  const [providerIri, setProviderIri] = useState();

  const onProviderChange = (e, newValue) => {
    setProviderIri(newValue);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    return loginWithProvider(providerIri, session);
  };

  /* eslint react/jsx-props-no-spreading: 0 */

  return (
    <form onSubmit={handleLogin}>
      <Box my={2}>
        <Box mt={2}>
          <h3 data-testid={TESTCAFE_ID_LOGIN_TITLE}>Log In</h3>

          <Autocomplete
            onChange={onProviderChange}
            onInputChange={onProviderChange}
            id="provider-select"
            freeSolo
            options={Object.values(providers).map((provider) => provider.iri)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select ID provider"
                margin="normal"
                variant="outlined"
                type="url"
                required
              />
            )}
          />

          <button
            data-testid={TESTCAFE_ID_LOGIN_BUTTON}
            type="submit"
            className={bem("button", "primary")}
            onClick={handleLogin}
          >
            Log In
          </button>
        </Box>
      </Box>
    </form>
  );
}
