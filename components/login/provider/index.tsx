import React, { ChangeEvent, useState, ReactElement } from "react";
import { Select, MenuItem, Box, TextField } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/styles";

import auth from "solid-auth-client";

import getProviders from "../../../constants/provider";
import { PrismTheme, useBem } from "../../../lib/prism/packages/prism-patterns";
import styles from "./styles";

const PROVIDERS = getProviders();

const CUSTOM_PROVIDER = {
  label: "other",
  value: "",
};

export const loginWithProvider = (provider: string): void => {
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
    return loginWithProvider(customProvider || provider.value);
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
