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

/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect, useState, useMemo } from "react";
import { CombinedDataProvider, useSession } from "@inrupt/solid-ui-react";
import { useRouter } from "next/router";
import T from "prop-types";
import { schema } from "rdf-namespaces";
import { makeStyles } from "@material-ui/styles";
import { useTable } from "react-table";
import clsx from "clsx";
import {
  DrawerContainer,
  Table as PrismTable,
  BackToNav,
  BackToNavLink,
} from "@inrupt/prism-react-components";
import { Box, createStyles } from "@material-ui/core";
import Link from "next/link";
import { useRedirectIfLoggedOut } from "../../../../../src/effects/auth";
import PersonAvatar from "../../../../profile/personAvatar";
import AppAvatar from "../../../../profile/appAvatar";
import PersonProfile from "../../../../profile/personProfile";
import AppProfile from "../../../../profile/appProfile";
import Tabs from "../../../../tabs";
import usePodRootUri from "../../../../../src/hooks/usePodRootUri";
import ResourceAccessDrawer from "../resourceAccessDrawer";
import Spinner from "../../../../spinner";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

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
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: T.node.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  index: T.any.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  value: T.any.isRequired,
};

export default function AgentResourceAccessShowPage({ type }) {
  useRedirectIfLoggedOut();
  const router = useRouter();
  const decodedIri = decodeURIComponent(router.query.webId);
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const bem = PrismTable.useBem();
  useRedirectIfLoggedOut();
  const { session, fetch } = useSession();
  const podRoot = usePodRootUri(session.info.webId);
  const [resources, setResources] = useState([]);
  const [accessList, setAccessList] = useState([]);
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(null);
  const [selectedAccessList, setSelectedAccessList] = useState(null);
  const [resourcesError, setResourcesError] = useState(null);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [selectedTabValue, setSelectedTabValue] = useState("Permissions");

  const link = (
    <Link href="/privacy" passHref>
      <BackToNavLink>privacy</BackToNavLink>
    </Link>
  );

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
    pod(iri: "${podRoot}" ) {
        accessByAgent(agent: "${decodedIri}" ) {
        agent
        allow
        resource
        }
    }
  }
  `;
  useEffect(() => {
    if (!podRoot) return;
    fetch("https://access.pod.inrupt.com/graphql/", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        setResourcesError(error);
      })
      .then(({ data }) => {
        if (!data) return;
        const { accessByAgent } = data.pod;
        setAccessList(accessByAgent);
        const resourceList = [
          ...new Set(data.pod.accessByAgent.map(({ resource }) => resource)),
        ];
        setResources(resourceList);
        setShouldUpdate(false);
      });
  }, [query, podRoot, fetch, session, shouldUpdate]);

  useEffect(() => {
    const selectedAccess = accessList.filter(
      ({ resource }) => resource === resources[selectedResourceIndex]
    );
    setSelectedAccessList(selectedAccess);
  }, [accessList, resources, selectedResourceIndex]);

  const drawer = (
    <ResourceAccessDrawer
      accessList={selectedAccessList}
      open={selectedResourceIndex !== null}
      onClose={() => setSelectedResourceIndex(null)}
      resourceIri={resources[selectedResourceIndex]}
      agentWebId={decodedIri}
      setShouldUpdate={setShouldUpdate}
    />
  );

  const columns = useMemo(
    () => [
      {
        header: "",
        accessor: "resource",
        modifiers: ["align-center", "width-preview"],
      },
    ],
    []
  );

  const data = useMemo(() => {
    if (!resources) {
      return [];
    }
    // showing the first 3 resources for dev purposes
    return resources;
  }, [resources]);

  const { getTableProps, getTableBodyProps } = useTable({ columns, data });

  if (resourcesError) {
    return resourcesError.toString();
  }

  if (shouldUpdate) {
    return <Spinner />;
  }
  const ConditionalWrapper = ({ condition, wrapper, children }) =>
    condition ? wrapper(children) : children;

  const renderAvatar = () => {
    if (type === schema.SoftwareApplication) {
      return <AppAvatar profileIri={decodedIri} />;
    }
    return <PersonAvatar profileIri={decodedIri} />;
  };

  const renderProfile = () => {
    if (type === schema.SoftwareApplication) {
      return <AppProfile profileIri={decodedIri} />;
    }
    return <PersonProfile profileIri={decodedIri} />;
  };

  return (
    <ConditionalWrapper
      condition={type !== schema.SoftwareApplication}
      wrapper={(children) => (
        <CombinedDataProvider datasetUrl={decodedIri} thingUrl={decodedIri}>
          {children}
        </CombinedDataProvider>
      )}
    >
      <DrawerContainer drawer={drawer} open={selectedResourceIndex !== null}>
        <div className={classes.container}>
          <BackToNav link={link} />
          {renderAvatar()}
          <Tabs
            tabs={tabs}
            handleTabChange={handleTabChange}
            selectedTabValue={selectedTabValue}
          />
          <TabPanel value={selectedTabValue} index="Permissions">
            <h3>Table layout to be added as part of 322</h3>
            <table
              className={clsx(tableClass, bem("table"))}
              {...getTableProps()}
            >
              <tbody className={bem("table__body")} {...getTableBodyProps()}>
                {data.map((resource, i) => {
                  return (
                    <tr
                      key={resource}
                      className={bem("table__body-row")}
                      onClick={() => setSelectedResourceIndex(i)}
                    >
                      <td className={bem("table__body-cell")}>{resource}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TabPanel>
          <TabPanel value={selectedTabValue} index="Profile">
            {renderProfile()}
          </TabPanel>
        </div>
      </DrawerContainer>
    </ConditionalWrapper>
  );
}

AgentResourceAccessShowPage.propTypes = {
  type: T.string.isRequired,
};
