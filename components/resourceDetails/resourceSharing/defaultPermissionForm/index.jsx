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

/* eslint-disable camelcase, no-console */

import React, { useState } from "react";
import T from "prop-types";
import { useSession } from "@inrupt/solid-ui-react";
import { isContainerIri } from "../../../../src/solidClientHelpers/utils";
import {
  ACL,
  saveDefaultPermissions,
} from "../../../../src/solidClientHelpers/permissions";
import { fetchProfile } from "../../../../src/solidClientHelpers/profile";
import AgentSearchForm from "../../../agentSearchForm";
import AgentAccessList from "../agentAccessList";

export function handleAgentAdd({ addedAgents, setAddedAgents, fetch }) {
  return async (agentId) => {
    try {
      const profile = await fetchProfile(agentId, fetch);
      const exists = addedAgents.some(({ webId: id }) => id === profile.webId);
      if (exists) return;

      setAddedAgents([
        ...addedAgents,
        {
          webId: profile.webId,
          profile,
          alias: ACL.NONE.alias,
          acl: ACL.NONE.acl,
        },
      ]);
    } catch ({ message }) {
      console.error(message);
    }
  };
}

export function handleAgentSubmit({ setAddedAgents, addedAgents, onSubmit }) {
  return (agent, access) => {
    setAddedAgents(addedAgents.filter((a) => a.webId !== agent.webId));
    onSubmit(agent, access);
  };
}

function DefaultPermissionForm({ iri, onSubmit }) {
  const [addedAgents, setAddedAgents] = useState([]);
  const {
    session: { fetch },
  } = useSession();
  const onAgentAdd = handleAgentAdd({
    addedAgents,
    setAddedAgents,
    fetch,
  });

  const onAgentSubmit = handleAgentSubmit({
    setAddedAgents,
    addedAgents,
    onSubmit,
  });

  if (!isContainerIri(iri)) return null;

  return (
    <>
      <AgentSearchForm onSubmit={onAgentAdd} heading="Grant Default Access" />
      <AgentAccessList
        permissions={addedAgents}
        iri={iri}
        saveFn={saveDefaultPermissions}
        onSubmit={onAgentSubmit}
      />
    </>
  );
}

DefaultPermissionForm.propTypes = {
  iri: T.string.isRequired,
  onSubmit: T.func,
};

DefaultPermissionForm.defaultProps = {
  onSubmit: () => {},
};

export default DefaultPermissionForm;
