import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

// import Header from '../components/header';
import theme from '../src/theme';
import UserContext from '../src/contexts/UserContext';
import { getSession } from '../lib/solid-auth-fetcher/dist';

interface AppProps {
  Component: React.ComponentType;
  pageProps: any;
}

export default function App(props: AppProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [session, setSession] = useState(null);
  const { Component, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    async function fetchSession() {
      const sessionStorage = await getSession();
      if (sessionStorage && sessionStorage.webId) {
        setSession(sessionStorage);
        setIsLoadingSession(false);
      }
    }
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
    fetchSession();
  }, []);

  return (
    <>
      <Head>
        <title>My page</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <ThemeProvider theme={theme}>
        <UserContext.Provider value={{ session, isLoadingSession }}>
          <CssBaseline />
          {/* eslint react/jsx-props-no-spreading: 0 */}
          <Component {...pageProps} />
        </UserContext.Provider>
      </ThemeProvider>
    </>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  /* eslint react/forbid-prop-types: 0 */
  pageProps: PropTypes.object.isRequired,
};
