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
import { useSession } from "@inrupt/solid-ui-react";
import { useTable } from "react-table";
import clsx from "clsx";
import { useRouter } from "next/router";
import {
  DrawerContainer,
  Table as PrismTable,
} from "@inrupt/prism-react-components";
import { useRedirectIfLoggedOut } from "../../../../../src/effects/auth";
import usePodRootUri from "../../../../../src/hooks/usePodRootUri";
import ResourceAccessDrawer from "../resourceAccessDrawer";
import Spinner from "../../../../spinner";

export default function AgentResourceAccessShowPage() {
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const bem = PrismTable.useBem();
  useRedirectIfLoggedOut();
  const router = useRouter();
  const { session, fetch } = useSession();
  const decodedIri = decodeURIComponent(router.query.webId);
  const podRoot = usePodRootUri(session.info.webId);
  const [resources, setResources] = useState([]);
  const [accessList, setAccessList] = useState([]);
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(null);
  const [selectedAccessList, setSelectedAccessList] = useState(null);
  const [resourcesError, setResourcesError] = useState(null);
  const [shouldUpdate, setShouldUpdate] = useState(false);

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

  return (
    <DrawerContainer drawer={drawer} open={selectedResourceIndex !== null}>
      <div>
        <h3>
          FIXME: Ignore this page while testing - it will be replaced with
          SOLIDOS-322
        </h3>
        <table className={clsx(tableClass, bem("table"))} {...getTableProps()}>
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
      </div>
    </DrawerContainer>
  );
}
