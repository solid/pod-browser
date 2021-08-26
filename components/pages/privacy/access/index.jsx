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

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useSession,
  CombinedDataProvider,
  Text,
  Image,
} from "@inrupt/solid-ui-react";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import PropTypes from "prop-types";
import {
  Avatar,
  Box,
  Paper,
  Typography,
  createStyles,
} from "@material-ui/core";
import { foaf, vcard } from "rdf-namespaces";
import Link from "next/link";
import {
  BackToNav,
  BackToNavLink,
  Container,
  DrawerContainer,
  Drawer,
} from "@inrupt/prism-react-components";
import Tabs from "../../../tabs";
import usePodRootUri from "../../../../src/hooks/usePodRootUri";
import { useRedirectIfLoggedOut } from "../../../../src/effects/auth";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_NAME_TITLE = "profile-name-title";
export const TESTCAFE_ID_NAME_FIELD = "profile-name-field";
export const TESTCAFE_ID_ROLE_FIELD = "profile-role-field";
export const TESTCAFE_ID_ORG_FIELD = "profile-org-field";
export const TESTCAFE_ID_TAB_PERMISSIONS = "permissions-tab";
export const TESTCAFE_ID_TAB_PROFILE = "profile-tab";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...other}
    >
      {value === index && (
        <Box p={1} mt={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  index: PropTypes.any.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.any.isRequired,
};

export default function AgentAcpShow() {
  useRedirectIfLoggedOut();
  const router = useRouter();
  const decodedIri = decodeURIComponent(router.query.webId);
  const { fetch, session } = useSession();
  const podRoot = usePodRootUri(session.info.webId);
  const [selectedTabValue, setSelectedTabValue] = useState("Permissions");
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTabValue(newValue);
  };

  const classes = useStyles();

  const tabs = [
    {
      label: "Permissions",
      testid: TESTCAFE_ID_TAB_PERMISSIONS,
      value: "Permissions",
    },
    {
      label: "Profile",
      testid: TESTCAFE_ID_TAB_PROFILE,
      value: "Profile",
    },
  ];

  const query = `
  {
    pod( iri: "${podRoot}") {
      name,
      id,
      identifier,
      accessByAgent(agent: "${decodedIri}") {
        agent
        allow
        deny
        resource
      },
    }
  }
  `;

  useEffect(() => {
    if (!podRoot || !decodedIri) return;
    fetch("https://access.pod.inrupt.com/graphql/", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  }, [decodedIri, fetch, podRoot, query]);

  const link = (
    <Link href="/privacy" passHref>
      <BackToNavLink>privacy</BackToNavLink>
    </Link>
  );

  const drawer = (
    <Drawer
      open={selectedAgentIndex !== null}
      close={() => setSelectedAgentIndex(null)}
    >
      <div>TODO</div>
    </Drawer>
  );

  return (
    <DrawerContainer drawer={drawer} open={selectedAgentIndex !== null}>
      <BackToNav link={link} />
      <CombinedDataProvider
        datasetUrl={decodedIri}
        thingUrl={decodedIri}
        // onError={setError}
      >
        <Box alignItems="center" display="flex">
          <Box>
            <Avatar className={classes.avatar}>
              <Image
                property={vcard.hasPhoto}
                width={120}
                // errorComponent={errorComponent}
              />
            </Avatar>
          </Box>

          <Box p={2}>
            <h3>
              <Text className={classes.avatarText} property={foaf.name} />
              <a
                className={classes.headerLink}
                href={decodedIri}
                rel="noreferrer"
                target="_blank"
              >
                {decodedIri}
              </a>
            </h3>
          </Box>
        </Box>
        <Tabs
          tabs={tabs}
          handleTabChange={handleTabChange}
          selectedTabValue={selectedTabValue}
        />
        <TabPanel value={selectedTabValue} index="Permissions">
          Permissions
          <button type="button" onClick={() => setSelectedAgentIndex(1)}>
            Open Drawer
          </button>
        </TabPanel>
        <TabPanel value={selectedTabValue} index="Profile">
          Profile
        </TabPanel>
      </CombinedDataProvider>
    </DrawerContainer>
  );
}
