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
import { getSourceUrl } from "@inrupt/solid-client";
import { useState, useEffect, useContext, useMemo } from "react";
import {
  getAccessGrantAll,
  isValidAccessGrant,
} from "@inrupt/solid-client-access-grants";
import { getPolicyDetailFromAccess } from "../../accessControl/acp";
import AccessControlContext from "../../contexts/accessControlContext";
import useConsentBasedAccessForResource from "../useConsentBasedAccessForResource";
import {
  getRequestedAccessesFromSignedVc,
  getRequestorWebIdFromSignedVc,
} from "../../models/consent/signedVc";
import { isPublicAgentorAuthenticatedAgentWebId } from "../../../components/resourceDetails/utils";
import { fetchProfile } from "../../solidClientHelpers/profile";

const normalizeConsentBasedPermissions = (consentBasedPermissions) => {
  if (!consentBasedPermissions) return [];
  const requestedAccessModes = consentBasedPermissions.map((vc) => {
    const accessMode = {
      read: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Read")
      ),
      write: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Write")
      ),
      append: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Append")
      ),
      control: getRequestedAccessesFromSignedVc(vc).mode.some((el) =>
        el.includes("Control")
      ),
    };
    return {
      acl: accessMode,
      vc,
    };
  });

  const normalizedPermissions = requestedAccessModes.map(({ acl, vc }) => {
    return {
      type: "agent",
      acl,
      webId: getRequestorWebIdFromSignedVc(vc),
      alias: getPolicyDetailFromAccess(acl, "name"),
      vc,
    };
  });
  return normalizedPermissions;
};

export default function useAllPermissions() {
  const { accessControl } = useContext(AccessControlContext);
  const [permissions, setPermissions] = useState([]);
  const { solidDataset: dataset } = useContext(DatasetContext);
  const datasetUrl = getSourceUrl(dataset);
  const { fetch } = useSession();

  // this function used to be a hook and I brought it in here to reduce rerender
  const tempFunction = (resourceUrl) => {
    let permissions = [];
    let permissionsError = "";
    if (!resourceUrl) return { permissions, permissionsError: "Invalid Url" };
    async function checkVcValidity(vc) {
      try {
        const response = await isValidAccessGrant(vc, { fetch });
        return response;
      } catch (err) {
        return null;
      }
    }
    (async () => {
      try {
        const access = await getAccessGrantAll(resourceUrl, { fetch });
        const validVcs = await Promise.all(
          access.map(async (vc) => {
            const isValidVc = await checkVcValidity(vc);
            if (!isValidVc.errors.length) {
              return vc;
            }
            return null;
          })
        );
        const permissionsWithNullsRemoved = validVcs.filter(
          (vc) => vc !== null
        );
        permissions = permissionsWithNullsRemoved;
      } catch (err) {
        permissionsError = err;
      }
    })();
    return { permissions, permissionsError };
  };

  const { permissions: consentBasedPermissions } = tempFunction(datasetUrl);

  const removePermission = (p) => {
    const newPermissions = permissions.filter((permission) => {
      // eslint-disable-next-line eqeqeq
      return permission.vc.id != p.vc.id;
    });
    setPermissions(newPermissions);
  };

  const normalizedConsentPermissions = useMemo(
    () => normalizeConsentBasedPermissions(consentBasedPermissions),
    [consentBasedPermissions]
  );

  // this function used to be a hook and I brought it in here to reduce rerender
  const getPermissionsWithProfiles = () => {
    let permissionsWithProfiles = [];
    Promise.all(
      permissions.map(async (p) => {
        let profile;
        let profileError;
        if (isPublicAgentorAuthenticatedAgentWebId(p.webId)) return p;
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
    ).then((response) => {
      permissionsWithProfiles = response;
    });
    return { permissionsWithProfiles };
  };

  // useEffect(() => { // add this back in again when we figure out exactly what changes that needs useEffect
  console.log("In useEffect for useAllPermissions. What keeps changing? ");

  // if (!accessControl) { // i think this changes more than it should trigering rerenders, do we check this somewhere else?
  //   setPermissions([]);
  //   return;
  // }

  accessControl.getAllPermissionsForResource().then((normalizedPermissions) => {
    console.log("are these the same?: ", [
      ...normalizedPermissions,
      ...normalizedConsentPermissions,
    ]);
    console.log(
      "shallow",
      permissions == [...normalizedPermissions, ...normalizedConsentPermissions]
    );
    console.log(
      "deep: ",
      permissions ===
        [...normalizedPermissions, ...normalizedConsentPermissions]
    );
    setPermissions([...normalizedPermissions, ...normalizedConsentPermissions]);
  });
  // datasetUrl was a useEffect dependency in useConsentBasedAccessForResource
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [normalizedConsentPermissions]); // this should be in there but I took it out, still a lot of rerenders normalizedConsentPermissions accessControl

  return {
    permissions,
    removePermission,
    setPermissions,
    getPermissionsWithProfiles,
  };
}
