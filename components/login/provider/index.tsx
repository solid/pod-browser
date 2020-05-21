import React, { useState } from 'react';
import {
  Button,
  Select,
  MenuItem,
  Box,
  TextField,
} from '@material-ui/core';

import { login } from '../../../lib/solid-auth-fetcher/dist';

import getProviders from '../../../constants/provider';
import getConfig from '../../../constants/config';


const PROVIDERS = getProviders();
const CONFIG = getConfig();
const CUSTOM_PROVIDER = 'other';

export const loginWithProvider = async (provider: string) => {
  login({
    oidcIssuer: provider,
    clientId: CONFIG.idpClientId,
    redirect: `${CONFIG.host}${CONFIG.loginRedirect}`,
  });
};

export default function Provider() {
  const [provider, setProvider] = useState(PROVIDERS[0].value);
  const [customProvider, setCustomProvider] = useState('');

  const handleFormSubmit = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    loginWithProvider(customProvider || provider);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Box my={2}>
        {/* any is used here due to ongoing debates about how to handle select onChange */}
        <Select
          value={provider}
          onChange={(e: any) => {
            setCustomProvider('');
            setProvider(e.target.value);
          }}
        >
          {PROVIDERS.map((p) => (
            <MenuItem value={p.value} key={p.value}>
              {p.label}
            </MenuItem>
          ))}

          <MenuItem value={CUSTOM_PROVIDER}>
            Other
          </MenuItem>
        </Select>

        {provider === CUSTOM_PROVIDER ? (
          <Box mt={2}>
            <TextField
              type="url"
              id="customProvider"
              placeholder="Provider IRI"
              value={customProvider}
              onChange={(e: any) => {
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
