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

import React, { useContext, useEffect, useState } from "react";
import { CircularProgress } from "@material-ui/core";
import { useSession } from "@inrupt/solid-ui-react";
import { fetchProfile } from "../../../src/solidClientHelpers/profile";
import AgentAccessTable from "./agentAccessTable";
import AccessControlContext from "../../../src/contexts/accessControlContext";
import usePermissions from "../../../src/hooks/usePermissions";

export const TESTCAFE_ID_AGENT_ACCESS_LIST_SHOW_ALL =
  "agent-access-list-show-all";

function ResourceSharing() {
  const { accessControl } = useContext(AccessControlContext);
  const { permissions } = usePermissions(accessControl);
  const { fetch } = useSession();
  const [permissionsWithProfiles, setPermissionsWithProfiles] = useState(null);

  useEffect(() => {
    if (!permissions) return;
    Promise.all(
      permissions.map(async (p) => {
        let profile;
        let profileError;
        try {
          profile = await fetchProfile(p.webId, fetch);
        } catch (error) {
          profileError = error;
        }
        return {
          ...p,
          profile,
          profileError,
        };
      })
    ).then((completed) => setPermissionsWithProfiles(completed));
  }, [permissions, fetch]);

  if (!permissions || !permissionsWithProfiles)
    return <CircularProgress color="primary" />;

  // TODO: replace arrays with the new policies once they are available

  const editors = permissionsWithProfiles
    .filter((p) => p.acl.read && p.acl.write)
    .sort();

  const viewers = permissionsWithProfiles
    .filter((p) => p.acl.read && !p.acl.write && !p.acl.append)
    .sort();
  const blocked = [];

  return (
    <>
      <AgentAccessTable permissions={editors} type="editors" />
      <AgentAccessTable permissions={viewers} type="viewers" />
      <AgentAccessTable permissions={blocked} type="blocked" />
    </>
  );
}

export default ResourceSharing;
