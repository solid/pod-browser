import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
} from '@material-ui/core';

import { login } from '../../../lib/solid-auth-fetcher/dist';
import getConfig from '../../../constants/config';


const CONFIG = getConfig();

export const loginWithWebId = async (webId: string) => {
  const formattedWebId = webId.trim();

  if (!formattedWebId) { return; }

  login({
    webId: formattedWebId,
    redirect: `${CONFIG.host}${CONFIG.loginRedirect}`,
  });
};

export default function WebId() {
  const [webId, setWebId] = useState('');

  const handleFormSubmit = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    loginWithWebId(webId);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Box mb={2}>
        <TextField
          type="url"
          required
          id="WebId"
          placeholder="WebID"
          value={webId}
          onChange={(e: any) => {
            setWebId(e.target.value);
          }}
        />
      </Box>

      <Box>
        <Button
          variant="contained"
          type="submit"
        >
          Log In
        </Button>
      </Box>
    </form>
  );
}
