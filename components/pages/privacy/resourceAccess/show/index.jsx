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
import { CombinedDataProvider, useSession, Text } from "@inrupt/solid-ui-react";
import { useRouter } from "next/router";
import T from "prop-types";
import { schema, foaf } from "rdf-namespaces";
import { makeStyles } from "@material-ui/styles";
import { useSortBy, useTable } from "react-table";
import clsx from "clsx";
import { useBem } from "@solid/lit-prism-patterns";
import {
  DrawerContainer,
  Table as PrismTable,
  BackToNav,
  BackToNavLink,
  Icons,
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
import Spinner from "../../../../spinner";
import ResourceAccessDrawer, { getAllowModes } from "../resourceAccessDrawer";
import SortedTableCarat from "../../../../sortedTableCarat";
import { getAcpAccessDetails } from "../../../../../src/accessControl/acp";
import { getResourceName } from "../../../../../src/solidClientHelpers/resource";
import { isContainerIri } from "../../../../../src/solidClientHelpers/utils";
import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_TAB_PERMISSIONS = "permissions-tab";
export const TESTCAFE_ID_TAB_PROFILE = "profile-tab";
export const USER_ACCESS_STRING = "has access to these resources";

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
  const bem = useBem(classes);

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
        header: "Icon",
        accessor: "icon",
        disableSortBy: true,
      },
      {
        Header: "Name",
        accessor: "resource",
      },
      {
        Header: "Access",
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      defaultCanSort: true,
    },
    useSortBy
  );

  if (resourcesError) {
    return resourcesError.toString();
  }

  if (shouldUpdate) {
    return <Spinner />;
  }
  // FIXME: using a conditional dataset provider wrapper while we mock app profiles
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
            <p>
              {/* FIXME: Temporary workaround for mockApp name since there is no dataset */}
              {type === schema.SoftwareApplication && <span>MockApp</span>}
              {type !== schema.SoftwareApplication && (
                <Text property={foaf.name} />
              )}
              {` `}
              {USER_ACCESS_STRING}
            </p>
            {resources.length === 0 && <Spinner />}
            {resources.length !== 0 && (
              <div className={bem("table__container")}>
                <table
                  className={clsx(tableClass, bem("table"))}
                  {...getTableProps()}
                >
                  <thead className={bem("table__header")}>
                    {headerGroups.map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        {...headerGroup.getHeaderGroupProps()}
                      >
                        {headerGroup.headers.map((column) => (
                          <td
                            key={column.id}
                            className={bem("table__head-cell")}
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                          >
                            {column.render("Header")}
                            {` `}
                            <SortedTableCarat
                              sorted={column.isSorted}
                              sortedDesc={column.isSortedDesc}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {rows.map((row, i) => {
                      prepareRow(row);
                      const details = row.original;
                      const resourceName = details && getResourceName(details);
                      const resurceAccess = accessList.filter(
                        ({ resource }) => resource === row.original
                      );
                      const allowModes = getAllowModes(resurceAccess);
                      const modes = allowModes?.map((mode) => {
                        return {
                          read: !!mode.includes("Read"),
                          write: !!mode.includes("Write"),
                          append: !!mode.includes("Append"),
                          control: !!mode.includes("Control"),
                        };
                      });
                      const accessDetails = modes?.map((mode) => {
                        return getAcpAccessDetails(mode);
                      });
                      const accessDetailsName = accessDetails?.map(
                        ({ name }) => name
                      );
                      return (
                        <tr
                          key={details}
                          className={bem("table__body-row")}
                          onClick={() => setSelectedResourceIndex(i)}
                        >
                          <td className={bem("table__body-cell")}>
                            <Icons
                              name={
                                details && isContainerIri(details)
                                  ? "folder"
                                  : "file"
                              }
                              className={bem("access-details", "icon")}
                            />
                          </td>
                          <td>{resourceName}</td>
                          <td>{accessDetailsName?.join(", ")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
