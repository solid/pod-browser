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

/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint @typescript-eslint/no-explicit-any: 0 */
import React, { ComponentType, ReactElement, useEffect, useState } from "react";

import PropTypes from "prop-types";
import Head from "next/head";
import CssBaseline from "@material-ui/core/CssBaseline";
import auth from "solid-auth-client";

import {
  createStyles,
  makeStyles,
  StylesProvider,
  ThemeProvider,
} from "@material-ui/styles";

import { create } from "jss";
import preset from "jss-preset-default";

import { StyleRules } from "@material-ui/styles/withStyles";
import { appLayout, useBem } from "@solid/lit-prism-patterns";
import theme from "../src/theme";
import UserContext, { ISession } from "../src/contexts/userContext";
import { AlertProvider } from "../src/contexts/alertContext";
import Notification from "../components/notification";

import PodBrowserHeader from "../components/header";
import "./styles.css";

interface AppProps {
  Component: ComponentType;
  pageProps: any;
}

const jss = create(preset());

const useStyles = makeStyles(() =>
  createStyles(appLayout.styles(theme) as StyleRules)
);

export default function App(props: AppProps): ReactElement {
  const { Component, pageProps } = props;

  const [session, setSession] = useState<ISession | undefined>();
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const bem = useBem(useStyles());

  // Remove injected serverside JSS
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");

    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  useEffect(() => {
    auth.trackSession(setSession).catch((e) => {
      throw e;
    });
  }, []);

  // Update the session when a page is loaded
  useEffect(() => {
    setIsLoadingSession(true);

    // Remove the server-side injected CSS.
    async function fetchSession(): Promise<void> {
      const sessionStorage = await auth.currentSession();
      setSession(sessionStorage);
      setIsLoadingSession(false);
    }

    fetchSession().catch((e) => {
      throw e;
    });
  }, [Component, pageProps, setSession, setIsLoadingSession]);

  return (
    <>
      <Head>
        <title>Inrupt PodBrowser</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <StylesProvider jss={jss}>
        <ThemeProvider theme={theme}>
          <UserContext.Provider value={{ session, isLoadingSession }}>
            <AlertProvider>
              <CssBaseline />
              <div className={bem("app-layout")}>
                <PodBrowserHeader />
                <main className={bem("app-layout__main")}>
                  <Component {...pageProps} />
                </main>
              </div>

              <Notification />
            </AlertProvider>
          </UserContext.Provider>
        </ThemeProvider>
      </StylesProvider>
    </>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object,
};
