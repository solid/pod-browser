import React, { ChangeEvent, useState, ReactElement } from "react";
import { Button, Select, MenuItem, Box, TextField } from "@material-ui/core";

import { login } from "@inrupt/solid-auth-fetcher";

import getProviders, { ProviderEntity } from "../../../constants/provider";
import getConfig from "../../../constants/config";

const PROVIDERS = getProviders();
const CONFIG = getConfig();

const CUSTOM_PROVIDER = {
  label: "other",
  value: "",
  useClientId: false,
};

export const loginWithProvider = (provider: ProviderEntity): void => {
  login({
    oidcIssuer: provider.value,
    redirect: `${CONFIG.host}${CONFIG.loginRedirect}`,
    clientId: provider.useClientId ? CONFIG.idpClientId : undefined,
  });
};

export default function Provider(): ReactElement {
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [customProvider, setCustomProvider] = useState("");

  const handleFormSubmit = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();

    if (customProvider) {
      return loginWithProvider({
        ...CUSTOM_PROVIDER,
        value: customProvider,
      });
    }

    return loginWithProvider(provider);
  };

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
          <Button variant="contained" type="submit" color="primary">
            Log In
          </Button>
        </Box>
      </Box>
    </form>
  );
}
