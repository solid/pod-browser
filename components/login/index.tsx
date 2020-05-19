import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Button,
  Typography,
} from '@material-ui/core';

import WebIdLogin from './webid';
import ProviderLogin from './provider';


export const LOGIN_TYPES = {
  WEB_ID: 'WebID',
  PROVIDER: 'Identity Provider',
};


export function swapLoginType(currentLoginType: string, setFn: Function) {
  if (currentLoginType === LOGIN_TYPES.WEB_ID) {
    return setFn(LOGIN_TYPES.PROVIDER);
  }

  return setFn(LOGIN_TYPES.WEB_ID);
}


export default function Login() {
  const [loginType, setLoginType] = useState(LOGIN_TYPES.PROVIDER);

  const onSwapTypeClick = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault();
    swapLoginType(loginType, setLoginType);
  };

  return (
    <Container maxWidth="sm">
      <Typography align="center" component="div">
        <h1>Hi! Welcome to Solid.</h1>

        <Box my={4}>
          <Link href="/register">
            <a>
              Register for a Solid Identity
            </a>
          </Link>

          <p>
            <a href="https://solid.inrupt.com/get-a-solid-pod" rel="nofollow">
              What is a Solid Identity?
            </a>
          </p>

          <Typography variant="h5">
            Log In
          </Typography>

          { loginType === LOGIN_TYPES.WEB_ID ? (
            <WebIdLogin />
          ) : (
            <ProviderLogin />
          )}

          {/* TODO: replace this with a real URL that stores current provider choice in state */}
          <Button onClick={onSwapTypeClick} className="button--login">
            {'Log In with '}
            { loginType === LOGIN_TYPES.WEB_ID ? LOGIN_TYPES.PROVIDER : LOGIN_TYPES.WEB_ID }
          </Button>
        </Box>
      </Typography>
    </Container>
  );
}
