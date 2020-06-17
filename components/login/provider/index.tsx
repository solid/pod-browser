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

import React, { ChangeEvent, useState, ReactElement } from "react";
import { Select, MenuItem, Box, TextField } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";

import auth from "solid-auth-client";

import { PrismTheme, useBem } from "@solid/lit-prism-patterns";
import getProviders from "../../../constants/provider";
import styles from "./styles";

const PROVIDERS = getProviders();

const CUSTOM_PROVIDER = {
  label: "other",
  value: "",
};

export const loginWithProvider = (): void => {
  auth.popupLogin({ popupUri: `/login-popup.html` }).catch((e) => {
    throw e;
  });
};

const useStyles = makeStyles<PrismTheme>((theme) =>
  createStyles(styles(theme))
);

export default function Provider(): ReactElement {
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [customProvider, setCustomProvider] = useState("");

  const handleFormSubmit = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    // TODO: provider is currently unused, because of the SAC popup flow.
    return loginWithProvider();
  };

  const bem = useBem(useStyles());

  // any is used on the select onchange due to ongoing debates about how to handle the event
  /* eslint @typescript-eslint/no-explicit-any: 0 */

  return (
    <form onSubmit={handleFormSubmit}>
      <Box my={2}>
        <Select
          value={provider.label}
          onChange={(e: any) => {
            setCustomProvider("");
            setProvider(
              PROVIDERS.find((p) => p.label === e.target.value) ||
                CUSTOM_PROVIDER
            );
          }}
        >
          {PROVIDERS.map((p) => (
            <MenuItem value={p.label} key={p.label}>
              {p.label}
            </MenuItem>
          ))}

          <MenuItem value={CUSTOM_PROVIDER.label}>Other</MenuItem>
        </Select>

        {provider.label === CUSTOM_PROVIDER.label ? (
          <Box mt={2}>
            <TextField
              type="url"
              id="customProvider"
              placeholder="Provider IRI"
              value={customProvider}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCustomProvider(e.target.value);
              }}
            />
          </Box>
        ) : null}

        <Box mt={2}>
          <button type="submit" className={bem("button")}>
            Log In
          </button>
        </Box>
      </Box>
    </form>
  );
}
