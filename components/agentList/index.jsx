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

import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useBem } from "@solid/lit-prism-patterns";
import { Container, Table as PrismTable } from "@inrupt/prism-react-components";
import { asUrl, createSolidDataset } from "@inrupt/solid-client";
import {
  Table,
  TableColumn,
  useSession,
  useThing,
} from "@inrupt/solid-ui-react";
import { vcard, foaf, schema } from "rdf-namespaces";
import SortedTableCarat from "../sortedTableCarat";
import Spinner from "../spinner";
import AgentAvatar from "../agentAvatar";
import styles from "./styles";

import { useRedirectIfLoggedOut } from "../../src/effects/auth";
import { mockApp } from "../../__testUtils/mockApp";
import AgentResourceAccessLink from "../agentResourceAccessLink";
import SearchContext from "../../src/contexts/searchContext";
import usePodRootUri from "../../src/hooks/usePodRootUri";
import useAgentsProfiles from "../../src/hooks/useAgentsProfiles";
import AgentsEmptyState from "./emptyState";

const namePredicate = foaf.name;
const hasPhotoPredicate = vcard.hasPhoto;

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export const TESTCAFE_ID_AGENT_DRAWER = "agent-details-drawer";

// temporarily using mock data for apps for dev purposes until we have audit list
const app = mockApp();

const RowAvatar = ({ value, row }) => (
  <AgentAvatar altText={row.values.col1} imageUrl={value} />
);

const WebIdRow = () => {
  const { thing } = useThing();
  return asUrl(thing);
};

function AgentList({ contactType, setSearchValues }) {
  useRedirectIfLoggedOut();
  const tableClass = PrismTable.useTableClass("table", "inherits");
  const classes = useStyles();
  const bem = useBem(classes);
  const { search } = useContext(SearchContext);
  const { session, fetch } = useSession();
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [agentsError, setAgentsError] = useState(null);
  const podRoot = usePodRootUri(session.info.webId);
  const [agentsForTable, setAgentsForTable] = useState([]);
  const { data: profiles, isValidating } = useAgentsProfiles(agents);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const dataset = createSolidDataset();
      if (contactType === schema.SoftwareApplication) {
        setAgentsForTable([{ dataset, thing: app }]);
        setLoading(false);
        return;
      }
      /* istanbul ignore next */
      if (!profiles) return;
      const things = profiles
        .map((thing) => {
          return {
            dataset,
            thing,
          };
        })
        .filter(({ thing }) => !!thing);
      /* istanbul ignore next */
      if (!things) return;
      setAgentsForTable(things);
      setLoading(false);

      if (contactType === "all") {
        /* istanbul ignore next */
        setAgentsForTable(
          things
            ? [...things, { dataset, thing: app }]
            : [{ dataset, thing: app }]
        );
        setLoading(false);
      }
    })();
  }, [profiles, contactType, fetch]);

  const query = `
  {
    pod(iri: "${podRoot}") {
      agentsWithAccess,
      accessType,
    }
  }
  `;
  useEffect(() => {
    /* istanbul ignore next */
    if (!podRoot) return;
    /* istanbul ignore next */
    fetch("https://access.pod.inrupt.com/graphql/", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((response) => response.json())
      .catch((error) => setAgentsError(error))
      .then(({ data }) => {
        if (!data) return;
        const { agentsWithAccess } = data.pod;
        setAgents(
          agentsWithAccess.filter((webId) => webId !== session.info.webId)
        );
      });
  }, [query, podRoot, fetch, session]);

  useEffect(() => {
    if (!profiles) return;
    setSearchValues(profiles);
  }, [profiles, setSearchValues]);

  /* istanbul ignore next */
  if (agentsError) return agentsError.toString();

  const isLoading = loading || !agents || isValidating;

  if (isLoading) return <Spinner />;

  if (!agentsForTable.length && !agentsError) {
    return <AgentsEmptyState />;
  }

  return (
    <Container>
      <Table
        things={agentsForTable}
        className={clsx(tableClass, bem("table"))}
        filter={search}
        ascIndicator={<SortedTableCarat sorted />}
        descIndicator={<SortedTableCarat sorted sortedDesc />}
        getRowProps={(row, contact) => {
          return {
            tabIndex: "0",
            className: clsx(
              bem(
                "table__body-row",
                "selectable",
                contact === agentsForTable[selectedAgentIndex]
                  ? "selected"
                  : null
              )
            ),
            onKeyUp: (event) => {
              if (event.key === "Enter") setSelectedAgentIndex(row.index);
            },
            onClick: () => {
              setSelectedAgentIndex(row.index);
            },
          };
        }}
      >
        <TableColumn
          property={hasPhotoPredicate}
          header=""
          dataType="url"
          body={RowAvatar}
        />
        <TableColumn
          property={namePredicate}
          header="Name"
          filterable
          sortable
          body={AgentResourceAccessLink}
        />
        <TableColumn
          property={namePredicate}
          header="WebID"
          body={WebIdRow}
          filterable
          sortable
        />
      </Table>
    </Container>
  );
}

AgentList.propTypes = {
  contactType: PropTypes.string,
  setSearchValues: PropTypes.func.isRequired,
};

AgentList.defaultProps = {
  contactType: "",
};

RowAvatar.propTypes = {
  value: PropTypes.string,
  row: PropTypes.shape({
    values: PropTypes.shape({
      col1: PropTypes.string,
    }),
  }),
};

RowAvatar.defaultProps = {
  value: null,
  row: null,
};

export default AgentList;
