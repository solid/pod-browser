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

import { DatasetContext, useSession } from "@inrupt/solid-ui-react";
import { getSourceUrl, universalAccess } from "@inrupt/solid-client";

import { useState, useEffect, useContext, useMemo } from "react";
import { getPolicyDetailFromAccess } from "../../accessControl/acp";
import AccessControlContext from "../../contexts/accessControlContext";
import useConsentBasedAccessForResource from "../useConsentBasedAccessForResource";
import {
  getRequestedAccessesFromSignedVc,
  getRequestorWebIdFromSignedVc,
} from "../../models/consent/signedVc";
import { isPublicAgentorAuthenticatedAgentWebId } from "../../../components/resourceDetails/utils";
import { fetchProfile } from "../../solidClientHelpers/profile";

// const normalizeConsentBasedPermissions = (consentBasedPermissions) => {
//   if (!consentBasedPermissions) return [];
//   const requestedAccessModes = consentBasedPermissions.map((vc) => {
//     const accessMode = {
//       read: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
//         el.includes("Read")
//       ),
//       write: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
//         el.includes("Write")
//       ),
//       append: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
//         el.includes("Append")
//       ),
//       control: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
//         el.includes("Control")
//       ),
//     };
//     return {
//       acl: accessMode,
//       vc,
//     };
//   });

//   const normalizedPermissions = requestedAccessModes.map(({ acl, vc }) => {
//     return {
//       type: "agent",
//       acl,
//       webId: getRequestorWebIdFromSignedVc(vc),
//       alias: getPolicyDetailFromAccess(acl, "name"),
//       vc,
//     };
//   });
//   return normalizedPermissions;
// };

// export default function useAllPermissions() {
//   const { accessControl } = useContext(AccessControlContext);
//   const [permissions, setPermissions] = useState([]);

//   const { solidDataset: dataset } = useContext(DatasetContext);
//   console.log("Is this causing the rerenders", dataset);
//   const datasetUrl = getSourceUrl(dataset);

//   const { permissions: consentBasedPermissions } =
//     useConsentBasedAccessForResource(datasetUrl);

//   const normalizedConsentPermissions = useMemo(
//     () =>
//       consentBasedPermissions
//         ? normalizeConsentBasedPermissions(consentBasedPermissions)
//         : [],
//     [consentBasedPermissions]
//   );

//   useEffect(() => {
//     if (!accessControl) {
//       setPermissions([]);
//       return;
//     }

//     accessControl
//       .getAllPermissionsForResource()
//       .then((normalizedPermissions) => {
//         setPermissions([
//           ...normalizedPermissions,
//           ...normalizedConsentPermissions,
//         ]);
//       });
//   }, [accessControl, normalizedConsentPermissions]);

//   return {
//     permissions,
//   };
// }

// interface Group {
//   name: string;              // editors, friends, family, etc: descriptive text
//   permissions: AccessModes[] // permissions required for "editors" { edit / control / write }
//   members: WebId[]           // each agent that has edit permission on the resource
// }

const findSharingTypeForAgents = (agents) => {
  const outputArray = [];
  Object.keys(agents).forEach((key) => {
    const tempObj = {};
    tempObj.webId = key;
    tempObj.permissions = agents[key];
    const access = {
      read: tempObj.permissions.read,
      append: tempObj.permissions.append,
      write: tempObj.permissions.write,
    };
    const alias = getPolicyDetailFromAccess(access, "name");
    tempObj.alias = alias;
    outputArray.push(tempObj);
  });
  return outputArray;
};

const mapAgentsToSharingType = (agents) => {
  const sharingTypeHash = {};
  const output = [];
  agents.forEach((agent) => {
    const { alias } = agent;
    if (sharingTypeHash[alias]) {
      sharingTypeHash[alias].push(agent);
    } else {
      sharingTypeHash[alias] = [agent];
    }
  });
  Object.keys(sharingTypeHash).forEach((key) => {
    output.push({ type: key, data: sharingTypeHash[key] });
  });
  return output;
};

export default function useAllPermissions() {
  const { solidDataset: dataset } = useContext(DatasetContext);
  const { session } = useSession();
  const resourceIri = getSourceUrl(dataset);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getPermissions(resourceIri, fetch) {
    const { getAgentAccessAll } = universalAccess;
    const agents = await getAgentAccessAll(resourceIri, {
      fetch,
    });
    const agentsWithSharingType = findSharingTypeForAgents(agents);
    const sharingTypeWithAssociatedAgents = mapAgentsToSharingType(
      agentsWithSharingType
    );
    return sharingTypeWithAssociatedAgents;
  }

  useEffect(() => {
    setLoading(true);
    async function fetchPermissions() {
      const newPermissions = await getPermissions(resourceIri, session.fetch);
      setPermissions(newPermissions);
      console.log(
        "permissions in useEffect hook in useAllPermissionsHook",
        permissions
      );
    }
    fetchPermissions();
    setLoading(false);
  }, [permissions, resourceIri, session.fetch]);

  async function setAgentPermissions(resourceIri, agent, access, fetch) {
    console.log("permissions before func gets called", permissions);
    try {
      const res = await universalAccess.setAgentAccess(
        resourceIri,
        agent,
        access,
        { fetch }
      );
      console.log("after set func", { res, resourceIri, agent, access });
      const newPermissions = await getPermissions(resourceIri, fetch);
      console.log("updated permissions?", newPermissions);
      setPermissions(newPermissions);
    } catch (e) {
      console.log(e);
    }
  }

  async function setPublicPermissions(resourceIri, access, fetch) {
    try {
      universalAccess.setPublicAccess(resourceIri, access);
      // fetch new data after this.
      const newPermissions = await getPermissions(resourceIri, fetch);
      // setPermissions(newPermissions);
    } catch (e) {
      console.log(e);
    }
  }

  return {
    permissions,
    loading,
    setAgentPermissions,
    setPublicPermissions,
    getPermissions,
  };
}
