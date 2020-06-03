import React, { ComponentType, useEffect, useState, ReactElement } from "react";

import PropTypes from "prop-types";
import Head from "next/head";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import ISolidSession from "@inrupt/solid-auth-fetcher/dist/solidSession/ISolidSession";
import { getSession } from "@inrupt/solid-auth-fetcher";

// import Header from '../components/header';
import theme from "../src/theme";
import UserContext from "../src/contexts/UserContext";
import PodManagerHeader from "../components/header";

/* eslint @typescript-eslint/no-explicit-any: 0 */
interface AppProps {
  Component: ComponentType;
  pageProps: any;
}

export default function App(props: AppProps): ReactElement {
  const { Component, pageProps } = props;

  const [session, setSession] = useState<ISolidSession | undefined>();
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Remove injected serverside JSS
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // Update the session when a page is loaded
  useEffect(() => {
    setIsLoadingSession(true);

    // Remove the server-side injected CSS.
    async function fetchSession() {
      const sessionStorage = (await getSession()) as ISolidSession;
      setSession(sessionStorage);
      setIsLoadingSession(false);
    }

    fetchSession();
  }, [Component, pageProps, setSession, setIsLoadingSession]);

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
          <PodManagerHeader />
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
