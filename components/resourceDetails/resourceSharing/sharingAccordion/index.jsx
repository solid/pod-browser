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

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { Alert, Skeleton } from "@material-ui/lab";
import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSourceUrl } from "@inrupt/solid-client";
import AgentAccessTable from "../agentAccessTable";
import AdvancedSharingButton from "../advancedSharingButton";
import { namedPolicies, customPolicies } from "../../../../constants/policies";
import { isContainerIri } from "../../../../src/solidClientHelpers/utils";
import PermissionsContext from "../../../../src/contexts/permissionsContext";
import AgentAccessSharingList from "../agentAccessSharingList";
import PermissionsPanel from "../PermissionsPanel";
import { preparePermissionsDataForTable } from "../../utils";
import useAllPermissions from "../../../../src/hooks/useAllPermissions";

export const TESTCAFE_ID_AGENT_ACCESS_LIST_SHOW_ALL =
  "agent-access-list-show-all";

// function getEditPermissions(permissions) {
//   const permissionsList = permissions.filter(
//     ({ alias }) => alias === "editors"
//   );
//   return preparePermissionsDataForTable(permissionsList);
// }

// function getViewPermissions(permissions) {
//   const permissionsList = permissions.filter(
//     ({ alias }) => alias === "viewers"
//   );
//   return preparePermissionsDataForTable(permissionsList);
// }

function SharingAccordion() {
  const router = useRouter();
  const isContainer = isContainerIri(router.query.resourceIri);
  const { permissions, loading, getPermissions } = useAllPermissions();
  const { session } = useSession();
  const { solidDataset: dataset } = useContext(DatasetContext);
  const resourceIri = getSourceUrl(dataset);

  useEffect(() => {
    getPermissions(resourceIri, session.fetch);
  }, [getPermissions, resourceIri, session.fetch]);

  console.log("sharing accordion", { permissions });
  return (
    <>
      <PermissionsPanel
        permissionType="editors"
        permissions={permissions.editors}
        resourceIri={resourceIri}
      />
      <PermissionsPanel
        permissionType="viewers"
        permissions={permissions.viewers}
        resourceIri={resourceIri}
      />

      {/* ; isContainer && (
      <Alert icon={false} severity="info">
        Sharing applies to all items in this folder
      </Alert>
      ); } advanced sharing button is not REFACTOR yet and could cause rerenders
      <AdvancedSharingButton loading={loading} setLoading={setLoading} /> */}
    </>
  );
}

export default SharingAccordion;
